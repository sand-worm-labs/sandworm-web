import { AppShell } from "@/components/Shell/AppShell";
import { ClientsScreen } from "@/components/Team/ClientsScreen";
import { getHeaderAccount } from "@/lib/auth/account";
import { listTeamClients } from "@/lib/team/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Clients");

type TeamRouteProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function TeamRoute({ searchParams }: TeamRouteProps) {
  const [clients, account, { created }] = await Promise.all([
    listTeamClients(),
    getHeaderAccount(),
    searchParams,
  ]);

  return (
    <AppShell account={account}>
      <ClientsScreen clients={clients} createdName={created} />
    </AppShell>
  );
}
