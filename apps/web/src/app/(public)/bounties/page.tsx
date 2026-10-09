import { PublicBounties } from "@/components/Bounties/PublicBounties";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";

export const metadata = {
  title: "Bounties – Sandworm",
  description:
    "Answer a sponsor's onchain question with a Sandworm notebook and compete for the reward.",
};

export default function PublicBountiesPage() {
  return (
    <div className="flex flex-col h-screen bg-base-100 font-body">
      <ShowcaseHeader active="bounties" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-page-surface dark:text-white">
        <div className="pt-5 px-8 pb-10">
          <PublicBounties />
        </div>
      </main>
    </div>
  );
}
