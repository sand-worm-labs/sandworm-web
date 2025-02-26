import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "../ui/input";

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");

  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
      <Input
        type="text"
        placeholder="Search Queries"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:border-gray-500 focus:ring focus:ring-gray-300"
      />
    </div>
  );
}
