import { Switch, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { PiGearSixLight } from "react-icons/pi";

import { CloseIconButton } from "@/components/CloseIconButton";
import { useSandwormStore } from "@/store";

import useDocument from "../hooks/useDocument";

import { THEME_IDS, THEME_META } from "./customBlocks/CodeEditor/palettes";
import type { EditorThemeId } from "./customBlocks/CodeEditor/palettes";
import { useEditorThemeId } from "./customBlocks/CodeEditor/useEditorThemeId";

type PageSettingToggleProps = {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function PageSettingToggle(props: PageSettingToggleProps) {
  return (
    <Switch.Group
      as="div"
      className="flex flex-col items-center justify-between py-4 gap-x-16 gap-y-2 w-full px-4"
    >
      <span className="flex flex-grow items-center justify-between w-full">
        <Switch.Label
          as="span"
          className="text-sm font-medium leading-6 text-ink-100 dark:text-white"
          passive
        >
          {props.name}
        </Switch.Label>
        <Switch
          checked={props.enabled}
          onChange={props.onToggle}
          className={clsx(
            props.enabled ? "bg-primary-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          )}
          disabled={props.disabled}
        >
          <span
            aria-hidden="true"
            className={clsx(
              props.enabled ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-page-surface  shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        </Switch>
      </span>
      <span className="text-sm text-ink-400">{props.description}</span>
    </Switch.Group>
  );
}

interface Props {
  workspaceId: string;
  documentId: string;
  visible: boolean;
  onHide: () => void;
}

export default function PageSettingsPanel(props: Props) {
  const [{ document }, api] = useDocument(props.workspaceId, props.documentId);

  const { resolvedTheme } = useTheme();
  const editorThemeId = useEditorThemeId();
  const setEditorTheme = useSandwormStore(state => state.setEditorTheme);
  const visibleThemeIds = THEME_IDS.filter(
    id => THEME_META[id].dark === (resolvedTheme === "dark")
  );

  return (
    <Transition
      as="div"
      show={props.visible}
      className="h-full overflow-hidden flex-shrink-0 font-body "
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <div className="w-full flex flex-col border-l dark:border-border-tertiary border-border-secondary h-full bg-white font-body dark:bg-page-surface ">
        <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
                <PiGearSixLight size={18} className="flex-shrink-0" />
                Page settings
              </h3>
              <p className="text-[12.5px] text-ink-400 mt-0.5">
                Configure this page's behavior and default visualization mode.
              </p>
            </div>
            <CloseIconButton
              size="sm"
              round
              onClick={props.onHide}
              aria-label="Close page settings"
            />
          </div>
        </div>
        <div className="w-full divide-y divide-border-secondary border-b dark:border-border-tertiary border-border-secondary border dark:divide-border-tertiary">
          <PageSettingToggle
            name="Auto-run pending blocks"
            description="Whether sandworm should automatically run unexecuted preceding blocks when a block is executed."
            enabled={document?.runUnexecutedBlocks ?? false}
            onToggle={api.toggleRunUnexecutedBlocks}
          />
          <PageSettingToggle
            name="Run selected SQL only"
            description="Whether sandworm should only run selected code when a SQL block is executed."
            enabled={document?.runSQLSelection ?? false}
            onToggle={api.toggleRunSQLSelection}
          />
          <PageSettingToggle
            name="Share links without sidebar"
            description="Whether the 'copy link' button should include a query parameter to hide the sidebar (open dashboards with the sidebar collapsed)."
            enabled={document?.shareLinksWithoutSidebar ?? false}
            onToggle={api.toggleShareLinksWithoutSidebar}
          />
        </div>

        <div className="w-full px-4 xl:px-6 py-5">
          <h4 className="text-sm font-medium text-ink-100 dark:text-white">
            Code editor theme
          </h4>
          <p className="text-[12.5px] text-ink-400 mt-0.5 mb-3">
            Syntax highlighting for the SQL, Python, and Markdown editors.
          </p>
          <select
            value={editorThemeId}
            onChange={e => setEditorTheme(e.target.value as EditorThemeId)}
            className="block rounded-[10px] border-0 py-1.5 pl-3 pr-10 text-ink-100 dark:text-white bg-white dark:bg-base-710 ring-[1.5px] ring-border-secondary dark:ring-border-tertiary focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 w-full"
          >
            {visibleThemeIds.map((id: EditorThemeId) => (
              <option key={id} value={id}>
                {THEME_META[id].label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Transition>
  );
}
