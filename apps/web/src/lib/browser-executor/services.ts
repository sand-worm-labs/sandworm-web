import type { DateInputBlock, DateInputValue } from "@sandworm/editor";
import type {
  DataFrame,
  Output,
  RunQueryResult,
  TableSort,
} from "@sandworm/types";

import { callKernel, interruptKernel } from "@/lib/pyodide/kernel";

// Browser counterparts of the services apps/api's block executors use
// (PythonExecutorService, QueryExecutionService, DataFrameService,
// VariableService), backed by the Pyodide kernel instead of Jupyter. Same
// names and shapes, so each block executor reads like its server twin.

type Running<T> = { promise: Promise<T>; abort: () => Promise<void> };

async function abort(): Promise<void> {
  interruptKernel();
}

export const pythonExecutor = {
  executeCode(
    notebookId: string,
    blockId: string,
    code: string
  ): Running<Output[]> {
    return {
      promise: callKernel({ kind: "run_python", notebookId, blockId, code }),
      abort,
    };
  },
};

export const queryExecution = {
  makeSQLQuery(
    notebookId: string,
    dataframeName: string,
    sql: string
  ): Running<RunQueryResult> {
    return {
      promise: callKernel({ kind: "run_sql", notebookId, sql, dataframeName }),
      abort,
    };
  },
};

export const dataFrameService = {
  list(notebookId: string): Promise<DataFrame[]> {
    return callKernel({ kind: "list_dataframes", notebookId });
  },

  readPage(
    notebookId: string,
    dataframeName: string,
    page: number,
    sort: TableSort | null
  ): Promise<RunQueryResult> {
    return callKernel({
      kind: "read_page",
      notebookId,
      dataframeName,
      page,
      sort,
    });
  },

  async rename(notebookId: string, from: string, to: string): Promise<void> {
    await callKernel({ kind: "rename_variable", notebookId, from, to });
  },
};

export const variableService = {
  setVariable(notebookId: string, name: string, value: string): Running<null> {
    return {
      promise: callKernel({ kind: "set_variable", notebookId, name, value }),
      abort,
    };
  },

  async setDateTimeVariable(
    notebookId: string,
    config: {
      variable: string;
      value: DateInputValue;
      dateType: DateInputBlock["dateType"];
    }
  ): Promise<void> {
    await callKernel({
      kind: "set_date_variable",
      notebookId,
      name: config.variable,
      config: { value: config.value, dateType: config.dateType },
    });
  },
};
