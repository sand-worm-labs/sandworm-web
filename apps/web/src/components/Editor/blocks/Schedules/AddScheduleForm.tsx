import { useCallback } from "react";
import { useForm } from "react-hook-form";

import type { ExecutionSchedule, ScheduleParams } from "@/types";

import ScheduleConfigForm from "./ScheduleConfigForm";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type CreateSchedulePayload = {
  scheduleParams: ScheduleParams;
};

export type ScheduleFormValues = {
  type: ScheduleParams["type"];
  documentId: string;
  minute: number;
  timezone: string;
  amPm: "AM" | "PM";
  notifyOnFailure: boolean;
  hour?: number;
  weekdays?: number[];
  days?: number[];
  cron?: string;
};

interface Props {
  documentId: string;
  onClose: () => void;
  onSubmit: (payload: CreateSchedulePayload) => Promise<ExecutionSchedule>;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function AddScheduleForm({ documentId, onClose, onSubmit }: Props) {
  const form = useForm<ScheduleFormValues>({
    mode: "onSubmit",
    defaultValues: { documentId },
  });

  const onSubmitHandler = useCallback(
    async (data: ScheduleFormValues) => {
      try {
        const { amPm, notifyOnFailure: _, ...rest } = data;

        // Convert to 24-hour format only when hour is present
        const hour24 =
          data.hour === undefined
            ? undefined
            : amPm === "PM"
              ? data.hour === 12
                ? 12
                : data.hour + 12
              : data.hour === 12
                ? 0
                : data.hour;

        // ScheduleParams is a discriminated union; the cast is intentional —
        // field presence is guaranteed by ScheduleConfigForm's validation
        const scheduleParams = {
          ...rest,
          ...(hour24 !== undefined && { hour: hour24 }),
        } as ScheduleParams;

        await onSubmit({ scheduleParams });
      } finally {
        onClose();
      }
    },
    [onSubmit, onClose]
  );

  return (
    <div className="w-[324px] flex h-full flex-col overflow-y-auto border-l border-border-secondary font-body dark:bg-page-surface">
      <ScheduleConfigForm
        form={form}
        submitHandler={onSubmitHandler}
        onClose={onClose}
      />
    </div>
  );
}

export default AddScheduleForm;
