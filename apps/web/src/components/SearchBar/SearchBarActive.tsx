import React, { useState } from "react";
import {
  Search,
  Moon,
  Sun,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
} from "lucide-react";

type Theme = "light" | "dark";
type Filter =
  | "all"
  | "creators"
  | "dashboard"
  | "reports"
  | "notebooks"
  | "date";

interface RecentItem {
  id: string;
  title: string;
  type: string;
  icon: string;
}

const SearchBarActive: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const suggestionItems: RecentItem[] = [
    { id: "1", title: "Analytics Dashboard", type: "Dashboard", icon: "📈" },
    { id: "2", title: "Sales Dashboard", type: "Dashboard", icon: "📊" },
    { id: "3", title: "Sarah Chen", type: "User", icon: "👤" },
    { id: "4", title: "John Smith", type: "User", icon: "👤" },
  ];

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "creators", label: "Creators" },
    { key: "dashboard", label: "Dashboard" },
    { key: "reports", label: "Reports" },
    { key: "notebooks", label: "Notebooks" },
    { key: "date", label: "Date Filter" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isDark = theme === "dark";

  return (
    <div className={`w-full max-w-2xl mx-auto ${isDark ? "dark" : ""}`}>
      <div
        className={`rounded-lg shadow-2xl overflow-hidden ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        {/* Search Input Section */}
        <div
          className={`p-4 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <Search
              className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={`flex-1 outline-none text-lg ${
                isDark
                  ? "bg-gray-900 text-gray-100 placeholder-gray-500"
                  : "bg-white text-gray-900 placeholder-gray-400"
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${
                isDark
                  ? "hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div
          className={`px-4 py-3 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                type="button"
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDark
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-750"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="py-2">
          <div
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Suggestions
          </div>
          <div>
            {suggestionItems.map(item => (
              <button
                type="button"
                key={item.id}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-200"
                    : "hover:bg-gray-50 text-gray-800"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.title}</div>
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {item.type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer with Keyboard Shortcuts */}
        <div
          className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
            isDark
              ? "border-gray-800 bg-gray-850 text-gray-400"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                <ChevronUp className="w-3.5 h-3.5" />
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                isDark
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBarActive;
