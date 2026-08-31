"use client";

import React, { useState } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

// =====================================
// ⬢ Types
// =====================================
type Theme = "system" | "light" | "dark";
type EditorTheme =
  | "monokai"
  | "dracula"
  | "github"
  | "nord"
  | "solarized"
  | "material";
type DateFormat = "us" | "eu" | "iso";
type AIEditMode = "review" | "auto";

interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface EditorThemeOption {
  id: EditorTheme;
  name: string;
  bg: string;
  text: string;
  accent: string;
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
// ⬢ AI Edit Card
// =====================================
const AIEditCard: React.FC<{
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, description, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full p-5 py-4 border rounded-xl transition-all text-left dark:bg-dropdown-bg ${
        selected
          ? "border-primary dark:border-primary"
          : "border-border-secondary dark:border-border-tertiary"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border border flex items-center justify-center flex-shrink-0 ${
            selected
              ? "border-accent-violet dark:border-primary"
              : "border-border-secondary dark:border-border-tertiary"
          }`}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-accent-violet dark:bg-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-ink-100 mb-1 text-[0.9rem]">
            {label}
          </h3>
          <p
            className={`text-sm ${
              selected
                ? "text-primary dark:text-primary"
                : "text-ink-400 dark:text-ink-400"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

// =====================================
// ⬢ Editor Theme Card
// =====================================
const EditorThemeCard: React.FC<{
  theme: EditorThemeOption;
  selected: boolean;
  onClick: () => void;
}> = ({ theme, selected, onClick }) => {
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
        <h4 className="font-medium text-ink-100  capitalize">{theme.name}</h4>
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div
        className="rounded-xl p-3 font-body-mono text-xs leading-relaxed"
        style={{ backgroundColor: theme.bg, color: theme.text }}
      >
        <div>
          <span style={{ color: theme.accent }}>SELECT</span> wallet,
          SUM(volume)
        </div>
        <div>
          <span style={{ color: theme.accent }}>FROM</span> transactions
        </div>
        <div>
          <span style={{ color: theme.accent }}>WHERE</span> chain = 'ethereum'
        </div>
        <div className="pl-4">
          <span style={{ color: theme.accent }}>GROUP BY</span> wallet
        </div>
      </div>
    </button>
  );
};

// =====================================
// ⬢ Preference Main Component
// =====================================
const Preferences: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("monokai");
  const [dateFormat, setDateFormat] = useState<DateFormat>("us");
  const [aiEditMode, setAIEditMode] = useState<AIEditMode>("review");

  // ⬢ Theme Options
  // =====================================
  const themeOptions: ThemeOption[] = [
    {
      id: "system",
      label: "System preference",
      description: "Automatically match your system theme settings",
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      id: "light",
      label: "Light theme",
      description: "Bright and clean interface for daytime use",
      icon: <Sun className="w-5 h-5" />,
    },
    {
      id: "dark",
      label: "Dark theme",
      description: "Easy on the eyes for extended work sessions",
      icon: <Moon className="w-5 h-5" />,
    },
  ];

  // ⬢ Editor Theme Options
  // =====================================
  const editorThemes: EditorThemeOption[] = [
    {
      id: "monokai",
      name: "Monokai",
      bg: "#272823",
      text: "#F8F8F2",
      accent: "#F92672",
    },
    {
      id: "dracula",
      name: "Dracula",
      bg: "#282B37",
      text: "#f8f8f2",
      accent: "#ff79c6",
    },
    {
      id: "github",
      name: "GitHub",
      bg: "#ffffff",
      text: "#24292e",
      accent: "#005cc5",
    },
    {
      id: "nord",
      name: "Nord",
      bg: "#2E3440",
      text: "#d8dee9",
      accent: "#88c0d0",
    },
    {
      id: "solarized",
      name: "Solarized Dark",
      bg: "#002B36",
      text: "#839496",
      accent: "#268bd2",
    },
    {
      id: "material",
      name: "Material",
      bg: "#263339",
      text: "#eeffff",
      accent: "#c792ea",
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

        {/* ✦ Data & Performance  ✦ */}
        <div className=" py-8  flex ">
          <div className="flex flex-1 items-start gap-3 mb-6">
            <div className="">
              <h2 className="text-lg font-medium text-ink-100 ">
                Regional and Data
              </h2>
              <p className="text-sm text-ink-400 dark:text-ink-400 max-w-[25rem] mt-2 ">
                Set your region and preferred currency to be displayed.{" "}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-6">
              <div>
                <label className="block xl:text-sm text-xs font-bold text-ink-400 dark:text-ink-400  mb-3 uppercase">
                  Timezone
                </label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value as DateFormat)}
                  className=" text-sm  w-full px-5 py-2 rounded-xl border border-border-tertiary  bg-white dark:bg-dropdown-bg dark:border-border-tertiary text-ink-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="us">US (MM/DD/YYYY)</option>
                  <option value="eu">European (DD/MM/YYYY)</option>
                  <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
                </select>
              </div>
            </div>

            <div className="space-y-6 my-6">
              <div>
                <label className="block xl:text-sm text-xs  font-bold text-ink-400 dark:text-ink-400  mb-3 uppercase">
                  Currency Display
                </label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value as DateFormat)}
                  className="text-sm w-full px-5 py-2 rounded-xl border border-border-tertiary  bg-white dark:bg-dropdown-bg dark:border-border-tertiary text-ink-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="us">USD($)</option>
                  <option value="eu">European (DD/MM/YYYY)</option>
                  <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ✦ AI Edit Permission Control ✦ */}
        <div className="py-8 flex">
          <div className="flex flex-1 items-start gap-3 mb-6">
            <div>
              <h2 className="text-lg font-medium text-ink-100">
                AI Edit Permission Control
              </h2>
              <p className="text-sm text-ink-400 dark:text-ink-400 max-w-[25rem] mt-2">
                Control how AI-generated changes are applied to your blocks.
              </p>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-4">
              <AIEditCard
                label="Review every edit"
                description="AI-generated changes wait for your approval. You can accept, reject, or edit before it runs."
                selected={aiEditMode === "review"}
                onClick={() => setAIEditMode("review")}
              />
              <AIEditCard
                label="Auto-apply all edits"
                description="AI changes apply immediately and run. You can still undo from block history."
                selected={aiEditMode === "auto"}
                onClick={() => setAIEditMode("auto")}
              />
            </div>
          </div>
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
                Select your preferred syntax highlighting theme for the SQL and
                python editors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editorThemes.map(editorThemeOption => (
              <EditorThemeCard
                key={editorThemeOption.id}
                theme={editorThemeOption}
                selected={editorTheme === editorThemeOption.id}
                onClick={() => setEditorTheme(editorThemeOption.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
