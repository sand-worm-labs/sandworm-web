import { WorkspaceBountyDetail } from "@/components/Bounties/BountyPages";

export const metadata = {
  title: "Bounty – Sandworm",
};

export default function BountyPage() {
  return (
    <div className="dark:text-white bg-page-surface min-h-[88vh]">
      <div className="pt-5 px-4 sm:px-8">
        <WorkspaceBountyDetail />
      </div>
    </div>
  );
}
