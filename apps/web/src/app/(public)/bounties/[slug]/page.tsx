import { PublicBountyDetail } from "@/components/Bounties/BountyPages";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";

export const metadata = {
  title: "Bounty – Sandworm",
  description:
    "Answer a sponsor's onchain question with a Sandworm notebook and compete for the reward.",
};

export default function PublicBountyPage() {
  return (
    <div className="flex flex-col h-screen bg-base-100 font-body">
      <ShowcaseHeader active="bounties" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-page-surface dark:text-white">
        <div className="pt-5 px-4 sm:px-8 pb-10">
          <PublicBountyDetail />
        </div>
      </main>
    </div>
  );
}
