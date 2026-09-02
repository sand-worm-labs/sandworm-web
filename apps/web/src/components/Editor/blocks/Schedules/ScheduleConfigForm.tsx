import tzList from "timezones-list";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { CloseIconButton } from "@/components/CloseIconButton";

import FormError from "../forms/formError";
import ScrollBar from "../ScrollBar";

import {
  CronScheduleFields,
  DailyScheduleFields,
  HourlyScheduleFields,
  MonthlyScheduleFields,
  WeeklyScheduleFields,
} from "./ScheduleFields";
import type { ScheduleFormValues } from "./AddScheduleForm";

interface ScheduleConfigFormProps {
  onClose: () => void;
  form: UseFormReturn<ScheduleFormValues>;
  submitHandler: SubmitHandler<ScheduleFormValues>;
}

function ScheduleConfigForm({
  onClose,
  form,
  submitHandler,
}: ScheduleConfigFormProps) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const selectedScheduleType = useWatch({
    control: form.control,
    name: "type",
    defaultValue: "MONTHLY",
  });

  return (
    <form
      className="h-full flex flex-col"
      onSubmit={form.handleSubmit(submitHandler)}
    >
      <div className="flex items-center justify-between py-6 sm:px-4 xl:px-6">
        <h3 className="text-lg font-medium leading-6 text-ink-100 pt-1">
          Add scheduled run
        </h3>
        <CloseIconButton size="sm" onClick={onClose} />
      </div>

      <ScrollBar className="sm:px-4 xl:px-6 py-6 flex-1 flex flex-col overflow-y-auto">
        <div className="flex flex-col space-y-2">
          <div>
            <label
              htmlFor="scheduleType"
              className="block text-sm font-medium leading-6 text-ink-100"
            >
              Schedule type
            </label>
            <select
              {...form.register("type")}
              defaultValue="MONTHLY"
              className="mt-2 block w-full rounded-[10px] border-0 py-1.5 pl-3 pr-10 text-ink-100 bg-white dark:bg-base-710 ring-[1.5px] ring-border-secondary dark:ring-border-tertiary focus-visible:outline-primary focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6 "
            >
              <option value="HOURLY">Hourly</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="CRON">Cron</option>
            </select>
            <FormError msg={form.formState.errors.timezone?.message} />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium leading-6 text-ink-100"
            >
              Timezone
            </label>
            <select
              {...form.register("timezone", { required: true })}
              className="mt-2 block w-full rounded-[10px] border-0 py-1.5 pl-3 pr-10 text-ink-100 bg-white dark:bg-base-710 ring-[1.5px] ring-border-secondary dark:ring-border-tertiary focus:ring-2 focus:ring-primary focus-visible:outline-primary sm:text-sm sm:leading-6"
              defaultValue={userTimezone}
            >
              {tzList.map(timezone => (
                <option key={timezone.tzCode} value={timezone.tzCode}>
                  {timezone.label.replace("_", " ")}
                </option>
              ))}
            </select>
            <FormError msg={form.formState.errors.timezone?.message} />
          </div>

          {selectedScheduleType === "HOURLY" && (
            <HourlyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
            />
          )}

          {selectedScheduleType === "DAILY" && (
            <DailyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
            />
          )}

          {selectedScheduleType === "WEEKLY" && (
            <WeeklyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
              control={form.control}
            />
          )}

          {selectedScheduleType === "MONTHLY" && (
            <MonthlyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
              control={form.control}
            />
          )}

          {selectedScheduleType === "CRON" && (
            <CronScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
            />
          )}

          {/*  <div className="pt-2 flex flex-col space-y-6">
            <div className="flex items-center justify-between pt-2">
              <h4 className="pt-0.5">Notifications</h4>
              <div className="flex items-center justify-end gap-x-2">
                <Tooltip
                  message="Upgrade to sandworm cloud’s professional tier to use it."
                  active
                  position="left"
                  tooltipClassname="w-48"
                >
                  <button
                    type="button"
                    className="flex items-center gap-x-2 px-4 py-1 text-white text-sm rounded-lg disabled:cursor-not-allowed bg-primary"
                    disabled
                  >
                    Add
                  </button>
                </Tooltip>
              </div>
            </div>
          </div> */}
        </div>

        <div className="flex bg-white dark:bg-page-surface py-4  px-0 w-full space-x-2 ">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 flex items-center text-center justify-center  rounded-full px-3 py-1.5 text-ink-400  text-sm hover:bg-gray-100 dark:hover:bg-dropdown-hover border border-border-secondary dark:border-border-tertiary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center text-center justify-center  rounded-full bg-base-400 px-3 py-1.5 text-sm hover:bg-primary-300 text-white dark:bg-primary dark:hover:bg-primary-710"
          >
            Schedule run
          </button>
        </div>
      </ScrollBar>
    </form>
  );
}

export default ScheduleConfigForm;
