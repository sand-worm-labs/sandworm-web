import type { DataSource } from "@sandworm/database";
import { DatabaseZapIcon } from "lucide-react";
import type { WriteBackResult } from "@sandworm/types";
import type { ExecutionStatus } from "@sandworm/editor";
import { isExecutionStatusLoading } from "@sandworm/editor";

import LargeSpinner from "../../../LargeSpinner";

import WritebackSuccessResult from "./WritebackSuccessResult";
import WritebackErrorResult from "./WritebackErrorResult";

interface Props {
  status: ExecutionStatus;
  result: WriteBackResult | null;
  dataSources: DataSource[];
}
function WritebackResult(props: Props) {
  if (isExecutionStatusLoading(props.status)) {
    return <Loading />;
  }

  return (
    <>
      {!props.result && <NoResult />}
      {props.result?._tag === "success" && (
        <WritebackSuccessResult
          result={props.result}
          dataSources={props.dataSources}
        />
      )}
      {props.result?._tag === "error" && (
        <WritebackErrorResult result={props.result} />
      )}
    </>
  );
}

function Loading() {
  return (
    <div className="flex flex-col space-y-2 items-center justify-center h-full bg-ceramic-50/30">
      <LargeSpinner />
    </div>
  );
}

function NoResult() {
  return (
    <div className="flex flex-col space-y-2 items-center justify-center h-full bg-ceramic-50/30">
      <DatabaseZapIcon className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
      <p className="text-lg text-gray-300">Run this block to write data.</p>
    </div>
  );
}

export default WritebackResult;
