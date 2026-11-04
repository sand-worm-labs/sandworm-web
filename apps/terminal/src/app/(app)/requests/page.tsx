import { loadRequestsScreen } from "@/features/requests/load";
import { RequestsScreen } from "@/features/requests/RequestsScreen";

export default async function RequestsRoute() {
  const { data, counts, session } = await loadRequestsScreen();

  return (
    <RequestsScreen
      data={data}
      counts={counts}
      analyst={session.client.analyst}
    />
  );
}
