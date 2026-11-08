import { PiCaretLeft } from "react-icons/pi";
import { Card } from "@sandworm/ui/kit/card";
import { UserAvatar } from "@sandworm/ui/kit/user-avatar";

import { AppLink } from "@/components/AppLink";
import { KpiStrip } from "@/components/Analysis/Entity/KpiStrip";
import { getOrganisationType } from "@/data/setup/organisation-types";
import { getPlan } from "@/data/team/plans";
import { shortDay } from "@/lib/dates";
import { pluralise } from "@/lib/format";
import { attentionFor } from "@/lib/team/source-state";
import type { TeamClientDetail, TeamKpi } from "@/types";

import { ClientKpis } from "./ClientKpis";
import { ClientSources } from "./ClientSources";
import { ClientStatusChip } from "./ClientStatusChip";

type ClientScreenProps = {
  client: TeamClientDetail;
  kpis: readonly TeamKpi[];
};

export function ClientScreen({ client, kpis }: ClientScreenProps) {
  const attention = attentionFor(client);

  return (
    <div className="flex flex-col gap-6">
      <AppLink
        route="team"
        className="inline-flex items-center gap-1 self-start text-[13px] text-ink-400 transition-colors hover:text-ink-100"
      >
        <PiCaretLeft size={12} aria-hidden="true" />
        Clients
      </AppLink>
      <header className="flex flex-wrap items-center gap-4">
        <UserAvatar name={client.name} size="md" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-medium leading-tight text-ink-100">
              {client.name}
            </h1>
            <ClientStatusChip status={client.status} />
          </div>
          <p className="text-[13px] text-ink-400">
            {getOrganisationType(client.type).label} ·{" "}
            {getPlan(client.plan).label} plan
            {client.adminEmail && <> · {client.adminEmail}</>}
          </p>
        </div>
      </header>
      <KpiStrip
        label={`${client.name} at a glance`}
        kpis={[
          {
            id: "last-read",
            label: "Last read",
            value: client.lastReadAt ? shortDay(client.lastReadAt) : "Never",
            comparison: pluralise(client.members, "member"),
          },
          {
            id: "requests",
            label: "Open requests",
            value: String(client.openRequests),
            comparison: `${client.researchAllowance} research a year`,
          },
          {
            id: "signals",
            label: "New signals",
            value: String(client.newSignals),
            comparison: "not yet acted on",
          },
          {
            id: "notebooks",
            label: "Notebooks",
            value: String(client.sources.length),
            comparison: "feed this terminal",
          },
        ]}
      />
      {attention.length > 0 && (
        <Card
          aria-labelledby="attention-title"
          className="flex flex-col gap-2 px-6 py-5"
        >
          <h2
            id="attention-title"
            className="text-base font-medium text-ink-100"
          >
            Needs attention
          </h2>
          <ul className="flex flex-col gap-1.5 text-[13px] text-ink-500">
            {attention.map(item => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </Card>
      )}
      <ClientKpis clientId={client.id} kpis={kpis} />
      <ClientSources clientId={client.id} sources={client.sources} />
    </div>
  );
}
