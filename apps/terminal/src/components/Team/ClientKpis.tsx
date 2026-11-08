"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { NativeSelect } from "@sandworm/ui/kit/form/native-select";
import { TextField } from "@sandworm/ui/kit/form/text-field";
import { TONE_TEXT_CLASSNAME } from "@sandworm/ui/kit/tone";
import type { KpiDirection, KpiFormatKind } from "@sandworm/types/terminal";

import { shortDay } from "@/lib/dates";
import {
  deleteTeamKpi,
  recordTeamKpiValue,
  saveTeamKpi,
  type TeamActionResult,
} from "@/lib/team/actions";
import { parseKpiNumber, slugifyKey } from "@/lib/team/kpi-form";
import type { TeamKpi } from "@/types";

const FORMAT_OPTIONS: readonly { id: KpiFormatKind; label: string }[] = [
  { id: "number", label: "Number" },
  { id: "currency", label: "Dollars" },
  { id: "percent", label: "Percent" },
  { id: "text", label: "Words" },
];

const DIRECTION_OPTIONS: readonly { id: KpiDirection; label: string }[] = [
  { id: "up_good", label: "Up is good" },
  { id: "down_good", label: "Down is good" },
  { id: "neutral", label: "Neither" },
];

const headerCellClassName = "px-3 py-2.5 text-xs font-medium text-ink-400";
const cellClassName = "border-t border-border-secondary px-3 py-3 align-middle";

type ClientKpisProps = { clientId: string; kpis: readonly TeamKpi[] };

// A client's key numbers: what its Overview shows. Each is a definition (what
// it is, how it is written, which way is good) with readings the team records
// by hand until a notebook or an agent writes them.
export function ClientKpis({ clientId, kpis }: ClientKpisProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Runs a change, then reloads the page's data; a refusal is shown as it is
  const apply = async (id: string, change: () => Promise<TeamActionResult>) => {
    setBusyId(id);
    setMessage(null);
    try {
      const result = await change();
      if (result.ok) router.refresh();
      else setMessage(result.message);
      return result.ok;
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card aria-labelledby="kpis-title" className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-3 pt-[22px]">
        <div>
          <h2 id="kpis-title" className="text-base font-medium text-ink-100">
            Key numbers
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-400">
            What this client&apos;s Overview shows at the top. Hidden ones stay
            here.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAdding(open => !open)}
        >
          {isAdding ? "Cancel" : "Add key number"}
        </Button>
      </div>
      {isAdding && (
        <AddKpiForm
          onAdd={async input => {
            const added = await apply("new", () =>
              saveTeamKpi(clientId, input)
            );
            if (added) setIsAdding(false);
          }}
          isBusy={busyId === "new"}
        />
      )}
      {kpis.length === 0 ? (
        <p className="border-t border-border-secondary px-6 py-10 text-center text-sm text-ink-400">
          No key numbers yet. Add one, then record its first reading.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-0 px-2 pb-2.5 text-left text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={headerCellClassName}>
                  Key number
                </th>
                <th scope="col" className={headerCellClassName}>
                  Shows
                </th>
                <th scope="col" className={headerCellClassName}>
                  Last reading
                </th>
                <th scope="col" className={headerCellClassName}>
                  Record a reading
                </th>
                <th scope="col" className={headerCellClassName}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {kpis.map(kpi => (
                <KpiRow
                  key={kpi.id}
                  kpi={kpi}
                  isBusy={busyId !== null}
                  onRecord={input =>
                    apply(kpi.id, () => recordTeamKpiValue(kpi.id, input))
                  }
                  onToggle={() =>
                    apply(kpi.id, () =>
                      saveTeamKpi(clientId, {
                        key: kpi.key,
                        isVisible: !kpi.isVisible,
                      })
                    )
                  }
                  onDelete={() => {
                    // eslint-disable-next-line no-alert
                    const isSure = window.confirm(
                      `Delete "${kpi.label}" and its readings?`
                    );
                    if (isSure) apply(kpi.id, () => deleteTeamKpi(kpi.id));
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {message && (
        <p
          role="alert"
          className="border-t border-border-secondary px-6 py-3 text-xs text-ink-navy dark:text-ink-200"
        >
          {message}
        </p>
      )}
    </Card>
  );
}

type KpiRowProps = {
  kpi: TeamKpi;
  isBusy: boolean;
  onRecord: (input: { value?: number; textValue?: string }) => Promise<boolean>;
  onToggle: () => void;
  onDelete: () => void;
};

function KpiRow({ kpi, isBusy, onRecord, onToggle, onDelete }: KpiRowProps) {
  const [reading, setReading] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const isText = kpi.format.kind === "text";
  const { delta, comparison } = kpi.display;

  const record = async () => {
    const value = isText ? null : parseKpiNumber(reading);
    if (isText ? !reading.trim() : value === null) {
      setProblem(
        isText ? "Type the words to show" : "Not a number: try 1.84B or 34%"
      );
      return;
    }
    setProblem(null);
    const saved = await onRecord(
      isText ? { textValue: reading.trim() } : { value: value! }
    );
    if (saved) setReading("");
  };

  return (
    <tr className={kpi.isVisible ? undefined : "opacity-60"}>
      <th scope="row" className={`${cellClassName} font-medium text-ink-100`}>
        <span className="flex flex-col">
          {kpi.label}
          <span className="font-mono text-xs font-normal text-ink-400">
            {kpi.key}
            {!kpi.isVisible && " · hidden"}
          </span>
        </span>
      </th>
      <td className={`${cellClassName} text-ink-100`}>
        <span className="font-medium">{kpi.display.value}</span>
        {delta && (
          <span className={`ml-2 text-xs ${TONE_TEXT_CLASSNAME[delta.tone]}`}>
            {delta.text}
          </span>
        )}
        {comparison && (
          <span className="ml-1 text-xs text-ink-400">{comparison}</span>
        )}
      </td>
      <td className={`${cellClassName} text-ink-500`}>
        {kpi.lastReadingAt ? shortDay(kpi.lastReadingAt) : "No readings"}
      </td>
      <td className={cellClassName}>
        <form
          className="flex items-center gap-2"
          onSubmit={event => {
            event.preventDefault();
            record();
          }}
        >
          <TextField
            id={`reading-${kpi.id}`}
            label={`New reading for ${kpi.label}`}
            hideLabel
            value={reading}
            placeholder={isText ? "Words to show" : "e.g. 1.84B"}
            onChange={event => setReading(event.target.value)}
            className="w-36"
          />
          <Button variant="secondary" size="sm" disabled={isBusy} type="submit">
            Record
          </Button>
        </form>
        {problem && <p className="mt-1 text-xs text-ink-500">{problem}</p>}
      </td>
      <td className={`${cellClassName} text-right`}>
        <span className="inline-flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={onToggle}
          >
            {kpi.isVisible ? "Hide" : "Show"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={onDelete}
          >
            Delete
          </Button>
        </span>
      </td>
    </tr>
  );
}

type AddKpiFormProps = {
  onAdd: (input: {
    key: string;
    label: string;
    direction: KpiDirection;
    format: { kind: KpiFormatKind };
  }) => Promise<void>;
  isBusy: boolean;
};

function AddKpiForm({ onAdd, isBusy }: AddKpiFormProps) {
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<KpiFormatKind>("number");
  const [direction, setDirection] = useState<KpiDirection>("up_good");
  const key = slugifyKey(label);

  return (
    <form
      className="flex flex-wrap items-end gap-3 border-t border-border-secondary px-6 py-4"
      onSubmit={event => {
        event.preventDefault();
        if (key)
          onAdd({ key, label: label.trim(), direction, format: { kind } });
      }}
    >
      <TextField
        id="new-kpi-label"
        label="Name"
        value={label}
        placeholder="e.g. Swap volume"
        onChange={event => setLabel(event.target.value)}
        className="w-64"
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink-100">Written as</span>
        <NativeSelect
          label="Written as"
          value={kind}
          options={FORMAT_OPTIONS}
          onChange={setKind}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink-100">
          Which way is good
        </span>
        <NativeSelect
          label="Which way is good"
          value={direction}
          options={DIRECTION_OPTIONS}
          onChange={setDirection}
        />
      </div>
      <Button disabled={isBusy || !key} type="submit">
        Add
      </Button>
      {key && (
        <span className="pb-2 font-mono text-xs text-ink-400">{key}</span>
      )}
    </form>
  );
}
