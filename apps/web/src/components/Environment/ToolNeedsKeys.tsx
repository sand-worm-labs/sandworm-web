import type { Output } from "@sandworm/types";
import { PiArrowUpRight, PiKey } from "react-icons/pi";

import { KEY_PROVIDERS } from "./ApiKeyNudge";

// =====================================
// ⬢ Tool Needs Keys
// =====================================
// The server won't run a tool whose environment variables the workspace
// hasn't set (MISSING_ENV_ERROR in power-toolbox-block-executor.service.ts).
// Like a SQL query paused by the plan: add the keys, then run the block again.
const MISSING_ENV_ERROR = "MissingEnvironmentVariables";

// The names of the variables a run was missing, or null if it wasn't that.
export function missingEnvFromOutputs(outputs: Output[]): string[] | null {
  const error = outputs.find(
    o => o.type === "error" && o.ename === MISSING_ENV_ERROR
  );
  return error?.type === "error" ? error.traceback : null;
}

export default function ToolNeedsKeys(props: {
  names: string[];
  workspaceId: string;
}) {
  return (
    <div className="px-3.5 pb-4 pt-3 text-xs">
      <div className="flex items-center justify-between gap-x-4 border border-amber-300 dark:border-amber-500/30 p-4">
        <div className="min-w-0">
          <h4 className="flex items-center gap-1.5 font-semibold pb-1">
            <PiKey size={14} />
            This tool needs{" "}
            {props.names.length === 1 ? "a key" : `${props.names.length} keys`}{" "}
            to run
          </h4>
          <p className="pb-2">
            Add {props.names.length === 1 ? "it" : "them"} to your
            workspace&apos;s environment variables, then run the block again.
          </p>
          <ul className="flex flex-col gap-1">
            {props.names.map(name => {
              const provider = KEY_PROVIDERS.find(p => p.varName === name);
              return (
                <li key={name} className="flex items-center gap-2">
                  <code className="rounded border border-border dark:border-border-tertiary px-1.5 py-0.5 font-mono">
                    {name}
                  </code>
                  {provider && (
                    <a
                      href={provider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 font-medium text-primary underline underline-offset-2"
                    >
                      Get a {provider.name} key
                      <PiArrowUpRight size={11} />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <a
          href={`/workspace/${props.workspaceId}/environments/current/variables`}
          className="shrink-0 rounded-md bg-amber-500 px-3 py-1.5 font-medium text-black hover:bg-amber-400"
        >
          Add {props.names.length === 1 ? "key" : "keys"}
        </a>
      </div>
    </div>
  );
}
