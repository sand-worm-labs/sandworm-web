"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { ShareDialogue } from "./ShareDialogue";

const options = [
  "Table",
  "JSON",
  "Area Chart",
  "Bar Chart",
  "Pie Chart",
  "Counter",
];

export const ResultToolbar = ({
  viewMode,
  setViewMode,
}: {
  viewMode: string;
  setViewMode: (mode: string) => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["Table"]);
  const pathname = usePathname();
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  const handleSelect = (value: string) => {
    if (selectedOptions.includes(value)) {
      setViewMode(value);
    } else {
      const updated = [...selectedOptions, value];
      setSelectedOptions(updated);
      setViewMode(value);
    }
  };

  const removeOption = (value: string) => {
    if (value === "Table") return;
    const updatedOptions = selectedOptions.filter((option) => option !== value);
    setSelectedOptions(updatedOptions.length ? updatedOptions : ["Table"]);

    if (viewMode === value) {
      const fallback = updatedOptions.length ? updatedOptions[0] : "Table";
      setViewMode(fallback);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-3">
        <Select onValueChange={handleSelect}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent className=" text-sm">
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option}
              className={`cursor-pointer px-3 py-1 text-xs rounded-full flex items-center gap-2 hover:text-white ${
                viewMode === option
                  ? "bg-orange-700 text-white"
                  : "bg-[#ffffff]/20 text-white"
              }`}
              onClick={() => setViewMode(option)}
            >
              {option}
              {option !== "Table" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(option);
                  }}
                  className="text-[10px]"
                >
                  ✕
                </button>
              )}
            </Badge>
          ))}
        </div>
      </div>
      <ShareDialogue url={shareUrl} />
    </div>
  );
};
