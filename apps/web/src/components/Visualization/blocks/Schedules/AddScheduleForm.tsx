import { useCallback } from "react";
import { useForm } from "react-hook-form";

import type { ExecutionSchedule, ScheduleParams } from "@/types";

import ScheduleConfigForm from "./ScheduleConfigForm";

export type CreateSchedulePayload = {
  scheduleParams: ScheduleParams;
};

export type ScheduleFormValues = ScheduleParams & {
  amPm: "AM" | "PM";
  notifyOnFailure: boolean;
};

interface Props {
  documentId: string;
  onClose: () => void;
  onSubmit: (payload: CreateSchedulePayload) => Promise<ExecutionSchedule>;
}

function AddScheduleForm({ documentId, onClose, onSubmit }: Props) {
  const form = useForm<ScheduleFormValues>({
    mode: "onSubmit",
    defaultValues: { documentId },
  });

  const onSubmitHandler = useCallback(
    async (data: ScheduleFormValues) => {
      try {
        const { amPm, notifyOnFailure, days, weekdays, hour, type, ...rest } =
          data;

        // Convert hour to 24-hour format
        let hour24 = hour;
        if (hour !== undefined) {
          if (amPm === "PM") {
            hour24 = hour === 12 ? 12 : hour + 12;
          } else {
            hour24 = hour === 12 ? 0 : hour;
          }
        }

        // Convert arrays to strings (schema expects String, not Array)
        const daysString = Array.isArray(days) ? days.join(",") : days;
        const weekdaysString = Array.isArray(weekdays)
          ? weekdays.join(",")
          : weekdays;

        // Convert type to uppercase to match GraphQL enum
        const typeUppercase = type?.toUpperCase() as ScheduleParams["type"];

        const scheduleParams: ScheduleParams = {
          ...rest,
          type: typeUppercase,
          hour: hour24,
          days: daysString,
          weekdays: weekdaysString,
        };

        await onSubmit({ scheduleParams });
      } finally {
        onClose();
      }
    },
    [onSubmit, onClose]
  );

  return (
    <div className="w-[324px] flex h-full flex-col overflow-y-auto border-l border-border-secondary font-body  dark:bg-base-100 ">
      <ScheduleConfigForm
        form={form}
        submitHandler={onSubmitHandler}
        onClose={onClose}
      />
    </div>
  );
}

export default AddScheduleForm;
