import Ansi from "@cocalc/ansi-to-react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import clsx from "clsx";
import { useCallback } from "react";
import { SparklesIcon } from "@heroicons/react/20/solid";
import type { PythonErrorOutput } from "@sandworm/types";

import Spin from "../../Spin";
import { Tooltip } from "../../ToolTips";

interface Props {
  error: PythonErrorOutput;
  isFixWithAILoading: boolean;
  onFixWithAI: (error: PythonErrorOutput) => void;
  canFixWithAI: boolean;
}
function PythonError(props: Props) {
  const onFixWithAI = useCallback(() => {
    props.onFixWithAI(props.error);
  }, [props.error, props.onFixWithAI]);

  return (
    <PythonErrorUI
      canFixWithAI={props.canFixWithAI}
      ename={props.error.ename}
      evalue={props.error.evalue}
      traceback={props.error.traceback}
      isFixWithAILoading={props.isFixWithAILoading}
      onFixWithAI={onFixWithAI}
    />
  );
}

export default PythonError;

interface PythonErrorUIProps {
  ename: string;
  evalue: string;
  traceback: string[];
  isFixWithAILoading: boolean;
  onFixWithAI?: () => void;
  canFixWithAI: boolean;
}
export function PythonErrorUI(props: PythonErrorUIProps) {
  return (
    <div className="text-xs font-body">
      <div className="flex border border-error p-2 gap-x-3 text-xs overflow-hidden">
        <HiOutlineExclamationTriangle className="text-error h-5 w-5" />
        <div>
          <h4 className="font-semibold mb-2">
            Your code could not be executed
          </h4>
          <p>We received the following error:</p>
          <pre className="whitespace-pre-wrap">
            {props.ename} - {props.evalue}
          </pre>
          {props.traceback.map(line => (
            <pre key={line} className="whitespace-pre-wrap">
              <Ansi useClasses>{line}</Ansi>
            </pre>
          ))}
          {props.onFixWithAI && (
            <Tooltip
              title="Missing AI key"
              message="Admins can add an OpenAI key in settings."
              className="inline-block"
              tooltipClassname="w-40 text-center"
              position="top"
              active={!props.canFixWithAI}
            >
              <button
                type="button"
                onClick={props.onFixWithAI}
                className={clsx(
                  "mt-2 flex items-center border rounded-sm px-2 py-1 gap-x-2 font-syne border-border-secondary hover:bg-gray-50 hover:text-gray-700 disabled:bg-gray-200 disabled:border-0 disabled:cursor-not-allowed"
                )}
                disabled={props.isFixWithAILoading || !props.canFixWithAI}
              >
                {props.isFixWithAILoading ? (
                  <Spin />
                ) : (
                  <SparklesIcon className="w-3 h-3" />
                )}
                Fix with AI
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
