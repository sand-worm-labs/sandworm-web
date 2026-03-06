import tzList from "timezones-list";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

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
    defaultValue: "monthly",
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
        <button
          type="button"
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center gap-x-2 text-sm p-1 rounded-sm"
          onClick={onClose}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
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
              defaultValue="monthly"
              className="mt-2 block w-full rounded-[10px] border-0 py-1.5 pl-3 pr-10 text-ink-500 ring-[1.5px] ring-border-secondary focus-visible:outline-primary focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6 "
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="cron">Cron</option>
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
              className="mt-2 block w-full rounded-[10px] border-0 py-1.5 pl-3 pr-10 text-ink-500 ring-[1.5px] ring-border-secondary focus:ring-2 focus:ring-primary focus-visible:outline-primary sm:text-sm sm:leading-6"
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

          {selectedScheduleType === "hourly" && (
            <HourlyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
            />
          )}

          {selectedScheduleType === "daily" && (
            <DailyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
            />
          )}

          {selectedScheduleType === "weekly" && (
            <WeeklyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
              control={form.control}
            />
          )}

          {selectedScheduleType === "monthly" && (
            <MonthlyScheduleFields
              register={form.register}
              formErrors={form.formState.errors}
              control={form.control}
            />
          )}

          {selectedScheduleType === "cron" && (
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

        <div className="flex bg-white  py-4  px-0 w-full space-x-2 ">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 flex items-center text-center justify-center  rounded-full px-3 py-1.5 text-gray-500 text-sm hover:bg-gray-100 border border-border-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center text-center justify-center  rounded-full bg-base-400 px-3 py-1.5 text-sm hover:bg-primary-300 text-white"
          >
            Schedule run
          </button>
        </div>
      </ScrollBar>
    </form>
  );
}

export default ScheduleConfigForm;
