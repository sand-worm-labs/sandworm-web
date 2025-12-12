"use client";

import React, { useState } from "react";
import {
  Monitor,
  Sun,
  Moon,
  Code,
  Bell,
  Layout,
  Palette,
  Database,
} from "lucide-react";

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
    dark: "bg-[#0C1015]",
    default: "bg-gradient-to-br from-white via-gray-100 to-gray-900",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full p-6 rounded-2xl border transition-all text-left ${
        selected
          ? "border-[#C7665C]  dark:bg-black"
          : "border-[#FEFEFF] dark:border-[#262A30] hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full ${
            selected
              ? "bg-white dark:bg-[#121417] text-[#C7665C] dark:text-[#C7665C] border dark:border-[#262A30] border-[#E9ECEF]"
              : "bg-[#F1F3F4] dark:bg-[#121417] text-gray-600 dark:text-gray-400 border border-[#E9ECEF] dark:border-[#262A30]"
          }`}
        >
          {option.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {option.label}
            </h3>
            {selected && <div className="w-2 h-2 rounded-full bg-[#C7665C]" />}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {option.description}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md overflow-hidden border border-gray-200 dark:border-[#262A30]">
        <div className={`h-32 p-3 ${bgMap[option.id] ?? bgMap.default}`}>
          <div className="flex gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                option.id === "light" ? "bg-gray-300" : "bg-gray-600"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                option.id === "light" ? "bg-gray-300" : "bg-gray-600"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                option.id === "light" ? "bg-gray-300" : "bg-gray-600"
              }`}
            />
          </div>
          <div
            className={`space-y-2 ${
              option.id === "light" ? "opacity-20" : "opacity-30"
            }`}
          >
            <div
              className={`h-2 rounded ${
                option.id === "light" ? "bg-gray-900" : "bg-white"
              }`}
            />
            <div
              className={`h-2 w-3/4 rounded ${
                option.id === "light" ? "bg-gray-900" : "bg-white"
              }`}
            />
            <div
              className={`h-2 w-1/2 rounded ${
                option.id === "light" ? "bg-gray-900" : "bg-white"
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
      className={`relative p-4 rounded-2xl border transition-all text-left ${
        selected
          ? "border-[#C7665C]   dark:ring-[#C7665C]"
          : "border-gray-200 dark:border-[#262A30] hover:border-gray-300 dark:hover:border-[#262A30]"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
          {theme.name}
        </h4>
        {selected && <div className="w-2 h-2 rounded-full bg-[#C7665C]" />}
      </div>
      <div
        className="rounded-md p-3 font-mono text-xs leading-relaxed"
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
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
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
      bg: "#272822",
      text: "#F8F8F2",
      accent: "#F92672",
    },
    {
      id: "dracula",
      name: "Dracula",
      bg: "#282a36",
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
      bg: "#2e3440",
      text: "#d8dee9",
      accent: "#88c0d0",
    },
    {
      id: "solarized",
      name: "Solarized Dark",
      bg: "#002b36",
      text: "#839496",
      accent: "#268bd2",
    },
    {
      id: "material",
      name: "Material",
      bg: "#263238",
      text: "#eeffff",
      accent: "#c792ea",
    },
  ];

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (systemDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  React.useEffect(() => {
    handleThemeChange(selectedTheme);
  }, []);

  return (
    <div className="min-h-screen  dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your user preferences.
          </p>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-[#262A30] p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Appearance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                selected={selectedTheme === option.id}
                onClick={() => handleThemeChange(option.id)}
              />
            ))}
          </div>
        </div>

        {/* Editor Theme Section */}
        <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-[#262A30] p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Code Editor Theme
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select your preferred syntax highlighting theme
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editorThemes.map(theme => (
              <EditorThemeCard
                key={theme.id}
                theme={theme}
                selected={editorTheme === theme.id}
                onClick={() => setEditorTheme(theme.id)}
              />
            ))}
          </div>
        </div>

        {/* Editor Settings */}
        <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-[#262A30] p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Layout className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Editor Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize your code editor experience
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Font Size
              </label>
              <div className="flex gap-3">
                {(["small", "medium", "large"] as FontSize[]).map(size => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-6 py-1 rounded-lg font-medium text-sm transition-all capitalize ${
                      fontSize === size
                        ? "bg-[#C7665C] text-white"
                        : "bg-gray-100 dark:bg-[#181C21] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-[#262A30]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-[#262A30]">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Show line numbers
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display line numbers in code editor
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lineNumbers}
                  onChange={e => setLineNumbers(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#C7665C] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[#262A30] peer-checked:bg-[#C7665C]" />
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-[#262A30]">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Auto-save
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically save your work as you type
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={e => setAutoSave(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#C7665C] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#C7665C]" />
              </label>
            </div>
          </div>
        </div>

        {/* Data & Performance */}
        <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-[#262A30] p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Data & Performance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure data handling and query settings
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value as DateFormat)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#262A30] bg-white dark:bg-[#121417] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#C7665C] focus:border-transparent"
              >
                <option value="us">US (MM/DD/YYYY)</option>
                <option value="eu">European (DD/MM/YYYY)</option>
                <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Query Timeout (seconds)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={queryTimeout}
                  onChange={e => setQueryTimeout(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-[#121417] border border-[#262A30]"
                />
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100 w-12 text-right">
                  {queryTimeout}s
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Maximum time to wait for query results before timeout
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Interface */}
        <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-[#262A30] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Notifications & Interface
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control how you receive updates and interact with the platform
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[#262A30]">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Enable notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive alerts for query completions and errors
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={e => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#C7665C] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#C7665C]" />
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[#262A30]">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Sound effects
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Play sounds for successful operations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={e => setSoundEffects(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#C7665C]" />
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Compact mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reduce spacing for more content on screen
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={e => setCompactMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#C7665C] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[#262A30] peer-checked:bg-[#C7665C]" />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="px-4 text-sm py-2 bg-[#C7665C] hover:bg-[#C7665C] text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
