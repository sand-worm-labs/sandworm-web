"use client";

import React, { useState, useEffect } from "react";
import { GripHorizontal, X, ChevronRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Transition } from "@headlessui/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@sandworm/ui/components/card";
import { Input } from "@sandworm/ui/components/input";
import { Button } from "@sandworm/ui/components/button";
import { ChevronDoubleRightIcon } from "@heroicons/react/20/solid";

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
      <Transition
        show={visible}
        as="div"
        className="top-0 right-0 h-full absolute z-30"
        enter="transition ease-in-out duration-300 transform"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        {onHide && (
          <button
            type="button"
            className="absolute z-10 top-7 transform rounded-full border border-gray-300 dark:border-border-tertiary text-ink-400 bg-white dark:bg-base-100  hover:bg-gray-100 dark:hover:bg-gray-900 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2"
            onClick={onHide}
            aria-label="Close data explorer"
          >
            <ChevronDoubleRightIcon className="w-3 h-3" />
          </button>
        )}

        <Card className="h-full overflow-hidden border-l dark:border-border-tertiary border-border-secondary rounded-none w-[354px] bg-white dark:bg-base-100  gap-y-0 pt-0">
          {loading && (
            <div className="flex items-center justify-center h-full"> </div>
          )}

          {mode === "sidebar" ? (
            <div className="px-4 xl:px-6 pt-6 pb-5 border-b border-[#E9ECEF] dark:border-border-tertiary">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-ink-100 dark:text-white">
                    Data Explorer
                  </h3>
                  <p className="text-ink-300 text-sm pt-1">
                    Browse and explore your blockchain data
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-ink-400" />
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-[#E9ECEF] dark:border-border-tertiary">
              <div className="flex items-center gap-2">
                <Database />
                <h3 className="font-medium text-ink-100 dark:text-white">
                  Data Explorer
                </h3>
              </div>
            </div>
          )}

          <CardContent className="p-2 px-0 h-[calc(100%-60px)] overflow-y-auto">
            {chains && chains.length > 0 ? (
              <div className="space-y-2">
                <ExplorerBreadCrumbs
                  basePath={basePath}
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
      </Transition>
    );
  }

  if (!visible) return null;

  return (
    <Card className="h-full overflow-hidden relative border-[#E9ECEF] dark:border-border-tertiary border-2 gap-y-0 min-w-[310px]">
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

      <CardHeader className="p-4 pt-0 border-b drag-handle cursor-grab active:cursor-grabbing select-none border-[#E9ECEF] dark:border-border-tertiary mb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database />
              <CardTitle className="font-medium">Data Explorer</CardTitle>
            </div>

            {onHide && (
              <Button
                variant="ghost"
                aria-label="Close data explorer"
                onClick={onHide}
                className="no-drag"
              >
                <X className="w-5 h-5 text-base-100" strokeWidth={1.4} />
              </Button>
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
