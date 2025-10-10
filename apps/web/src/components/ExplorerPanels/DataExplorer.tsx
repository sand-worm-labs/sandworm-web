"use client";

import React, { useState, useEffect } from "react";
import { Database, GripHorizontal, X } from "lucide-react";
import { Rnd } from "react-rnd";
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

import { Button } from "../ui/button";

type EntityType = "raw" | "project" | "decoded";

export function DataExplorer({ onClose }: { onClose?: () => void }) {
  const getInitialPosition = () => {
    if (typeof window === "undefined") {
      return { x: 100, y: 50 };
    }

    const panelWidth = 400;
    // const panelHeight = 500;
    const margin = 20;

    // Position from right edge with margin, but ensure it doesn't go off-screen
    const x = Math.max(margin, window.innerWidth - panelWidth - margin);
    const y = margin;

    return { x, y };
  };

  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChain = searchParams.get("namespace");
  const selectedEntity = searchParams.get("id");

  const { chains, entityData, loading, fetchChainData, fetchEntityData } =
    useChainStore();

  /* Persist these to zustand. Would be better if the selected exploer state remains the same when you refresh the page or switch tabs */
  useEffect(() => {
    if (!chains) fetchChainData();
  }, [chains, fetchChainData]);

  useEffect(() => {
    if (selectedChain) fetchEntityData(selectedChain.toLowerCase());
  }, [selectedChain, fetchEntityData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectEntity = (entityId: string, type: EntityType) => {
    router.push(`?namespace=${selectedChain}&id=${entityId}&type=${type}`);
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
    <Rnd
      default={{
        ...getInitialPosition(),
        width: 400,
        height: 500,
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="drag-handle"
      cancel=".no-drag"
      className="z-[100]"
    >
      <Card className="h-full overflow-hidden relative">
        {/* Top-centered drag handle button */}
        <div
          aria-label="Drag panel"
          className="border rounded drag-handle absolute left-1/2 -translate-x-1/2 top-4 -translate-y-1/2 z-10 p-1 h-6 w-6 shadow-sm cursor-grab active:cursor-grabbing"
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading chains...</p>
          </div>
        )}

        <CardHeader className="p-4 border-b drag-handle cursor-grab active:cursor-grabbing select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center w-full justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />

                <CardTitle className=" font-medium">Data Explorer</CardTitle>
              </div>

              <Button
                variant="ghost"
                aria-label="Close data explorer"
                onClick={() => onClose?.()}
                className="no-drag"
              >
                <X className="w-3 h-3" />
              </Button>
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
                  No datasets Found. You can upload your data to Sandworm via
                  the UI and query it like any other table.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Rnd>
  );
}
