import { SubmitRequestDialog } from "@/components/Requests/Submit/SubmitRequestDialog";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { RequestsScreen } from "@/components/Requests/RequestsScreen";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Submit a request");

export default async function NewRequestRoute() {
  const [counts, session] = await Promise.all([
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <>
      <RequestsScreen counts={counts} />
      <SubmitRequestDialog clientName={session.client.name} />
    </>
  );
}
