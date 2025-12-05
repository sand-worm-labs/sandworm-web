import { ChevronDown, Play, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@sandworm/ui/components/dropdown-menu";
import { Button } from "@sandworm/ui/components/button";

type ExecutionType = "rpc" | "indexed";

export const ExecuteButton = ({
  isExecuting,
  handleExecute,
  executionType,
  setExecutionType,
  cancelQuery,
}: {
  isExecuting: boolean;
  handleExecute: (type: ExecutionType) => void;
  executionType: ExecutionType;
  setExecutionType: (type: ExecutionType) => void;
  cancelQuery: () => void;
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
        className="bg-[#C7665C]  text-white h-[2rem] pl-2 pr-2 rounded-lg text-xs flex items-center gap-2 rounded-r-none"
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
            className="h-[2rem] px-1.5 rounded-lg rounded-l-none bg-white text-black border-l border-[#D4DCDF] border"
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
            className={executionType === "rpc" ? "font-medium" : ""}
          >
            RPC
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setExecutionType("indexed")}
            className={executionType === "indexed" ? "font-medium" : ""}
          >
            Indexer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isExecuting === true && (
        <Button
          onClick={() => cancelQuery()}
          variant="secondary"
          className="flex ml-2 items-center gap-2 min-w-[100px] text-xs h-[2rem] rounded-sm"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
