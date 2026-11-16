import { SubmitRequestDialog } from "@/components/Requests/Submit/SubmitRequestDialog";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { RequestsScreen } from "@/components/Requests/RequestsScreen";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Submit a request");

type NewRequestRouteProps = {
  searchParams: Promise<{ question?: string; about?: string }>;
};

export default async function NewRequestRoute({
  searchParams,
}: NewRequestRouteProps) {
  const [counts, session, { question = "", about }] = await Promise.all([
    getSectionCounts(),
    getSession(),
    searchParams,
  ]);

  return (
    <>
      <RequestsScreen counts={counts} />
      <SubmitRequestDialog
        clientName={session.client.name}
        initial={{ question, about: about ? [about] : [] }}
      />
    </>
  );
}
