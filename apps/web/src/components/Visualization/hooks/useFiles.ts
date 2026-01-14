import { uniqBy } from "ramda";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SandwormFile } from "@sandworm/types";

import { useListFilesQuery, useDeleteFileMutation } from "@/generated/graphql";

import { NEXT_PUBLIC_API_URL } from "../utils/env";

import { tokenStorage } from "./useAuth";

function createNewUploadFile(file: File): UploadFile {
  return {
    status: "enqueued", // Waiting to start
    replace: false, // Don't replace by default
    file, // The actual File object
    abortController: new AbortController(), // Can cancel later
    uploaded: 0, // Bytes uploaded so far
    total: file.size, // Total bytes to upload
  };
}

export type UploadFile = {
  status: "enqueued" | "uploading" | "asking-replace";
  replace: boolean;
  file: File;
  abortController: AbortController;
  uploaded: number;
  total: number;
};

// What happened to a file after upload
export type UploadResult = {
  outcome: "unexpected" | "file-exists" | "aborted" | "success";
  file: File;
};

// Upload system states
type UploadingState = {
  _tag: "uploading";
  results: UploadResult[]; // Files already processed
  current: UploadFile; // File being uploaded now
  rest: File[]; // Files waiting in queue
  replaceAll: boolean; // Auto-replace all conflicts
};

type IdleState = {
  _tag: "idle";
  results: UploadResult[]; // Past upload results
};

export type FileUploadState = UploadingState | IdleState;

// What the hook returns
type State = {
  files: SandwormFile[]; // Current files in workspace
  deleting: Record<string, boolean>; // Which files are being deleted
  upload: FileUploadState; // Upload system state
};

type API = {
  del: (path: string) => Promise<void>; // Delete a file
  onDrop: (files: File[]) => void; // User drops files
  onReplaceYes: () => void; // User clicks "Replace"
  onReplaceAll: () => void; // User clicks "Replace All"
  onReplaceNo: () => void; // User clicks "Skip"
  onAbort: (file: File) => void; // Cancel upload
  onRemoveResult: (file: File) => void; // Clear upload result
};

type UseFiles = [State, API];

/* =======================
   MAIN HOOK
======================= */

export const useFiles = (
  workspaceId: string,
  refreshInterval?: number
): UseFiles => {
  /* ========================================
     STEP 1: Fetch existing files from server
     ======================================== */

  const { data, refetch } = useListFilesQuery({
    variables: { input: { workspaceId } },
    pollInterval:
      refreshInterval && refreshInterval > 0 ? refreshInterval : undefined,
  });

  const files = useMemo(() => data?.listFiles ?? [], [data]);

  /* ========================================
     STEP 2: Delete functionality
     ======================================== */

  const [deleteFileMutation] = useDeleteFileMutation();
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const deleteFile = useCallback(
    async (path: string) => {
      // Mark as deleting
      setDeleting(prev => ({ ...prev, [path]: true }));

      try {
        // Delete on server
        await deleteFileMutation({
          variables: { input: { workspaceId, path } },
        });
        // Refresh file list
        await refetch();
      } finally {
        // Mark as done
        setDeleting(prev => ({ ...prev, [path]: false }));
      }
    },
    [workspaceId, deleteFileMutation, refetch]
  );

  /* ========================================
     STEP 3: Upload system state
     ======================================== */

  const [uploadState, setUploadState] = useState<FileUploadState>({
    _tag: "idle",
    results: [],
  });

  /* ========================================
     STEP 4: User answers "file exists" dialog
     ======================================== */

  // User clicks "Replace"
  const handleReplaceYes = useCallback(() => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;
      if (currentState.current.status !== "asking-replace") return currentState;

      // Mark current file for replacement and continue
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

  // User clicks "Replace All"
  const handleReplaceAll = useCallback(() => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;

      // Set replaceAll flag for all future files
      const newState = { ...currentState, replaceAll: true };

      // If currently asking, also approve current file
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

  // User clicks "Skip"
  const handleReplaceNo = useCallback(() => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;
      if (currentState.current.status !== "asking-replace") return currentState;

      // Record that we skipped this file
      const newResults = [
        ...currentState.results,
        { outcome: "file-exists" as const, file: currentState.current.file },
      ];

      // Get next file from queue
      const [nextFile, ...remainingFiles] = currentState.rest;

      // No more files? Go idle
      if (!nextFile) {
        return { _tag: "idle", results: newResults };
      }

      // Continue with next file
      return {
        ...currentState,
        results: newResults,
        current: createNewUploadFile(nextFile),
        rest: remainingFiles,
      };
    });
  }, []);

  const moveToNextFile = (outcome: "success") => {
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;

      // Record what happened
      const newResults = [
        ...currentState.results,
        { outcome, file: currentState.current.file },
      ];

      // Get next file from queue
      const [nextFile, ...remainingFiles] = currentState.rest;

      // No more files? We're done!
      if (!nextFile) {
        return { _tag: "idle", results: newResults };
      }

      // Continue with next file
      return {
        ...currentState,
        results: newResults,
        current: createNewUploadFile(nextFile),
        rest: remainingFiles,
      };
    });
  };

  const handleUploadFailure = (error: any) => {
    console.error("Upload failed:", error);
    setUploadState(currentState => {
      if (currentState._tag !== "uploading") return currentState;

      // Figure out what went wrong
      const outcome = error.name === "CanceledError" ? "aborted" : "unexpected";

      // Record the failure
      const newResults = [
        ...currentState.results,
        { outcome, file: currentState.current.file },
      ];

      // Stop uploading, show results
      return { _tag: "idle", results: newResults };
    });
  };

  const handleFileDrop = useCallback((droppedFiles: File[]) => {
    // Remove duplicates (same filename)
    const uniqueFiles = uniqBy(f => f.name, droppedFiles);
    const [firstFile, ...restOfFiles] = uniqueFiles;

    if (!firstFile) return; // No files? Do nothing

    setUploadState(currentState => {
      // Not uploading? Start fresh
      if (currentState._tag === "idle") {
        return {
          _tag: "uploading",
          current: createNewUploadFile(firstFile),
          rest: restOfFiles,
          results: currentState.results,
          replaceAll: false,
        };
      }

      // Already uploading? Add to queue
      return {
        ...currentState,
        rest: [...currentState.rest, ...uniqueFiles],
      };
    });
  }, []);

  const handleAbort = useCallback(
    (fileToAbort: File) => {
      if (uploadState._tag !== "uploading") return;

      // Aborting current upload?
      if (uploadState.current.file === fileToAbort) {
        uploadState.current.abortController.abort();
        return;
      }

      // Remove from queue
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
    // Update UI to show "uploading"
    setUploadState(state =>
      state._tag === "uploading"
        ? { ...state, current: { ...state.current, status: "uploading" } }
        : state
    );

    // Get abort controller from current state
    const abortController =
      uploadState._tag === "uploading"
        ? uploadState.current.abortController
        : new AbortController();
    const token = tokenStorage.getToken();
    // Upload to server
    axios({
      url: `${NEXT_PUBLIC_API_URL()}/workspaces/${workspaceId}/files?replace=${replace}`,
      method: "POST",
      withCredentials: true,
      signal: abortController.signal,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": file.name,
        "X-File-Size": file.size.toString(),
        Authorization: `Bearer ${token}`,
      },
      data: file,

      // Update progress bar
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
      .finally(() => refetch()); // Always refresh file list
  };

  useEffect(() => {
    // Only run if we're uploading
    if (uploadState._tag !== "uploading") return;

    // Only run if current file is waiting to start
    if (uploadState.current.status !== "enqueued") return;

    const currentFile = uploadState.current.file;
    const shouldReplace = uploadState.current.replace || uploadState.replaceAll;
    const fileAlreadyExists = files.some(f => f.name === currentFile.name);

    // File exists and we haven't decided what to do? Ask user
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

    // File doesn't exist OR user approved replacement? Start upload!
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

/* =======================
   HELPER FUNCTION
   Creates a fresh upload file object
======================= */
