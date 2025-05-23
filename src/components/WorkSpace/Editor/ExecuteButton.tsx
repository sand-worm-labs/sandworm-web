import { ChevronDown, Play, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ExecutionType = "rpc" | "indexed";

export const ExecuteButton = ({
  isExecuting,
  handleExecute,
  executionType,
  setExecutionType,
}: {
  isExecuting: boolean;
  handleExecute: (type: ExecutionType) => void;
  executionType: ExecutionType;
  setExecutionType: (type: ExecutionType) => void;
}) => {
  const handleClick = () => {
    handleExecute(executionType);
  };

  const executionLabel = executionType === "rpc" ? "RPC" : "Indexer";

  return (
    <div className="flex items-center dark">
      <Button
        onClick={handleClick}
        disabled={isExecuting}
        className="bg-orange-700 text-white h-[2rem] pl-2 pr-2 rounded-sm text-xs flex items-center gap-2 rounded-r-none"
      >
        {isExecuting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isExecuting ? "Running..." : `Run (${executionLabel})`}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="h-[2rem] px-1.5 rounded-sm rounded-l-none bg-orange-700 text-white border-l border-l-black"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[180px] p-1 dark">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Execution method
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => setExecutionType("rpc")}
            className={executionType === "rpc" ? "font-bold" : ""}
          >
            RPC
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setExecutionType("indexed")}
            className={executionType === "indexed" ? "font-bold" : ""}
          >
            Indexer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
