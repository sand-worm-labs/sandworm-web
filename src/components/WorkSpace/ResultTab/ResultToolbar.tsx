import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { ShareDialogue } from "./ShareDialogue";

const options = ["Table", "JSON", "Area Chart", "Bar Chart", "Counter"];

export const ResultToolbar = ({
  viewMode,
  setViewMode,
}: {
  viewMode: string;
  setViewMode: (mode: string) => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["Table"]);

  const updateOptions = (updatedOptions: string[]) => {
    setSelectedOptions(updatedOptions);
    setViewMode(updatedOptions.includes("Table") ? "Table" : updatedOptions[0]);
  };

  const handleSelect = (value: string) => {
    if (!selectedOptions.includes(value))
      updateOptions([...selectedOptions, value]);
  };

  const removeOption = (value: string) => {
    if (value === "Table") return;
    const updatedOptions = selectedOptions.filter(option => option !== value);
    updateOptions(updatedOptions.length ? updatedOptions : ["Table"]);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-3">
        <Select onValueChange={handleSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent className="dark">
            {options.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-3">
          {selectedOptions.map(option => (
            <Badge
              key={option}
              className={`cursor-pointer py-2 px-5 flex items-center gap-2 hover:text-white ${
                viewMode === option ? "bg-orange-700 text-white" : "bg-white"
              }`}
              onClick={() => setViewMode(option)}
            >
              {option}
              {option !== "Table" && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeOption(option);
                  }}
                  className="text-xs"
                >
                  ✕
                </button>
              )}
            </Badge>
          ))}
        </div>
      </div>
      <ShareDialogue url="ddd" />
    </div>
  );
};
