import { BarLoader } from "@sandworm/ui/kit/bar-loader";

export default function SetupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-surface">
      <BarLoader />
    </div>
  );
}
