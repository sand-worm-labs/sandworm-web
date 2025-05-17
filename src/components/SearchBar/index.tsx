import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

import { Input } from "../ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [cachedQueries, setCachedQueries] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // simple cache add, max 5 items, no dupes
  const addToCache = (q: string) => {
    setCachedQueries(prev => {
      const filtered = prev.filter(item => item !== q);
      return [q, ...filtered].slice(0, 5);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      addToCache(query.trim());
      onSearch(query.trim());
    }
  };

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative w-full max-w-md min-w-[25rem] mx-auto"
      ref={searchContainerRef}
    >
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray"
      />
      <div className="relative">
        <Input
          type="text"
          placeholder="Search Queries"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsActive(true)}
          className="
            w-full
            pl-12
            pr-24
            py-1
            rounded-md
           bg-[#1A1A1A] 
            border
            border-[#ffffff60]
            text-white
            placeholder-[#8b949e]
            focus:outline-none
            focus:ring focus:ring-gray-300
            transition
            text-sm
            md:text-sm
          "
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-gray select-none font-medium">
          Press <kbd className="bg-black/90 px-1 rounded">Enter</kbd>
        </div>
      </div>

      {isActive && cachedQueries.length > 0 && (
        <ul className="absolute z-10 top-full mt-1 w-full bg-black border border-[#30363d] rounded-md shadow-md max-h-48 overflow-y-auto">
          {cachedQueries.map((item, i) => (
            <li
              key={i}
              className="px-4 py-2 cursor-pointer hover:bg-white/10 hover:text-white text-sm text-text-gray"
              onClick={() => {
                setQuery(item);
                onSearch(item);
                setIsActive(false);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
