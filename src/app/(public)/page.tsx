import MainLayout from "@/layouts/MainLayout/MainLayout";
import { SectionFeatures } from "@/components/Sections/SectionFeatures";
import { SectionHero } from "@/components/Sections/SectionHero";
import { SectionWorkFlow } from "@/components/Sections/SectionWorkFlow";
import { SectionOnboard } from "@/components/Sections/SectionOnboard";
import PinnedContent from "@/components/Sections/PinnedSection";

export default function Home() {
  return (
    <MainLayout>
      <SectionHero />
      <SectionFeatures />
      {/*       <SectionWorkFlow />
       */}{" "}
      <PinnedContent />
      <SectionOnboard />
    </MainLayout>
  );
}
