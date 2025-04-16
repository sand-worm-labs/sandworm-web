import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChartControlProps {
  columns: string[];
  selectedXAxis: string;
  selectedYAxis: string;
  onChange: (config: { xAxis: string; yAxis: string }) => void;
}

export const ChartControl: React.FC<ChartControlProps> = ({
  columns,
  selectedXAxis,
  selectedYAxis,
  onChange,
}) => {
  const [xAxis, setXAxis] = useState(selectedXAxis);
  const [yAxis, setYAxis] = useState(selectedYAxis);

  const handleApply = () => {
    onChange({ xAxis, yAxis });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-2 border-b border-white/10 bg-background/80 backdrop-blur-md rounded-t-md">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">X-Axis</span>
        <Select value={xAxis} onValueChange={setXAxis}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select X" />
          </SelectTrigger>
          <SelectContent>
            {columns.map(col => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Y-Axis</span>
        <Select value={yAxis} onValueChange={setYAxis}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select Y" />
          </SelectTrigger>
          <SelectContent>
            {columns?.map(col => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" variant="default" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
};
