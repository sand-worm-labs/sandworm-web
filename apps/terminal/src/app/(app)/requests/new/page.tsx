import { CommissionDialog } from "@/features/requests/commission/CommissionDialog";
import { loadRequestsScreen } from "@/features/requests/load";
import { RequestsScreen } from "@/features/requests/RequestsScreen";

export default async function CommissionRoute() {
  const { data, counts, session } = await loadRequestsScreen();
  const { analyst, name: clientName } = {
    analyst: session.client.analyst,
    name: session.client.name,
  };

  return (
    <>
      <RequestsScreen data={data} counts={counts} analyst={analyst} />
      <CommissionDialog
        allowance={data.allowance}
        analystName={analyst.name}
        clientName={clientName}
      />
    </>
  );
}
