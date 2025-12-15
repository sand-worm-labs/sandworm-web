"use client";

import MainLayout from "@/layouts/MainLayout/MainLayout";
import { SectionHero } from "@/components/Sections/SectionHero";
import { SectionOnboard } from "@/components/Sections/SectionOnboard";
import { SectionVideoPreview } from "@/components/Sections/SectionVideoPreview";
import { SectionAI } from "@/components/Sections/SectionAI";
import { SectionFeatures } from "@/components/Sections/SectionLaunch";
import { SectionWorkFlow } from "@/components/Sections/SectionWorkFlow";

export default function Home() {
  return (
    <MainLayout>
      <SectionHero />
      <div className="relative z-10">
        <SectionVideoPreview />
        <SectionFeatures />
        <SectionAI />
        <SectionWorkFlow />
        <SectionOnboard />
      </div>
    </MainLayout>
  );
}
