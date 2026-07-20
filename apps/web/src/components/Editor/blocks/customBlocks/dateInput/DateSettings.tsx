import clsx from "clsx";
import {
  PiCalendar,
  PiCalendarBold,
  PiGearSix,
  PiInfo,
  PiCheckBold,
  PiClock,
  PiClockBold,
} from "react-icons/pi";
import { useCallback, useMemo } from "react";
import tzList from "timezones-list";

import Dropdown from "../../Dropdown";
import { Tooltip } from "../../ToolTips";

interface Props {
  dateType: "date" | "datetime";
  onChangeDateType: (type: "date" | "datetime") => void;
  timezone: string;
  onChangeTimeZone: (timezone: string) => void;
  disabled: boolean;
}
export default function DateSettings(props: Props) {
  const timezoneOptions = useMemo(() => {
    return tzList
      .map(tz => ({
        label: tz.name,
        value: tz.tzCode,
      }))
      .concat({
        label: "UTC",
        value: "UTC",
      });
  }, []);

  const onDateDateType = useCallback(() => {
    props.onChangeDateType("date");
  }, [props.onChangeDateType]);

  const onDateTimeDateType = useCallback(() => {
    props.onChangeDateType("datetime");
  }, [props.onChangeDateType]);

  return (
    <div className="bg-gray-50 px-3 py-3 border border-border-secondary flex flex-col gap-y-2 rounded-md shadow-sm">
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-semibold py-1 flex gap-x-1 text-ink-400 w-full">
          <PiGearSix className="w-4 h-4" />
          Date input settings
        </span>

        <div>
          <Tooltip
            message="This field's value will be available in Python and SQL blocks as an datetime object. To use it in SQL, interpolate it as {{variable_name}}."
            className="flex w-full"
            tooltipClassname="w-64"
            position="top"
            active
          >
            <PiInfo className="w-4 h-4 text-ink-400" />
          </Tooltip>
        </div>
      </div>

      <span className="isolate inline-flex rounded-md shadow-sm w-full">
        <button
          type="button"
          onClick={onDateDateType}
          className={clsx(
            "relative inline-flex items-center justify-between rounded-l-md px-3 py-2 text-xs ring-1 ring-inset ring-gray-300 hover:bg-ceramic-50 focus:z-10 w-full",
            props.dateType === "date"
              ? "bg-ceramic-50 text-ink-100 font-medium"
              : "bg-white text-ink-400 "
          )}
          disabled={props.dateType === "date" || props.disabled}
        >
          <span className="flex gap-x-2 items-center">
            {props.dateType === "date" ? (
              <PiCalendarBold className="w-4 h-4" />
            ) : (
              <PiCalendar className="w-4 h-4" />
            )}
            Date
          </span>
          {props.dateType === "date" && (
            <PiCheckBold className="w-4 h-4 text-ceramic-400" />
          )}
        </button>
        <button
          type="button"
          onClick={onDateTimeDateType}
          className={clsx(
            "relative -ml-px inline-flex items-center justify-between rounded-r-md px-3 py-2 text-xs ring-1 ring-inset ring-gray-300 hover:bg-ceramic-50 focus:z-10 w-full",
            props.dateType === "datetime"
              ? "bg-ceramic-50 text-ink-100 font-medium"
              : "bg-white text-ink-400 "
          )}
          disabled={props.dateType === "datetime" || props.disabled}
        >
          <span className="flex gap-x-2 items-center">
            {props.dateType === "datetime" ? (
              <PiClockBold className="w-4 h-4" />
            ) : (
              <PiClock className="w-4 h-4" />
            )}
            Date and time
          </span>
          {props.dateType === "datetime" && (
            <PiCheckBold className="w-4 h-4 text-ceramic-400" />
          )}
        </button>
      </span>

      <div className={clsx("flex flex-col gap-y-3 pt-2")}>
        <Dropdown
          label="Timezone"
          options={timezoneOptions}
          placeholder="Select a dataframe"
          value={props.timezone}
          onChange={props.onChangeTimeZone}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
