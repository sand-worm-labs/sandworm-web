import { AppShell } from "@/components/shell/AppShell";
import { ClientsScreen } from "@/features/team/ClientsScreen";
import { listTeamClients } from "@/features/team/source";

type TeamRouteProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function TeamRoute({ searchParams }: TeamRouteProps) {
  const [clients, { created }] = await Promise.all([
    listTeamClients(),
    searchParams,
  ]);

  return (
    <AppShell>
      <ClientsScreen clients={clients} createdName={created} />
    </AppShell>
  );
}
