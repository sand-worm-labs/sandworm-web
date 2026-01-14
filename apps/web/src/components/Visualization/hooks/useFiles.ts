import { uniqBy } from "ramda";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SandwormFile } from "@sandworm/types";

import { useListFilesQuery, useDeleteFileMutation } from "@/generated/graphql";

import { NEXT_PUBLIC_API_URL } from "../utils/env";

export type UploadFile = {
  status: "enqueued" | "uploading" | "asking-replace";
  replace: boolean;
  file: File;
  abortController: AbortController;
  uploaded: number;
  total: number;
};

export type UploadResult = {
  outcome: "unexpected" | "file-exists" | "aborted" | "success";
  file: File;
};

export type UploadingFileUploadState = {
  _tag: "uploading";
  results: UploadResult[];
  current: UploadFile;
  rest: File[];
  replaceAll: boolean;
};

export type FileUploadState =
  | UploadingFileUploadState
  | {
    _tag: "idle";
    results: UploadResult[];
  };

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

/* =======================
   Hook
======================= */

export const useFiles = (
  workspaceId: string,
  refreshInterval?: number
): UseFiles => {
  /* ---------- GraphQL ---------- */

  const { data, refetch } = useListFilesQuery({
    variables: { input: { workspaceId } },
    pollInterval:
      refreshInterval && refreshInterval > 0 ? refreshInterval : undefined,
  });

  const [deleteFileMutation] = useDeleteFileMutation();

  const files = useMemo(() => data?.listFiles ?? [], [data]);
  console.log("useFiles files:", files);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const del = useCallback(
    async (path: string) => {
      setDeleting(d => ({ ...d, [path]: true }));
      try {
        await deleteFileMutation({
          variables: { input: { workspaceId, path } },
        });
        await refetch();
      } finally {
        setDeleting(d => ({ ...d, [path]: false }));
      }
    },
    [workspaceId, deleteFileMutation, refetch]
  );

  const [uploadState, setUploadState] = useState<FileUploadState>({
    _tag: "idle",
    results: [],
  });

  const onReplaceYes = useCallback(() => {
    setUploadState(s =>
      s._tag === "uploading" && s.current.status === "asking-replace"
        ? {
          ...s,
          current: { ...s.current, replace: true, status: "enqueued" },
        }
        : s
    );
  }, []);

  const onReplaceAll = useCallback(() => {
    setUploadState(s => {
      if (s._tag !== "uploading") return s;
      if (s.current.status !== "asking-replace") {
        return { ...s, replaceAll: true };
      }
      return {
        ...s,
        replaceAll: true,
        current: { ...s.current, replace: true, status: "enqueued" },
      };
    });
  }, []);

  const onReplaceNo = useCallback(() => {
    setUploadState(s => {
      if (s._tag !== "uploading") return s;
      if (s.current.status !== "asking-replace") return s;

      const [next, ...rest] = s.rest;
      const results = [
        ...s.results,
        { outcome: "file-exists" as const, file: s.current.file },
      ];

      if (!next) {
        return { _tag: "idle", results };
      }

      return {
        ...s,
        results,
        current: {
          status: "enqueued",
          replace: false,
          file: next,
          abortController: new AbortController(),
          uploaded: 0,
          total: next.size,
        },
        rest,
      };
    });
  }, []);

  /* ---------- Upload Effect ---------- */

  useEffect(() => {
    if (uploadState._tag !== "uploading") return;
    if (uploadState.current.status !== "enqueued") return;

    const fileExists = files.some(
      f => f.name === uploadState.current.file.name
    );

    if (!uploadState.current.replace && !uploadState.replaceAll && fileExists) {
      setUploadState(s =>
        s._tag === "uploading"
          ? { ...s, current: { ...s.current, status: "asking-replace" } }
          : s
      );
      return;
    }

    setUploadState(s =>
      s._tag === "uploading"
        ? { ...s, current: { ...s.current, status: "uploading" } }
        : s
    );

    const replace = uploadState.current.replace || uploadState.replaceAll;

    axios({
      url: `${NEXT_PUBLIC_API_URL()}/workspaces/${workspaceId}/files?replace=${replace}`,
      method: "POST",
      withCredentials: true,
      signal: uploadState.current.abortController.signal,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": uploadState.current.file.name,
        "X-File-Size": uploadState.current.file.size.toString(),
      },
      data: uploadState.current.file,
      onUploadProgress: e => {
        console.log("Upload progress:", e);
        setUploadState(s =>
          s._tag === "uploading" && s.current.status === "uploading"
            ? { ...s, current: { ...s.current, uploaded: e.loaded } }
            : s
        );
      },
    })
      .then(() => {
        setUploadState(s => {
          if (s._tag !== "uploading") return s;

          const [next, ...rest] = s.rest;
          const results = [
            ...s.results,
            { outcome: "success" as const, file: s.current.file },
          ];

          if (!next) {
            return { _tag: "idle", results };
          }

          return {
            ...s,
            results,
            current: {
              status: "enqueued",
              replace: false,
              file: next,
              abortController: new AbortController(),
              uploaded: 0,
              total: next.size,
            },
            rest,
          };
        });
      })
      .catch(err => {
        if (err.name === "CanceledError") {
          setUploadState(s =>
            s._tag === "uploading"
              ? {
                _tag: "idle",
                results: [
                  ...s.results,
                  { outcome: "aborted" as const, file: s.current.file },
                ],
              }
              : s
          );
        }
      })
      .finally(() => {
        refetch();
      });
  }, [uploadState, files, workspaceId, refetch]);

  /* ---------- Drop / Abort / Cleanup ---------- */

  const onDrop = useCallback((incoming: File[]) => {
    const files = uniqBy(f => f.name, incoming);
    const [first, ...rest] = files;
    if (!first) return;

    setUploadState(s =>
      s._tag === "idle"
        ? {
          _tag: "uploading",
          current: {
            status: "enqueued",
            file: first,
            abortController: new AbortController(),
            uploaded: 0,
            total: first.size,
            replace: false,
          },
          rest,
          results: s.results,
          replaceAll: false,
        }
        : { ...s, rest: [...s.rest, ...files] }
    );
  }, []);

  const onAbort = useCallback(
    (file: File) => {
      if (uploadState._tag !== "uploading") return;
      if (uploadState.current.file === file) {
        uploadState.current.abortController.abort();
      } else {
        setUploadState(s =>
          s._tag === "uploading"
            ? { ...s, rest: s.rest.filter(f => f !== file) }
            : s
        );
      }
    },
    [uploadState]
  );

  const onRemoveResult = useCallback((file: File) => {
    setUploadState(s => ({
      ...s,
      results: s.results.filter(r => r.file !== file),
    }));
  }, []);

  return [
    { files, deleting, upload: uploadState },
    {
      del,
      onDrop,
      onReplaceYes,
      onReplaceAll,
      onReplaceNo,
      onAbort,
      onRemoveResult,
    },
  ];
};
