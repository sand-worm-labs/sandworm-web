import { loadRequestsScreen } from "@/lib/requests/load";
import { RequestsScreen } from "@/components/Requests/RequestsScreen";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Requests");

export default async function RequestsRoute() {
  const { data, counts } = await loadRequestsScreen();

  return <RequestsScreen data={data} counts={counts} />;
}
