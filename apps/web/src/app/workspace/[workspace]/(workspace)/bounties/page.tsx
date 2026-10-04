import { WorkspaceBounties } from "@/components/Bounties/WorkspaceBounties";

export const metadata = {
  title: "Bounties – Sandworm",
};

export default function BountiesPage() {
  return (
    <div className="dark:text-white bg-page-surface min-h-[88vh]">
      <div className="pt-5 px-8">
        <WorkspaceBounties />
      </div>
    </div>
  );
}
