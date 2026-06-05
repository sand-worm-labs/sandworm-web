/* eslint-disable react/jsx-no-useless-fragment */

"use client";

import React, { useState, useEffect } from "react";
import { GripHorizontal } from "lucide-react";
import { PiDatabaseLight } from "react-icons/pi";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@sandworm/ui/components/card";
import { Input } from "@sandworm/ui/components/input";
import { Button } from "@sandworm/ui/components/button";

import { CloseIconButton } from "@/components/CloseIconButton";
import { useChainStore } from "@/store/chains";
import {
  ChainListPanel,
  ExplorerBreadCrumbs,
  EntityListPanel,
  FieldDetailsPanel,
} from "@/components/ExplorerPanels";

import { Database } from "../Assets/Database";

type EntityType = "raw" | "project" | "decoded";

interface DataExplorerContentProps {
  visible?: boolean;
  onHide?: () => void;
  showDragHandle?: boolean;
  mode?: "draggable" | "sidebar";
  basePath?: string;
}

export function DataExplorerContent({
  visible = true,
  onHide,
  showDragHandle = true,
  mode = "draggable",
  basePath,
}: DataExplorerContentProps) {
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

  // Sidebar mode with transition
  if (mode === "sidebar") {
    return (
      <>
        {visible && (
          <Card className="h-full overflow-hidden rounded-none w-full bg-white dark:bg-base-100 gap-y-0 pt-0">
            {loading && (
              <div className="flex items-center justify-center h-full" />
            )}

            <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
                    <PiDatabaseLight size={18} className="flex-shrink-0" />
                    Data Explorer
                  </h3>
                  <p className="text-[12.5px] text-ink-400 mt-0.5">
                    Browse and explore your blockchain data
                  </p>
                </div>
                {onHide && (
                  <CloseIconButton
                    size="sm"
                    round
                    onClick={onHide}
                    aria-label="Close data explorer"
                  />
                )}
              </div>
            </div>

            <CardContent className="p-2 px-0 h-[calc(100%-60px)] overflow-y-auto">
              {chains && chains.length > 0 ? (
                <div className="space-y-2">
                  <ExplorerBreadCrumbs
                    basePath={basePath}
                    entities={
                      entityData || { raw: [], project: [], decoded: [] }
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="m-auto w-[calc(100%-2rem)] focus:ring-0 hidden"
                  />
                  <ul className="pt-0 mt-0" style={{ marginTop: 0 }}>
                    {renderExplorer()}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  if (!visible) return null;

  return (
    <Card className="h-full overflow-hidden relative  gap-y-0 min-w-[310px] border-none">
      {showDragHandle && (
        <div
          aria-label="Drag panel"
          className="border rounded drag-handle absolute left-1/2 -translate-x-1/2 top-4 -translate-y-1/2 z-10 p-1 h-6 w-8 shadow-sm cursor-grab active:cursor-grabbing border-[#EFF0F6] dark:border-border-tertiary"
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading chains...</p>
        </div>
      )}

      <CardHeader className="p-4 pt-0 border-b drag-handle cursor-grab active:cursor-grabbing select-none border-border-secondary  dark:border-border-tertiary mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database />
              <CardTitle className="font-medium">Data Explorer</CardTitle>
            </div>

            {onHide && (
              <CloseIconButton
                size="sm"
                aria-label="Close data explorer"
                onClick={onHide}
                className="no-drag"
              />
            )}
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
              className="m-auto w-[calc(100%-2rem)] focus:ring-0 hidden"
            />

            <ul className="pt-0 mt-0" style={{ marginTop: 0 }}>
              {renderExplorer()}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
