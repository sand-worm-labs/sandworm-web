import { SubmitRequestDialog } from "@/features/requests/submit/SubmitRequestDialog";
import { loadRequestsScreen } from "@/features/requests/load";
import { RequestsScreen } from "@/features/requests/RequestsScreen";

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
