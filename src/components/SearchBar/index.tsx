import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "../ui/input";

export const SearchBar = () => {
  const [query, setQuery] = useState<string>("");

  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-gray"
        size={16}
      />
      <Input
        type="text"
        placeholder="Search Queries"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pl-10 pr-4 py-1.5 w-[90%] rounded-lg border border-[#ffffff60] focus:border-gray-500 focus:ring focus:ring-gray-300 md:text-[0.85rem]  bg-[#1A1A1A] border-none"
      />
    </div>
  );
};
