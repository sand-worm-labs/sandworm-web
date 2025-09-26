import MainLayout from "@/layouts/MainLayout/MainLayout";
import { SectionHero } from "@/components/Sections/SectionHero";
import { SectionOnboard } from "@/components/Sections/SectionOnboard";
import { SectionVideoPreview } from "@/components/Sections/SectionVideoPreview";
import { SectionAI } from "@/components/Sections/SectionAI";
import { SectionExplore } from "@/components/Sections/SectionExpore";
import { SectionLaunch } from "@/components/Sections/SectionLaunch";

export default function Home() {
  return (
    <MainLayout>
      <SectionHero />
      <SectionVideoPreview />
      <SectionLaunch />
      <SectionExplore />
      <SectionAI />
      {/*       <SectionWorkFlow />
       */}{" "}
      <SectionOnboard />
    </MainLayout>
  );
}
