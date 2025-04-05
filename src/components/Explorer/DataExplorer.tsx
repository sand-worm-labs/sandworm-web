"use client";

import React, { useState, useEffect } from "react";
import { Database, EllipsisVertical, FileUp, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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
import type { DataExplorers } from "@/_mockdata/explorer";
import { useChainStore } from "@/store/chains";

import Breadcrumbs from "./BreadCrumbs";
import { ChainExplorer } from "./ChainExplorer";
import { EntitiesExplorer } from "./EntitiesExplorer";
import { FieldExplorer } from "./FieldExplorer";

export default function DataExplorer() {
  const [, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChain = searchParams.get("namespace");
  const selectedEntity = searchParams.get("id");

  const { chains, entityData, loading, fetchChainData, fetchEntityData } =
    useChainStore();

  useEffect(() => {
    if (!chains) fetchChainData();
  }, [chains, fetchChainData]);

  useEffect(() => {
    if (selectedChain) fetchEntityData(selectedChain.toLowerCase());
  }, [selectedChain, fetchEntityData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectEntity = (entityId: string) => {
    router.push(`?namespace=${selectedChain}&id=${entityId}`);
  };

  const handleSelectChain = (chainId: string) => {
    router.push(`?namespace=${chainId}`);
  };

  const renderExplorer = () => {
    if (selectedEntity) {
      return <FieldExplorer entities={entityData || []} />;
    }

    if (selectedChain) {
      return (
        <EntitiesExplorer
          entities={entityData || []}
          onSelect={handleSelectEntity}
        />
      );
    }

    return <ChainExplorer chains={chains} onSelect={handleSelectChain} />;
  };

  return (
    <Card className="h-full overflow-hidden border-none dark">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading chains...</p>
        </div>
      )}

      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle className=" font-medium">Data Explorer</CardTitle>
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

      <CardContent className="p-2 px-0 h-[calc(100%-60px)] overflow-y-auto">
        {chains && chains.length > 0 ? (
          <div className="space-y-2">
            <Breadcrumbs />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="m-auto w-[calc(100%-2rem)] focus:ring-0
              "
            />
            <div className="flex items-center justify-between px-3" />
            <ul className="px-3">{renderExplorer()}</ul>
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
