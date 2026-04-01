import { useCallback, useMemo } from "react";
import type { Reference } from "@apollo/client";

import type {
  ExecutionSchedule,
  CreateSchedulePayload,
  ScheduleParams,
} from "@/types";
import type { ExecutionScheduleType } from "@/generated/graphql";
import {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
} from "@/generated/graphql";

// =====================================
// ⬢ Types
// =====================================
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

// =====================================
// ⬢ Utils
// =====================================
// ⬢ NOTE — ScheduleParams is a discriminated union. Fields like `hour`,
// `minute`, `cron` only exist on specific members. We must narrow by
// `type` before accessing them, otherwise TS flags missing properties.
function buildScheduleInput(documentId: string, params: ScheduleParams) {
  const base = {
    documentId,
    type: params.type as ExecutionScheduleType,
    timezone: params.timezone,
  };

  switch (params.type) {
    case "HOURLY":
      return { ...base, minute: params.minute };
    case "DAILY":
      return { ...base, hour: params.hour, minute: params.minute };
    case "WEEKLY":
      return {
        ...base,
        hour: params.hour,
        minute: params.minute,
        weekdays: params.weekdays as unknown as string,
      };
    case "MONTHLY":
      return {
        ...base,
        hour: params.hour,
        minute: params.minute,
        days: params.days as unknown as string,
      };
    case "CRON":
      return { ...base, cron: params.cron };
    default:
      throw new Error(`Unknown schedule type`);
  }
}

function buildOptimisticSchedule(documentId: string, params: ScheduleParams) {
  const base = {
    __typename: "Schedule" as const,
    id: `temp-${Date.now()}`,
    documentId,
    type: params.type as ExecutionScheduleType,
    timezone: params.timezone,
    hour: null as number | null,
    minute: null as number | null,
    cron: null as string | null,
    weekdays: null as string | null,
    days: null as string | null,
    isActive: true,
    lastExecutedAt: null,
    nextExecutionAt: null,
  };

  switch (params.type) {
    case "HOURLY":
      return { ...base, minute: params.minute };
    case "DAILY":
      return { ...base, hour: params.hour, minute: params.minute };
    case "WEEKLY":
      return {
        ...base,
        hour: params.hour,
        minute: params.minute,
        weekdays: params.weekdays as unknown as string,
      };
    case "MONTHLY":
      return {
        ...base,
        hour: params.hour,
        minute: params.minute,
        days: params.days as unknown as string,
      };
    case "CRON":
      return { ...base, cron: params.cron };
    default:
      return base;
  }
}

// =====================================
// ⬢ useSchedules
// =====================================
export const useSchedules = (
  workspaceId: string,
  documentId: string
): UseSchedules => {
  const { data, loading, error } = useGetSchedulesQuery({
    variables: { input: { documentId } },
    skip: !documentId,
  });

  const schedules = useMemo(
    () => (data?.schedules ?? []) as ExecutionSchedule[],
    [data?.schedules]
  );

  const [createScheduleMutation] = useCreateScheduleMutation();
  const [deleteScheduleMutation] = useDeleteScheduleMutation();

  const createSchedule = useCallback(
    async (payload: CreateSchedulePayload): Promise<ExecutionSchedule> => {
      const { scheduleParams } = payload;

      const result = await createScheduleMutation({
        variables: {
          workspaceId,
          input: buildScheduleInput(documentId, scheduleParams),
        },
        optimisticResponse: {
          __typename: "Mutation",
          createSchedule: buildOptimisticSchedule(documentId, scheduleParams),
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.createSchedule) return;

          cache.modify({
            fields: {
              schedules(existingSchedules, { toReference }) {
                const current = existingSchedules ?? [];
                const newScheduleRef = toReference(mutationData.createSchedule);
                if (!newScheduleRef) return current;
                return [...current, newScheduleRef];
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
          input: { workspaceId, documentId, scheduleId },
        },
        optimisticResponse: {
          __typename: "Mutation",
          deleteSchedule: true,
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.deleteSchedule) return;

          cache.modify({
            fields: {
              schedules(existingSchedules, { readField }) {
                const current = (existingSchedules ?? []) as Reference[];
                return current.filter(
                  (scheduleRef: Reference) =>
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
