"use client";

import { useState } from "react";
import Link from "next/link";
import { PiSlidersHorizontal } from "react-icons/pi";
import type { SubjectIcon } from "@sandworm/types/terminal";
import { Button, buttonClassName } from "@sandworm/ui/kit/button";

import { ROUTES } from "@/config/routes";
import { WelcomeDialog } from "@/components/Welcome/WelcomeDialog";
import { dismissWelcome } from "@/lib/welcome/actions";
import type { OverviewData, SectionCounts, WelcomeData } from "@/types";
import { SectionHeader } from "@/components/Sections/SectionHeader";
import { SubjectAvatar } from "@/components/Subject/SubjectAvatar";
import { useBlockVisibility } from "@/hooks/useBlockVisibility";

import { OverviewLayout } from "./OverviewLayout";
import { CustomizeDrawer } from "./CustomizeDrawer";

type OverviewReadyProps = {
  data: OverviewData;
  counts: SectionCounts;
  welcome?: WelcomeData;
  viewer: {
    clientName: string;
    clientIcon: SubjectIcon | null;
    firstName: string;
  };
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
  const changeWelcome = (isOpen: boolean) => {
    setIsWelcoming(isOpen);
    if (!isOpen) dismissWelcome();
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="overview"
        title={viewer.clientName}
        leading={
          <SubjectAvatar
            name={viewer.clientName}
            icon={viewer.clientIcon}
            size="lg"
          />
        }
        subtitle={data.subtitle}
        counts={counts}
        actions={
          <div className="flex gap-2">
            <Link
              href={ROUTES.settings.path}
              className={buttonClassName({ variant: "secondary" })}
            >
              What you track
            </Link>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => setIsCustomizing(true)}
            >
              <PiSlidersHorizontal size={16} className="text-ink-navy" />
              Customize
            </Button>
          </div>
        }
      />
      <OverviewLayout layout={data.layout} blocks={visibleBlocks} />
      {welcome && (
        <WelcomeDialog
          welcome={welcome}
          viewer={viewer}
          isOpen={isWelcoming}
          onOpenChange={changeWelcome}
          onCustomize={() => {
            changeWelcome(false);
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
