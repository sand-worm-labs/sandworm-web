import { useTheme } from "next-themes";

import { useSandwormStore } from "@/store";

import type { EditorThemeId } from "./palettes";

export function useEditorThemeId(): EditorThemeId {
  const { resolvedTheme } = useTheme();
  const light = useSandwormStore(state => state.settings.editorThemeLight);
  const dark = useSandwormStore(state => state.settings.editorThemeDark);
  return resolvedTheme === "dark" ? dark : light;
}
