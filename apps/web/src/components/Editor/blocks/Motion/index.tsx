import clsx from "clsx";
import {
  PiChartBar,
  PiFilmSlate,
  PiPlay,
  PiTextAa,
  PiTextT,
} from "react-icons/pi";

import type { ApiDocument } from "@/types";
import Layout from "@/components/Visualization/Layout";
import { ThemeTogggle } from "@/components/Theme/ThemeToggle";

import DashboardNotebookGroupButton from "../DashboarNotebookGroupButton";
import { TopBarLead } from "../TopBarLead";

interface Props {
  document: ApiDocument;
  role: string;
}

// Layout only. Nothing here is wired to the notebook yet: the scenes below are
// stand-ins that show where real ones will go, so the page can be reviewed.
const PLACEHOLDER_SCENES = [
  { id: "title", label: "Title card", kind: "title", seconds: 3 },
  { id: "text", label: "Text card", kind: "text", seconds: 4 },
  { id: "chart-1", label: "Chart", kind: "chart", seconds: 6 },
  { id: "chart-2", label: "Chart", kind: "chart", seconds: 6 },
] as const;

const KIND_ICON = {
  title: PiTextAa,
  text: PiTextT,
  chart: PiChartBar,
} as const;

const TOTAL_SECONDS = PLACEHOLDER_SCENES.reduce((sum, s) => sum + s.seconds, 0);

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// =====================================
// ⬢ Scene list (left rail)
// =====================================
function SceneList() {
  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-border-secondary">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border-secondary">
        <span className="text-[13px] font-medium text-ink-100">Scenes</span>
        <span className="text-xs text-ink-400">
          {PLACEHOLDER_SCENES.length} · {formatTime(TOTAL_SECONDS)}
        </span>
      </div>

      <ol className="flex flex-col gap-y-2 p-3 overflow-y-auto">
        {PLACEHOLDER_SCENES.map((scene, index) => {
          const Icon = KIND_ICON[scene.kind];
          return (
            <li
              key={scene.id}
              className={clsx(
                "flex items-center gap-x-3 rounded-lg border px-3 py-2.5 bg-base-600",
                index === 0 ? "border-primary" : "border-border-secondary"
              )}
            >
              <span className="text-xs text-ink-400 w-4 shrink-0">
                {index + 1}
              </span>
              <Icon className="w-4 h-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-100">
                {scene.label}
              </span>
              <span className="text-xs text-ink-400 shrink-0">
                {scene.seconds}s
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-auto px-4 py-3 text-xs text-ink-400 border-t border-border-secondary">
        Sample scenes. They will be built from this notebook&apos;s charts and
        text.
      </p>
    </aside>
  );
}

// =====================================
// ⬢ Preview + transport + timeline (main area)
// =====================================
function Stage() {
  return (
    <section className="flex-1 min-w-0 flex flex-col items-center gap-y-5 p-6 overflow-y-auto">
      {/* 16:9 frame, the same ratio the video renders at (1920×1080). */}
      <div className="w-full max-w-4xl">
        <div className="aspect-video w-full rounded-xl border border-border-secondary bg-base-600 flex flex-col items-center justify-center gap-y-2 text-ink-400">
          <PiFilmSlate className="w-10 h-10" />
          <span className="text-sm">Preview</span>
          <span className="text-xs">Not connected to this notebook yet</span>
        </div>

        {/* Transport */}
        <div className="mt-4 flex items-center gap-x-4">
          <button
            type="button"
            disabled
            aria-label="Play"
            className="flex items-center justify-center w-9 h-9 rounded-full border-[1.5px] border-primary text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PiPlay className="w-4 h-4" />
          </button>
          <input
            type="range"
            disabled
            min={0}
            max={TOTAL_SECONDS}
            defaultValue={0}
            aria-label="Seek"
            className="flex-1 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-xs tabular-nums text-ink-400 w-20 text-right">
            {formatTime(0)} / {formatTime(TOTAL_SECONDS)}
          </span>
        </div>

        {/* Timeline: one segment per scene, width proportional to its length. */}
        <div className="mt-4 flex h-10 gap-x-1">
          {PLACEHOLDER_SCENES.map((scene, index) => (
            <div
              key={scene.id}
              style={{ flexGrow: scene.seconds }}
              className={clsx(
                "min-w-0 flex items-center px-2 rounded-md border text-xs truncate",
                index === 0
                  ? "border-primary text-primary"
                  : "border-border-secondary text-ink-400"
              )}
            >
              {scene.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================
// ⬢ Motion
// =====================================
export default function Motion(props: Props) {
  const documentTitle = props.document.title || "Untitled";

  const topBarContent = (
    <div className="flex items-center w-full justify-between gap-x-6">
      <TopBarLead viewing title={documentTitle} />
      <DashboardNotebookGroupButton
        workspaceId={props.document.workspaceId}
        documentId={props.document.id}
        current="motion"
        isEditing={false}
        userRole={props.role}
        isPublished={props.document.publishedAt !== null}
      />
      <div className="w-full justify-end flex items-center gap-x-0.5 h-[30px]">
        <ThemeTogggle iconSize={18} />
      </div>
    </div>
  );

  return (
    <Layout
      topBarClassname="dark:bg-header-surface"
      topBarContent={topBarContent}
    >
      <div className="flex flex-1 min-w-0 min-h-0 bg-page-surface">
        <SceneList />
        <Stage />
      </div>
    </Layout>
  );
}
