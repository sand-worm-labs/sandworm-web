"use client";

import React, { useState } from "react";
import {
  Monitor,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

type Theme = "system" | "light" | "dark";
type EditorTheme =
  | "monokai"
  | "dracula"
  | "github"
  | "nord"
  | "solarized"
  | "material";
type FontSize = "small" | "medium" | "large";
type DateFormat = "us" | "eu" | "iso";

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

const ThemeCard: React.FC<{
  option: ThemeOption;
  selected: boolean;
  onClick: () => void;
}> = ({ option, selected, onClick }) => {
  const bgMap: Record<string, string> = {
    light: "bg-white",
    dark: "bg-[#09091B]",
    default: "bg-[#09091B]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full p-6  border border-[#E9ECEF] transition-all text-left  rounded-3xl ${
        selected
          ? ""
          : "border-[#E9ECEF]  dark:border-[#262A30]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full ${
            selected
              ? "bg-[#EFF1F2] dark:bg-[#121417]  border dark:border-[#262A30] border-[#E9ECEF]"
              : "bg-[#EFF1F2] dark:bg-[#121417] text-gray-600 dark:text-gray-400 border border-[#E9ECEF] dark:border-[#262A30]"
          }`}
        >
          {option.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-ink-100 ">
              {option.label}
            </h3>
            {selected && <div className="w-2 h-2 rounded-full bg-[#A308F0]" />}
          </div>
          <p className="text-sm text-[#6C757D]">
            {option.description}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-[#262A30]">
        <div className={`h-32 p-3 ${bgMap[option.id] ?? bgMap.default}`}>
          <div className="flex gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                option.id === "light" ? "bg-[#E7F3F6]" : "bg-gray-600"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                option.id === "light" ? "bg-[#E7F3F6]" : "bg-gray-600"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                option.id === "light" ? "bg-[#E7F3F6]" : "bg-gray-600"
              }`}
            />
          </div>
          <div
            className={`space-y-2 ${
              option.id === "light" ? "opacity-20" : "opacity-30"
            }`}
          >
            <div
              className={`h-10 rounded-xl ${
                option.id === "light" ? "bg-[#E7F3F6]" : "bg-[#E7F3F6]"
              }`}
            />
            <div
              className={`h-2 w-3/4 rounded ${
                option.id === "light" ? "bg-[#E7F3F6]" : "bg-[#E7F3F6]"
              }`}
            />
            <div
              className={`h-2 w-1/2 rounded ${
                option.id === "light" ? "bg-[#E7F3F6]" : "bg-[#E7F3F6]"
              }`}
            />
          </div>
        </div>
      </div>
    </button>
  );
};

const EditorThemeCard: React.FC<{
  theme: EditorThemeOption;
  selected: boolean;
  onClick: () => void;
}> = ({ theme, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-3xl border transition-all text-left ${
        selected
          ? "border-[#A308F0]   dark:ring-[#A308F0]"
          : "border-[#E9ECEF] dark:border-[#262A30] hover:border-gray-300 dark:hover:border-[#262A30]"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-medium text-[#1A1A1A] dark:text-gray-100 capitalize">
          {theme.name}
        </h4>
        {selected && <div className="w-2 h-2 rounded-full bg-[#A308F0]" />}
      </div>
      <div
        className="rounded-xl p-3 font-mono text-xs leading-relaxed"
        style={{ backgroundColor: theme.bg, color: theme.text }}
      >
        <div>
          <span style={{ color: theme.accent }}>const</span> data = analyze()
        </div>
        <div>
          <span style={{ color: theme.accent }}>if</span> (data.length {">"} 0){" "}
          {"{"}
        </div>
        <div className="pl-4">console.log(data)</div>
        <div>{"}"}</div>
      </div>
    </button>
  );
};

const Preferences: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("monokai");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [dateFormat, setDateFormat] = useState<DateFormat>("us");
  const [autoSave, setAutoSave] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [queryTimeout, setQueryTimeout] = useState(30);

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
          <h2 className="text-xxl font-medium text-ink-100 mb-2">
            Preferences
          </h2>
          <p className="text-[#6C757D]">
            Manage your interface and privacy settings{" "}
          </p>
        </div>

        {/* Data & Performance */}
        <div className=" py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-medium text-ink-100 dark:text-gray-100">
                Regional and Data
              </h2>
              <p className="text-sm text-[#6C757D] max-w-[25rem] mt-2 ">
                Set your region and preferred currency to be displayed.{" "}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#6C757D]  mb-3 uppercase">
                Timezone
              </label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value as DateFormat)}
                className="w-full px-5 py-2 rounded-xl border border-[#CED4DA]  bg-white dark:bg-[#121417] text-ink-100 focus:ring-2 focus:ring-[#A308F0] focus:border-transparent"
              >
                <option value="us">US (MM/DD/YYYY)</option>
                <option value="eu">European (DD/MM/YYYY)</option>
                <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 my-6">
            <div>
              <label className="block text-sm font-bold text-[#6C757D]  mb-3 uppercase">
                Currency Display
              </label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value as DateFormat)}
                className="w-full px-5 py-2 rounded-xl border border-[#CED4DA]  bg-white dark:bg-[#121417] text-ink-100 focus:ring-2 focus:ring-[#A308F0] focus:border-transparent"
              >
                <option value="us">USD($)</option>
                <option value="eu">European (DD/MM/YYYY)</option>
                <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className=" py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-medium text-ink-100 dark:text-gray-100">
                Appearance
              </h2>
              <p className="text-sm text-[#6C757D] max-w-[25rem] mt-2 ">
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

        {/* Editor Theme Section */}
        <div className=" py-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-medium text-ink-100 dark:text-gray-100">
                Code Editor Theme
              </h2>
              <p className="text-sm text-[#6C757D] max-w-[25rem] mt-2 ">
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
