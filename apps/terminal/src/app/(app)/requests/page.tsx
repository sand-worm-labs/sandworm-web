import { getSectionCounts } from "@/lib/sections/source";
import { RequestsScreen } from "@/components/Requests/RequestsScreen";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Requests");

export default async function RequestsRoute() {
  return <RequestsScreen counts={await getSectionCounts()} />;
}
