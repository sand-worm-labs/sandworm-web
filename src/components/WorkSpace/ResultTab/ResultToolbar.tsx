import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const options = ["JSON", "Area Chart", "Bar Chart", "Counter", "Table"];

export const ResultToolbar = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelect = (value: string) => {
    if (!selectedOptions.includes(value)) {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  const removeOption = (value: string) => {
    setSelectedOptions(selectedOptions.filter(item => item !== value));
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
        <div className="flex flex-wrap gap-3 ">
          {selectedOptions.map(option => (
            <Badge
              key={option}
              className="cursor-pointer bg-white py-2 px-5"
              onClick={() => removeOption(option)}
            >
              {option} ✕
            </Badge>
          ))}
        </div>
      </div>
      <Button variant="outline">Share</Button>
    </div>
  );
};
