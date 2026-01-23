import { useCallback, useMemo } from "react";

import type { ExecutionSchedule, CreateSchedulePayload } from "@/types";
import {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
} from "@/generated/graphql";

type API = {
  createSchedule: (
    payload: CreateSchedulePayload
  ) => Promise<ExecutionSchedule>;
  deleteSchedule: (id: string) => Promise<void>;
};

type UseSchedules = {
  schedules: ExecutionSchedule[];
  loading: boolean;
  error: Error | undefined;
  api: API;
};

export const useSchedules = (
  workspaceId: string,
  documentId: string
): UseSchedules => {
  // Use Apollo's generated hooks directly - they handle caching
  const { data, loading, error, refetch } = useGetSchedulesQuery({
    variables: { input: { documentId } },
    skip: !documentId,
  });

  const schedules = useMemo(() => data?.schedules ?? [], [data?.schedules]);

  const [createScheduleMutation] = useCreateScheduleMutation();
  const [deleteScheduleMutation] = useDeleteScheduleMutation();

  const createSchedule = useCallback(
    async (payload: CreateSchedulePayload): Promise<ExecutionSchedule> => {
      const result = await createScheduleMutation({
        variables: {
          workspaceId,
          input: {
            documentId,
            ...payload.scheduleParams,
          },
        },
        // Optimistic update
        optimisticResponse: {
          createSchedule: {
            __typename: "ExecutionSchedule",
            id: `temp-${Date.now()}`,
            documentId,
            lastExecutedAt: null,
            nextExecutionAt: null,
            ...payload.scheduleParams,
          },
        },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (!data?.createSchedule) return;

          cache.modify({
            fields: {
              schedules(existingSchedules = [], { toReference }) {
                const newScheduleRef = toReference(data.createSchedule);
                return [...existingSchedules, newScheduleRef];
              },
            },
          });
        },
      });

      const newSchedule = result.data?.createSchedule;
      if (!newSchedule) {
        throw new Error("Failed to create schedule");
      }

      return newSchedule;
    },
    [workspaceId, documentId, createScheduleMutation]
  );

  const deleteSchedule = useCallback(
    async (scheduleId: string): Promise<void> => {
      const result = await deleteScheduleMutation({
        variables: {
          input: {
            workspaceId,
            documentId,
            scheduleId,
          },
        },
        // Optimistic update - remove from cache immediately
        optimisticResponse: {
          deleteSchedule: true,
        },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (!data?.deleteSchedule) return;

          cache.modify({
            fields: {
              schedules(existingSchedules = [], { readField }) {
                return existingSchedules.filter(
                  (scheduleRef: any) =>
                    readField("id", scheduleRef) !== scheduleId
                );
              },
            },
          });
        },
      });

      if (!result.data?.deleteSchedule) {
        throw new Error("Failed to delete schedule");
      }
    },
    [workspaceId, documentId, deleteScheduleMutation]
  );

  return useMemo(
    () => ({
      schedules,
      loading,
      error,
      api: { createSchedule, deleteSchedule },
    }),
    [schedules, loading, error, createSchedule, deleteSchedule]
  );
};
