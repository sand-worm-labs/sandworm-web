import { format } from "date-fns";
import {
  CloudArrowDownIcon,
  Cog8ToothIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { PiCheck } from "react-icons/pi";
import clsx from "clsx";

function formatExecutionTime(time: string): string {
  return format(new Date(time), "h:mm a - do MMM, yyyy");
}

type StartExecutionStatusTextProps = {
  startExecutionTime: string | null;
};

interface LastExecutedStatusTextProps {
  lastExecutionTime: string;
  isResultHidden: boolean;
  onToggleResultHidden: () => void;
}

export function QuerySucceededText({
  lastExecutionTime,
  isResultHidden,
  onToggleResultHidden,
}: LastExecutedStatusTextProps) {
  return (
    <div className="flex items-center gap-x-1 text-ink-400 font-[300]">
      <div className="relative group w-4 h-4">
        <div
          className={clsx(
            "relative w-[18px] h-[18px]",
            "group-hover:opacity-0 transition-opacity"
          )}
        >
          <svg
            viewBox="0 0 18 18"
            fill="none"
            className="absolute inset-0 w-full h-full"
          >
            <circle
              cx="9"
              cy="9"
              r="8"
              stroke="#E6E0F1"
              strokeWidth="1.5"
              className="fill-[#FEFEFF] dark:fill-[var(--color-base-100)]"
            />
          </svg>
          <PiCheck className="absolute inset-0 w-full h-full p-[4px] text-[#A308F0]" />{" "}
        </div>
        <button
          type="button"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onToggleResultHidden}
        >
          {isResultHidden ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      <span className="ml-1">
        Succeeded in {formatExecutionTime(lastExecutionTime)}
      </span>
    </div>
  );
}

export const LoadingQueryText = ({
  startExecutionTime,
}: StartExecutionStatusTextProps) => {
  const [showStartTime, setShowStartTime] = useState(false);
  useEffect(() => {
    if (startExecutionTime) {
      const interval = setInterval(() => {
        setShowStartTime(true);
      }, 60000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [startExecutionTime]);

  return (
    <span className="text-ink-400 text-xs flex items-center select-none">
      <CloudArrowDownIcon className="w-4 h-4 mr-1" />
      <span className="pt-0.5">
        Executing query
        {showStartTime && startExecutionTime
          ? ` since ${format(
              new Date(startExecutionTime),
              "h:mm a - do MMM, yyyy"
            )}...`
          : "..."}
      </span>
    </span>
  );
};

export const LoadingEnvText = () => {
  return (
    <span className=" text-ink-400 text-xs flex items-center select-none">
      <Cog8ToothIcon className="w-4 h-4 mr-1" />
      <span className="pt-0.5">Starting your environment...</span>
    </span>
  );
};

export const ExecutingPythonText = ({
  startExecutionTime,
}: StartExecutionStatusTextProps) => {
  const [showStartTime, setShowStartTime] = useState(false);
  useEffect(() => {
    if (startExecutionTime) {
      const interval = setInterval(() => {
        setShowStartTime(true);
      }, 60000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [startExecutionTime]);

  return (
    <span className=" text-ink-400 text-xs flex items-center select-none">
      <CloudArrowDownIcon className="w-4 h-4 mr-1" />
      <span className="pt-0.5">
        Executing Python code
        {showStartTime && startExecutionTime
          ? ` since ${format(
              new Date(startExecutionTime),
              "h:mm a - do MMM, yyyy"
            )}...`
          : "..."}
      </span>
    </span>
  );
};

export function PythonSucceededText({
  lastExecutionTime,
  isResultHidden,
  onToggleResultHidden,
}: LastExecutedStatusTextProps) {
  return (
    <div className="flex items-center gap-x-1 text-ink-400 font-[300]">
      <div className="relative group w-4 h-4">
        <div
          className={clsx(
            "relative w-[18px] h-[18px]",
            "group-hover:opacity-0 transition-opacity"
          )}
        >
          <svg
            viewBox="0 0 18 18"
            fill="none"
            className="absolute inset-0 w-full h-full"
          >
            <circle
              cx="9"
              cy="9"
              r="8"
              stroke="#E6E0F1"
              strokeWidth="1.5"
              className="fill-[#FEFEFF] dark:fill-[var(--color-base-100)]"
            />
          </svg>
          <PiCheck className="absolute inset-0 w-full h-full p-[4px] text-[#A308F0]" />
        </div>
        <button
          type="button"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onToggleResultHidden}
        >
          {isResultHidden ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      <span className="ml-1">
        Succeeded in {formatExecutionTime(lastExecutionTime)}
      </span>
    </div>
  );
}
