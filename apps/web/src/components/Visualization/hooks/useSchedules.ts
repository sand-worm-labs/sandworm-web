import { useCallback, useMemo } from "react";

import type { ExecutionSchedule, CreateSchedulePayload } from "@/types";
import type { ExecutionScheduleType } from "@/generated/graphql";
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
  const { data, loading, error } = useGetSchedulesQuery({
    variables: { input: { documentId } },
    skip: !documentId,
  });

  const schedules = useMemo(() => data?.schedules ?? [], [data?.schedules]);

  const [createScheduleMutation] = useCreateScheduleMutation();
  const [deleteScheduleMutation] = useDeleteScheduleMutation();

  const createSchedule = useCallback(
    async (payload: CreateSchedulePayload): Promise<ExecutionSchedule> => {
      const { scheduleParams } = payload;

      const input = {
        documentId,
        type: scheduleParams.type,
        timezone: scheduleParams.timezone,
        // Only include fields relevant to the schedule type
        ...(scheduleParams.hour !== undefined && { hour: scheduleParams.hour }),
        ...(scheduleParams.minute !== undefined && {
          minute: scheduleParams.minute,
        }),
        ...(scheduleParams.cron && { cron: scheduleParams.cron }),
        ...(scheduleParams.weekdays && { weekdays: scheduleParams.weekdays }),
        ...(scheduleParams.days && { days: scheduleParams.days }),
        ...(scheduleParams.isActive !== undefined && {
          isActive: scheduleParams.isActive,
        }),
      };

      const result = await createScheduleMutation({
        variables: {
          workspaceId,
          input,
        },
        // Optimistic response MUST include ALL fields from the mutation selection set
        // Every field must be present, use null for fields not applicable to this schedule type
        optimisticResponse: {
          __typename: "Mutation",
          createSchedule: {
            __typename: "Schedule",
            id: `temp-${Date.now()}`,
            documentId,
            type: scheduleParams.type as ExecutionScheduleType,
            // All fields must be present - use null for inapplicable ones
            hour: scheduleParams.hour ?? null,
            minute: scheduleParams.minute ?? null,
            cron: scheduleParams.cron ?? null,
            weekdays: scheduleParams.weekdays ?? null,
            days: scheduleParams.days ?? null,
            timezone: scheduleParams.timezone,
            isActive: scheduleParams.isActive ?? true,
            lastExecutedAt: null,
            nextExecutionAt: null,
          },
        },
        update: (cache, { data }) => {
          if (!data?.createSchedule) return;

          cache.modify({
            fields: {
              schedules(existingSchedules = [], { toReference }) {
                const newScheduleRef = toReference(data.createSchedule);
                if (!newScheduleRef) return existingSchedules;
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

      return newSchedule as ExecutionSchedule;
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
        optimisticResponse: {
          __typename: "Mutation",
          deleteSchedule: true,
        },
        update: (cache, { data }) => {
          if (!data?.deleteSchedule) return;

          cache.modify({
            fields: {
              schedules(existingSchedules = [], { readField }) {
                return existingSchedules.filter(
                  (scheduleRef: unknown) =>
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
