import { uniqBy } from "ramda";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SandwormFile } from "@sandworm/types";

import { useListFilesQuery, useDeleteFileMutation } from "@/generated/graphql";

import { NEXT_PUBLIC_API_URL } from "../../../utils/env";

// =====================================
// ⬢ Types
// =====================================
export type UploadFile = {
  status: "enqueued" | "uploading" | "asking-replace";
  replace: boolean;
  file: File;
  abortController: AbortController;
  uploaded: number;
  total: number;
};

export type UploadResult = {
  outcome: "unexpected" | "file-exists" | "aborted" | "too-large" | "success";
  file: File;
};

// Matches the API's Fastify `bodyLimit` (apps/api/src/main.ts) so we can
// reject an oversized file before spending time uploading it.
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

type UploadingState = {
  _tag: "uploading";
  results: UploadResult[];
  current: UploadFile;
  rest: File[];
  replaceAll: boolean;
};

type IdleState = {
  _tag: "idle";
  results: UploadResult[];
};

export type FileUploadState = UploadingState | IdleState;

type State = {
  files: SandwormFile[];
  deleting: Record<string, boolean>;
  upload: FileUploadState;
};

type API = {
  del: (path: string) => Promise<void>;
  onDrop: (files: File[]) => void;
  onReplaceYes: () => void;
  onReplaceAll: () => void;
  onReplaceNo: () => void;
  onAbort: (file: File) => void;
  onRemoveResult: (file: File) => void;
};

type UseFiles = [State, API];

function createNewUploadFile(file: File): UploadFile {
  return {
    status: "enqueued",
    replace: false,
    file,
    abortController: new AbortController(),
    uploaded: 0,
    total: file.size,
  };
}

// =====================================
// ⬢  Use Files Hook
// =====================================
export const useFiles = (
  workspaceId: string,
  refreshInterval?: number,
  path: string = "./"
): UseFiles => {
  // ⬢  Fetch existing files from server
  // =====================================
  const { data, refetch } = useListFilesQuery({
    variables: { input: { path: "./data", workspaceId } },
    skip: !workspaceId,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    pollInterval:
      refreshInterval && refreshInterval > 0 ? refreshInterval : undefined,
  });

  const files = useMemo(() => {
    return data?.listFiles ?? [];
  }, [data]);

  // ⬢ Delete File
  // =====================================
  const [deleteFileMutation] = useDeleteFileMutation();
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const deleteFile = useCallback(
    async (filePath: string) => {
      setDeleting(prev => ({ ...prev, [filePath]: true }));

      try {
        await deleteFileMutation({
          variables: { input: { workspaceId, path: filePath } },
        });
        await refetch();
      } finally {
        setDeleting(prev => ({ ...prev, [filePath]: false }));
      }
    },
    [workspaceId, deleteFileMutation, refetch]
  );

  // ⬢ Upload system state
  // =====================================
  const [uploadState, setUploadState] = useState<FileUploadState>({
    _tag: "idle",
    results: [],
  });

  // ⬢  User answers "file exists" dialog
  // =====================================
  const handleReplaceYes = useCallback(() => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;
      if (currentState.current.status !== "asking-replace") return currentState;

      return {
        ...currentState,
        current: {
          ...currentState.current,
          replace: true,
          status: "enqueued",
        },
      };
    });
  }, []);

  const handleReplaceAll = useCallback(() => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;

      const newState = { ...currentState, replaceAll: true };

      if (currentState.current.status === "asking-replace") {
        newState.current = {
          ...currentState.current,
          replace: true,
          status: "enqueued",
        };
      }

      return newState;
    });
  }, []);

  const handleReplaceNo = useCallback(() => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;
      if (currentState.current.status !== "asking-replace") return currentState;

      const newResults = [
        ...currentState.results,
        { outcome: "file-exists" as const, file: currentState.current.file },
      ];

      const [nextFile, ...remainingFiles] = currentState.rest;

      if (!nextFile) {
        return { _tag: "idle", results: newResults };
      }

      return {
        ...currentState,
        results: newResults,
        current: createNewUploadFile(nextFile),
        rest: remainingFiles,
      };
    });
  }, []);

  const moveToNextFile = (outcome: UploadResult["outcome"]) => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;

      const newResults = [
        ...currentState.results,
        { outcome, file: currentState.current.file },
      ];

      const [nextFile, ...remainingFiles] = currentState.rest;

      if (!nextFile) {
        return { _tag: "idle", results: newResults };
      }

      return {
        ...currentState,
        results: newResults,
        current: createNewUploadFile(nextFile),
        rest: remainingFiles,
      };
    });
  };
  // ⬢ Handle Upload Failure
  // =====================================
  const handleUploadFailure = (error: any) => {
    console.error("Upload failed:", error);
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;

      // Belt-and-suspenders: the client-side size check below should catch
      // this first, but the API's own limit is the source of truth (e.g. it
      // changes without this file being redeployed).
      const outcome: "aborted" | "unexpected" | "too-large" =
        error.name === "CanceledError"
          ? "aborted"
          : error.response?.status === 413
            ? "too-large"
            : "unexpected";

      const newResults = [
        ...currentState.results,
        { outcome, file: currentState.current.file },
      ];

      return { _tag: "idle", results: newResults };
    });
  };

  // ⬢ Handle File drop
  // =====================================
  const handleFileDrop = useCallback((droppedFiles: File[]) => {
    const uniqueFiles = uniqBy(f => f.name, droppedFiles);
    const [firstFile, ...restOfFiles] = uniqueFiles;

    if (!firstFile) return;

    setUploadState(currentState => {
      if (currentState._tag === "idle") {
        return {
          _tag: "uploading",
          current: createNewUploadFile(firstFile),
          rest: restOfFiles,
          results: currentState.results,
          replaceAll: false,
        };
      }

      return {
        ...currentState,
        rest: [...currentState.rest, ...uniqueFiles],
      };
    });
  }, []);

  // ⬢ Handle Abort File Upload
  // =====================================
  const handleAbort = useCallback(
    (fileToAbort: File) => {
      if (uploadState._tag !== "uploading") return;

      if (uploadState.current.file === fileToAbort) {
        uploadState.current.abortController.abort();
        return;
      }

      setUploadState(state =>
        state._tag === "uploading"
          ? { ...state, rest: state.rest.filter(f => f !== fileToAbort) }
          : state
      );
    },
    [uploadState]
  );

  const clearUploadResult = useCallback((file: File) => {
    setUploadState(state => ({
      ...state,
      results: state.results.filter(result => result.file !== file),
    }));
  }, []);

  const performUpload = (file: File, replace: boolean) => {
    setUploadState(state =>
      state._tag === "uploading"
        ? { ...state, current: { ...state.current, status: "uploading" } }
        : state
    );

    const abortController =
      uploadState._tag === "uploading"
        ? uploadState.current.abortController
        : new AbortController();
    axios({
      url: `${NEXT_PUBLIC_API_URL()}/workspaces/${workspaceId}/files?replace=${replace}`,
      method: "POST",
      withCredentials: true,
      signal: abortController.signal,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": file.name,
        "X-File-Size": file.size.toString(),
      },
      data: file,

      onUploadProgress: progressEvent => {
        setUploadState(state =>
          state._tag === "uploading" && state.current.status === "uploading"
            ? {
                ...state,
                current: { ...state.current, uploaded: progressEvent.loaded },
              }
            : state
        );
      },
    })
      .then(() => moveToNextFile("success"))
      .catch(err => handleUploadFailure(err))
      .finally(() => refetch());
  };

  useEffect(() => {
    if (uploadState._tag !== "uploading") return;

    if (uploadState.current.status !== "enqueued") return;

    const currentFile = uploadState.current.file;
    const shouldReplace = uploadState.current.replace || uploadState.replaceAll;
    const fileAlreadyExists = files.some(f => f.name === currentFile.name);

    if (fileAlreadyExists && !shouldReplace) {
      setUploadState(state =>
        state._tag === "uploading"
          ? {
              ...state,
              current: { ...state.current, status: "asking-replace" },
            }
          : state
      );
      return;
    }

    // Reject an oversized file before spending time uploading it — the API
    // would only reject it later with a 413, after the browser has already
    // pushed the whole thing over the wire.
    if (currentFile.size > MAX_UPLOAD_BYTES) {
      moveToNextFile("too-large");
      return;
    }

    performUpload(currentFile, shouldReplace);
  }, [uploadState, files, workspaceId, refetch]);

  return [
    {
      files,
      deleting,
      upload: uploadState,
    },
    {
      del: deleteFile,
      onDrop: handleFileDrop,
      onReplaceYes: handleReplaceYes,
      onReplaceAll: handleReplaceAll,
      onReplaceNo: handleReplaceNo,
      onAbort: handleAbort,
      onRemoveResult: clearUploadResult,
    },
  ];
};
