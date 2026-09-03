"use client";

import React, { useState } from "react";
import { PiMonitor, PiSun, PiMoon } from "react-icons/pi";
import { useTheme } from "next-themes";

import { useSandwormStore } from "@/store";

import {
  THEME_IDS,
  THEME_META,
  THEME_PALETTES,
} from "../Editor/blocks/customBlocks/CodeEditor/palettes";
import type {
  EditorPalette,
  EditorThemeId,
} from "../Editor/blocks/customBlocks/CodeEditor/palettes";
import { useEditorThemeId } from "../Editor/blocks/customBlocks/CodeEditor/useEditorThemeId";

// =====================================
// ⬢ Types
// =====================================
type Theme = "system" | "light" | "dark";
type DateFormat = "us" | "eu" | "iso";

interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// =====================================
// ⬢ Theme Card
// =====================================
const ThemeCard: React.FC<{
  option: ThemeOption;
  selected: boolean;
  onClick: () => void;
}> = ({ option, selected, onClick }) => {
  const bgMap: Record<string, string> = {
    light: "bg-[#FDFDFD]",
    dark: "bg-[#09091B]",
    default: "bg-[#FDFDFD]",
  };

  const dotClass =
    option.id === "light"
      ? "bg-[#E7F3F6]"
      : option.id === "dark"
        ? "bg-[#352F37]"
        : "bg-[#E7F3F6]";

  const barClass =
    option.id === "light"
      ? "bg-[#E7F3F6]"
      : option.id === "dark"
        ? "bg-[#352F37]"
        : "bg-[#E7F3F6]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full p-6  border border-border-secondary  dark:border-border-tertiary transition-all text-left  rounded-3xl dark:bg-dropdown-bg ${
        selected ? "" : "border-border-secondary    dark:border-border-tertiary"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full ${
            selected
              ? "bg-[#EFF1F2] dark:bg-base-500  border dark:border-border-tertiary border-border-secondary "
              : "bg-[#EFF1F2] dark:bg-base-500 text-gray-600 dark:text-ink-400 border border-border-secondary  dark:border-border-tertiary"
          }`}
        >
          {option.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-ink-100 ">{option.label}</h3>
            {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <p className="text-sm text-ink-400 dark:text-ink-400">
            {option.description}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl overflow-hidden border border-border-secondary dark:border-border-tertiary">
        <div className={`h-32 p-3 ${bgMap[option.id] ?? bgMap.default}`}>
          <div className="flex gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${dotClass}`} />
            <div className={`w-2 h-2 rounded-full ${dotClass}`} />
            <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          </div>
          <div
            className={`space-y-2 ${
              option.id === "light" ? "opacity-95" : "opacity-95"
            }`}
          >
            <div className={`h-10 rounded-xl ${barClass}`} />
            <div className={`h-2 w-3/4 rounded ${barClass}`} />
            <div className={`h-2 w-1/2 rounded ${barClass}`} />
          </div>
        </div>
      </div>
    </button>
  );
};

// =====================================
// ⬢ Editor Theme Card
// =====================================
// Preview colors are pulled straight from the theme's real palette (the
// same one CodeMirror uses to render SQL/Python/Markdown), mapped onto
// each token the same way the syntax highlighter maps them — so the card
// is a true preview, not a stand-in.
export const EditorThemeCard: React.FC<{
  label: string;
  palette: EditorPalette;
  selected: boolean;
  onClick: () => void;
}> = ({ label, palette, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-3xl border transition-all text-left dark:bg-dropdown-bg ${
        selected
          ? "border-primary    dark:border-primary"
          : "border-border-secondary  dark:border-border-tertiary hover:border-gray-300 dark:hover:border-border-tertiary font-body"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-medium text-ink-100">{label}</h4>
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div
        className="rounded-xl p-3 font-body-mono text-xs leading-relaxed border"
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          borderColor: palette.border,
        }}
      >
        <div>
          <span style={{ color: palette.keyword }}>SELECT</span> wallet,{" "}
          <span style={{ color: palette.builtin }}>SUM</span>(volume)
        </div>
        <div>
          <span style={{ color: palette.keyword }}>FROM</span> transactions
        </div>
        <div>
          <span style={{ color: palette.keyword }}>WHERE</span> chain ={" "}
          <span style={{ color: palette.string }}>&apos;ethereum&apos;</span>
        </div>
        <div className="pl-4">
          <span style={{ color: palette.keyword }}>GROUP BY</span> wallet
        </div>
        <div style={{ color: palette.comment }}>-- {label.toLowerCase()}</div>
      </div>
    </button>
  );
};

// =====================================
// ⬢ Preference Main Component
// =====================================
const Preferences: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const editorThemeId = useEditorThemeId();
  const setEditorTheme = useSandwormStore(state => state.setEditorTheme);
  const [dateFormat, setDateFormat] = useState<DateFormat>("us");

  const isDarkMode = resolvedTheme === "dark";
  const visibleThemeIds = THEME_IDS.filter(
    id => THEME_META[id].dark === isDarkMode
  );

  // ⬢ Theme Options
  // =====================================
  const themeOptions: ThemeOption[] = [
    {
      id: "system",
      label: "System preference",
      description: "Automatically match your system theme settings",
      icon: <PiMonitor className="w-5 h-5" />,
    },
    {
      id: "light",
      label: "Light theme",
      description: "Bright and clean interface for daytime use",
      icon: <PiSun className="w-5 h-5" />,
    },
    {
      id: "dark",
      label: "Dark theme",
      description: "Easy on the eyes for extended work sessions",
      icon: <PiMoon className="w-5 h-5" />,
    },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen   transition-colors font-body">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-ink-100 mb-2">Preferences</h2>
          <p className="text-ink-400 dark:text-ink-400 text-sm">
            Manage your interface and privacy settings{" "}
          </p>
        </div>

        {/* ✦ Appearance Section  ✦ */}
        <div className=" py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-medium text-ink-100 ">Appearance</h2>
              <p className="text-sm text-ink-400 dark:text-ink-400 max-w-[25rem] mt-2 ">
                Choose how Sandworm looks to you. Select a single theme, or sync
                it with your system.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map(option => (
              <ThemeCard
                key={option.id}
                option={option}
                selected={theme === option.id}
                onClick={() => handleThemeChange(option.id)}
              />
            ))}
          </div>
        </div>

        {/* ✦ Editor Theme Section ✦ */}
        <div className=" py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-medium text-ink-100 ">
                Code Editor Theme
              </h2>
              <p className="text-sm text-ink-400 dark:text-ink-400 max-w-[25rem] mt-2 ">
                Select your preferred syntax highlighting theme for the SQL,
                Python, and Markdown editors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleThemeIds.map((id: EditorThemeId) => (
              <EditorThemeCard
                key={id}
                label={THEME_META[id].label}
                palette={THEME_PALETTES[id]}
                selected={editorThemeId === id}
                onClick={() => setEditorTheme(id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
