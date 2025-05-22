"use client";

import React, { useState, useEffect } from "react";
import { Database } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChainStore } from "@/store/chains";
import {
  ChainListPanel,
  ExplorerBreadCrumbs,
  EntityListPanel,
  FieldDetailsPanel,
} from "@/components/ExplorerPanels";

export const DataExplorer = () => {
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
      return (
        <FieldDetailsPanel
          entities={entityData || { raw: [], project: [], decoded: [] }}
        />
      );
    }

    if (selectedChain) {
      return (
        <EntityListPanel
          entities={entityData || { raw: [], project: [], decoded: [] }}
          onSelect={handleSelectEntity}
        />
      );
    }

    return (
      <ChainListPanel chains={chains || []} onSelect={handleSelectChain} />
    );
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
        </div>
      </CardHeader>

      <CardContent className="p-2 px-0 h-[calc(100%-60px)] overflow-y-auto">
        {chains && chains.length > 0 ? (
          <div className="space-y-2">
            <ExplorerBreadCrumbs
              entities={entityData || { raw: [], project: [], decoded: [] }}
            />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="m-auto w-[calc(100%-2rem)] focus:ring-0 hidden
              "
            />
            <div className="flex items-center justify-between px-3" />
            <ul className="">{renderExplorer()}</ul>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
