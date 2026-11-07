import { loadRequestsScreen } from "@/features/requests/load";
import { RequestsScreen } from "@/components/Requests/RequestsScreen";

export default async function RequestsRoute() {
  const { data, counts } = await loadRequestsScreen();

  return <RequestsScreen data={data} counts={counts} />;
}
