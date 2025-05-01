"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSandwormStore } from "@/store";

export const CreateQueryButton = () => {
  const router = useRouter();
  const createTab = useSandwormStore(state => state.createTab);

  const handleCreate = () => {
    createTab("New Query", undefined, "sql", "");
    router.push("/workspace");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCreate}
            variant="ghost"
            size="icon"
            aria-label="Create a new query"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Create a new query</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
