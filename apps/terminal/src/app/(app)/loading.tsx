import { BarLoader } from "@sandworm/ui/kit/bar-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}
