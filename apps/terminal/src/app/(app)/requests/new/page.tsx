import { SubmitRequestDialog } from "@/components/Requests/Submit/SubmitRequestDialog";
import { loadRequestsScreen } from "@/lib/requests/load";
import { RequestsScreen } from "@/components/Requests/RequestsScreen";

export default async function NewRequestRoute() {
  const { data, counts, session } = await loadRequestsScreen();

  return (
    <>
      <RequestsScreen data={data} counts={counts} />
      <SubmitRequestDialog
        allowance={data.allowance}
        clientName={session.client.name}
      />
    </>
  );
}
