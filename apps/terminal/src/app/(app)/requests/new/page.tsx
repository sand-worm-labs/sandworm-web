import { CommissionDialog } from "@/features/requests/commission/CommissionDialog";
import { loadRequestsScreen } from "@/features/requests/load";
import { RequestsScreen } from "@/features/requests/RequestsScreen";

export default async function CommissionRoute() {
  const { data, counts, session } = await loadRequestsScreen();

  return (
    <>
      <RequestsScreen data={data} counts={counts} />
      <CommissionDialog
        allowance={data.allowance}
        clientName={session.client.name}
      />
    </>
  );
}
