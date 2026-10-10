import type { Metadata } from "next";

import { ShowcaseStudio } from "@/components/ShowcaseStudio";

// An internal tool: kept out of search results.
export const metadata: Metadata = {
  title: "Showcase studio",
  robots: { index: false, follow: false },
};

export default function ShowcaseStudioPage() {
  return (
    <div className="h-[100dvh] overflow-y-auto bg-page-surface font-body">
      <ShowcaseStudio />
    </div>
  );
}
