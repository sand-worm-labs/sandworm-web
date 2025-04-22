import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { DownloadDialog } from "../../DownloadDialog";

interface ChartControlProps {
  columns: string[];
  selectedXAxis: string;
  selectedYAxis: string;
  onChange: (config: { xAxis: string; yAxis: string }) => void;
  data: any[];
}

export const ChartControl: React.FC<ChartControlProps> = ({
  columns,
  selectedXAxis,
  selectedYAxis,
  onChange,
  data,
}) => {
  return (
    <div className="flex justify-between p-2 border-b border-borderLight px-4 items-center dark">
      <div className="flex flex-wrap items-center   gap-4">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">X-Axis: </span>
          <Select
            value={selectedXAxis}
            onValueChange={val =>
              onChange({ xAxis: val, yAxis: selectedYAxis })
            }
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Select X" />
            </SelectTrigger>
            <SelectContent>
              {columns.map(col => (
                <SelectItem key={col} value={col} className="text-xs">
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Y-Axis: </span>
          <Select
            value={selectedYAxis}
            onValueChange={val =>
              onChange({ xAxis: selectedXAxis, yAxis: val })
            }
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Select Y" />
            </SelectTrigger>
            <SelectContent>
              {columns.map(col => (
                <SelectItem key={col} value={col} className="text-xs">
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DownloadDialog data={data} />
    </div>
  );
};
