"use client";

import React, { useState } from "react";
import { Database, EllipsisVertical, FileUp, Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { explorerMockData } from "@/_mockdata/explorer";
import { ChainExplorer } from "./ChainExplorer";
import { EntitiesExplorer } from "./EntitiesExplorer";
import FieldExplorer from "./FieldExplorer";

export default function DataExplorer() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const isLoading = false;

  const namespace = searchParams.get("namespace"); // Chain (e.g., solana)
  const id = searchParams.get("id"); // Entity (e.g., solana.transactions)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Card className="h-full overflow-hidden border-none dark">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading chains...</p>
        </div>
      )}

      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className=" font-semibold">Data Explorer</CardTitle>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer p-2 border hover:bg-secondary rounded-md focus:outline-none">
              <EllipsisVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setIsSheetOpen(true)}>
                    <FileUp className="h-4 w-4" />
                    Import Data
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-2 h-[calc(100%-60px)] overflow-y-auto">
        {explorerMockData.length > 0 ? (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="m-auto w-[calc(100%-2rem)] focus:ring-0
              "
            />
            <div className="flex items-center justify-between px-2">
              <p className="text-muted-foreground text-xs">
                {explorerMockData.length}{" "}
                {explorerMockData.length > 1 ? "chains" : "chaiin"}
              </p>
            </div>
            <ul className="ml-2">
              {!namespace ? (
                <ChainExplorer chains={explorerMockData} />
              ) : !id ? (
                <EntitiesExplorer namespace={namespace} />
              ) : (
                <FieldExplorer namespace={namespace} id={id} />
              )}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Database className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm px-2">
                No datasets Found. You can upload your data to Sandworm via the
                UI and query it like any other table.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Import Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
