"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import { Button, buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { SearchField } from "@sandworm/ui/kit/form/search-field";
import { InitialsAvatar } from "@sandworm/ui/kit/initials-avatar";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";

import { AppLink } from "@/components/AppLink";
import { KpiStrip } from "@/components/Analysis/Entity/KpiStrip";
import {
  getOrganisationType,
  ORGANISATION_TYPES,
} from "@/data/setup/organisation-types";
import { formatShortDate, pluralise } from "@/lib/format";
import { sendTeamInvite } from "@/lib/team/actions";
import {
  countByStatus,
  countByType,
  filterClients,
  type ClientTypeFilter,
} from "@/lib/team/client-list-state";
import { getPlan } from "@/data/team/plans";
import type { TeamClientSummary } from "@/types";

import { ClientStatusChip } from "./ClientStatusChip";

const headerCellClassName = "px-3 py-2.5 text-xs font-medium text-ink-400";
const cellClassName = "border-t border-border-secondary px-3 py-3 align-middle";

type ClientsScreenProps = {
  clients: readonly TeamClientSummary[];
  createdName?: string;
};

export function ClientsScreen({ clients, createdName }: ClientsScreenProps) {
  const router = useRouter();
  const [type, setType] = useState<ClientTypeFilter>("all");
  const [query, setQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const typeOptions = [
    { id: "all" as const, label: "All" },
    ...ORGANISATION_TYPES.map(({ id, label }) => ({ id, label })),
  ].map(option => ({ ...option, count: countByType(clients, option.id) }));
  const visible = filterClients(clients, { type, query });

  const markInviteSent = async (clientId: string) => {
    setSendingId(clientId);
    try {
      await sendTeamInvite(clientId);
      router.refresh();
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-medium leading-tight text-ink-100">
            Clients
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {pluralise(clients.length, "client")} set up for Terminal.
          </p>
        </div>
        <AppLink
          route="newClient"
          className={buttonClassName({ className: "gap-2" })}
        >
          <PiPlus size={14} />
          New client
        </AppLink>
      </div>
      {createdName && (
        <p
          role="status"
          className="rounded-[14px] bg-primary-tint-75 px-4 py-3 text-sm text-primary-700 ring-1 ring-inset ring-primary-tint-100 dark:bg-primary-910 dark:text-primary-200 dark:ring-border-tertiary"
        >
          <span className="font-medium">{createdName}</span> is set up. Its
          admin joins by signing in to Terminal with the invited email.
        </p>
      )}
      <KpiStrip
        label="Team numbers"
        kpis={[
          {
            id: "live",
            label: "Live clients",
            value: String(countByStatus(clients, "live")),
          },
          {
            id: "invited",
            label: "Invite sent",
            value: String(countByStatus(clients, "invite_sent")),
          },
          {
            id: "setting-up",
            label: "Setting up",
            value: String(countByStatus(clients, "setting_up")),
          },
        ]}
      />
      <Card aria-label="All clients" className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-5 py-4">
          <SegmentedControl
            label="Client type"
            options={typeOptions}
            value={type}
            onChange={setType}
          />
          <SearchField
            label="Search clients"
            placeholder="Search clients"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="w-[240px] max-w-full"
          />
        </div>
        {visible.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-ink-400">
            {clients.length === 0
              ? "No clients yet. Set up the first one."
              : "No client matches."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-0 px-2 pb-2.5 pt-1.5 text-left text-[13px]">
              <thead>
                <tr>
                  <th scope="col" className={headerCellClassName}>
                    Client
                  </th>
                  <th scope="col" className={headerCellClassName}>
                    Type
                  </th>
                  <th scope="col" className={headerCellClassName}>
                    Plan
                  </th>
                  <th scope="col" className={headerCellClassName}>
                    Admin
                  </th>
                  <th scope="col" className={headerCellClassName}>
                    Status
                  </th>
                  <th scope="col" className={headerCellClassName}>
                    Added
                  </th>
                  <th scope="col" className={headerCellClassName}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map(client => (
                  <tr key={client.id}>
                    <th
                      scope="row"
                      className={`${cellClassName} font-medium text-ink-100`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <InitialsAvatar
                          initials={client.name.charAt(0)}
                          size="sm"
                        />
                        {client.name}
                      </span>
                    </th>
                    <td className={`${cellClassName} text-ink-500`}>
                      {getOrganisationType(client.type).label}
                    </td>
                    <td className={`${cellClassName} text-ink-500`}>
                      {getPlan(client.plan).label}
                    </td>
                    <td className={`${cellClassName} text-ink-500`}>
                      {client.adminEmail ?? "—"}
                    </td>
                    <td className={cellClassName}>
                      <ClientStatusChip status={client.status} />
                    </td>
                    <td className={`${cellClassName} text-ink-400`}>
                      {formatShortDate(client.createdAt)}
                    </td>
                    <td className={`${cellClassName} text-right`}>
                      {client.status === "setting_up" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={sendingId === client.id}
                          onClick={() => markInviteSent(client.id)}
                        >
                          Mark invite sent
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
