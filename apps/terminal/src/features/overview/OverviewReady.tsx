"use client";

import { useState } from "react";
import { PiSlidersHorizontal } from "react-icons/pi";
import { Button } from "@sandworm/ui/kit/button";

import { WelcomeDialog } from "@/features/welcome/WelcomeDialog";
import type { WelcomeData } from "@/features/welcome/types";
import { SectionHeader } from "@/features/sections/SectionHeader";
import type { SectionCounts } from "@/features/sections/types";

import { OverviewLayout } from "./components/OverviewLayout";
import { CustomizeDrawer } from "./customize/CustomizeDrawer";
import { useBlockVisibility } from "./customize/useBlockVisibility";
import type { OverviewData } from "./types";

type OverviewReadyProps = {
  data: OverviewData;
  counts: SectionCounts;
  welcome?: WelcomeData;
  viewer: { clientName: string; firstName: string };
};

export function OverviewReady({
  data,
  counts,
  welcome,
  viewer,
}: OverviewReadyProps) {
  const { visibleBlocks, hiddenIds, toggle, reset } = useBlockVisibility(
    data.blocks
  );
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isWelcoming, setIsWelcoming] = useState(welcome !== undefined);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="overview"
        title="Overview"
        subtitle={data.subtitle}
        counts={counts}
        actions={
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => setIsCustomizing(true)}
          >
            <PiSlidersHorizontal size={16} className="text-ink-navy" />
            Customize
          </Button>
        }
      />
      <OverviewLayout layout={data.layout} blocks={visibleBlocks} />
      <p className="text-xs text-ink-400">
        Sandworm analysis of onchain data. Estimates, not financial advice.
      </p>
      {welcome && (
        <WelcomeDialog
          welcome={welcome}
          viewer={viewer}
          isOpen={isWelcoming}
          onOpenChange={setIsWelcoming}
          onCustomize={() => {
            setIsWelcoming(false);
            setIsCustomizing(true);
          }}
        />
      )}
      <CustomizeDrawer
        isOpen={isCustomizing}
        onOpenChange={setIsCustomizing}
        blocks={data.blocks.filter(block => block.isOptional)}
        hiddenIds={hiddenIds}
        onToggle={toggle}
        onReset={reset}
        library={data.library}
        typeName={data.typeName}
      />
    </div>
  );
}
