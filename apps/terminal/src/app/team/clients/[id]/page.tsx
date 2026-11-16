import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/Shell/AppShell";
import { ClientScreen } from "@/components/Team/ClientScreen";
import { getHeaderAccount } from "@/lib/auth/account";
import { pageMetadata } from "@/lib/metadata";
import { getTeamClient, getTeamClientKpis } from "@/lib/team/source";

type ClientRouteProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: ClientRouteProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getTeamClient(id);
  return client ? pageMetadata(client.name) : {};
}

export default async function ClientRoute({ params }: ClientRouteProps) {
  const { id } = await params;
  const [client, account, kpis] = await Promise.all([
    getTeamClient(id),
    getHeaderAccount(),
    getTeamClientKpis(id),
  ]);
  if (!client) notFound();

  return (
    <AppShell account={account}>
      <ClientScreen client={client} kpis={kpis} />
    </AppShell>
  );
}
