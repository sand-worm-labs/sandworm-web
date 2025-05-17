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
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const addToCache = (q: string) => {
    setCachedQueries(prev => {
      const filtered = prev.filter(item => item !== q);
      return [q, ...filtered].slice(0, 5);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsActive(true);
      setHighlightIndex(prev => (prev + 1) % cachedQueries.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsActive(true);
      setHighlightIndex(prev =>
        prev <= 0 ? cachedQueries.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const finalQuery =
        highlightIndex >= 0 ? cachedQueries[highlightIndex] : query.trim();
      if (finalQuery) {
        addToCache(finalQuery);
        setQuery(finalQuery);
        onSearch(finalQuery);
        setIsActive(false);
        setHighlightIndex(-1);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsActive(false);
      setHighlightIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsActive(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          onChange={e => {
            setQuery(e.target.value);
            setHighlightIndex(-1);
          }}
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
              className={`px-4 py-2 cursor-pointer text-sm ${
                highlightIndex === i
                  ? "bg-white/10 text-white"
                  : "text-text-gray hover:bg-white/10 hover:text-white"
              }`}
              onMouseEnter={() => setHighlightIndex(i)}
              onClick={() => {
                setQuery(item);
                onSearch(item);
                setIsActive(false);
                setHighlightIndex(-1);
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
