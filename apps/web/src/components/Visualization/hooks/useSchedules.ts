import { useCallback, useMemo } from "react";
import useSWR from "swr";

import type { ExecutionSchedule, CreateSchedulePayload } from "@/types";
import {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
} from "@/generated/graphql";

type API = {
  createSchedule: (
    payload: CreateSchedulePayload
  ) => Promise<ExecutionSchedule>;
  deleteSchedule: (id: string) => Promise<void>;
};

type UseSchedules = [ExecutionSchedule[], API];

export const useSchedules = (
  workspaceId: string,
  docId: string
): UseSchedules => {
  // Use SWR for caching
  const { data, mutate } = useSWR<ExecutionSchedule[]>(
    ["schedules", docId],
    async () => {
      const result = await useGetScheduleQuery({
        variables: { input: { documentId: docId } },
      });
      return result.data?.schedules ?? [];
    }
  );

  const schedules = useMemo(() => data ?? [], [data]);

  const [createScheduleMutation] = useCreateScheduleMutation();
  const [deleteScheduleMutation] = useDeleteScheduleMutation();

  // Optimistic create
  const createSchedule = useCallback(
    async (payload: CreateSchedulePayload) => {
      // Generate a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticSchedule: ExecutionSchedule = {
        id: tempId,
        ...payload.scheduleParams,
      };

      // Update cache optimistically
      mutate([...schedules, optimisticSchedule], false);

      try {
        const result = await createScheduleMutation({
          variables: { workspaceId, input: payload.scheduleParams },
        });

        const newSchedule = result.data?.createSchedule;
        if (!newSchedule) throw new Error("Failed to create schedule");

        // Replace temp schedule with real schedule
        mutate(
          schedules => [
            ...(schedules?.filter(s => s.id !== tempId) ?? []),
            newSchedule,
          ],
          false
        );

        return newSchedule;
      } catch (err) {
        // Rollback optimistic update on error
        mutate(schedules, false);
        throw err;
      }
    },
    [schedules, createScheduleMutation, mutate, workspaceId]
  );

  // Optimistic delete
  const deleteSchedule = useCallback(
    async (id: string) => {
      const previous = schedules;

      // Optimistically remove schedule from cache
      mutate(
        schedules.filter(s => s.id !== id),
        false
      );

      try {
        const result = await deleteScheduleMutation({
          variables: { input: { id } },
        });
        if (!result.data?.deleteSchedule)
          throw new Error("Failed to delete schedule");
      } catch (err) {
        // Rollback on error
        mutate(previous, false);
        throw err;
      }
    },
    [schedules, deleteScheduleMutation, mutate]
  );

  return useMemo(
    () => [schedules, { createSchedule, deleteSchedule }],
    [schedules, createSchedule, deleteSchedule]
  );
};
