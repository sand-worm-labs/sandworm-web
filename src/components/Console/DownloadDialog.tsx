"use client";

import React, { useState, useEffect } from "react";
import { Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSandwormStore } from "@/store";
import type { ExportFormat } from "@/types";
import {
  formatBytes,
  estimateExportSize,
  getSizeWarning,
  processInChunks,
} from "@/lib/export";

const CHUNK_SIZE = 10000;

interface DownloadDialogProps {
  data: any[];
  query?: string;
  maxRows?: number;
}

// entire component need to be refactored
export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  data,
  query,
  maxRows = 1_000_000,
}) => {
  const [downloadOption, setDownloadOption] = useState<ExportFormat>("csv");
  const [estimatedSize, setEstimatedSize] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const exportParquet = useSandwormStore(state => state.exportParquet);

  useEffect(() => {
    if (data.length > 0) {
      const estSize = estimateExportSize(data, downloadOption);
      const formattedSize = Number.isNaN(estSize)
        ? "Unknown"
        : formatBytes(estSize);
      setEstimatedSize(formattedSize);
    } else {
      setEstimatedSize("0 B");
    }
  }, [data, downloadOption]);

  const handleDownload = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);

      if (data.length > maxRows) {
        toast.error(`Cannot export more than ${maxRows.toLocaleString()} rows`);
        return;
      }

      let blob: Blob;

      if (downloadOption === "parquet") {
        if (!query) throw new Error("No query provided to export parquet");
        blob = await exportParquet(query);
      } else {
        blob = await processInChunks(
          data,
          downloadOption,
          CHUNK_SIZE,
          setProgress
        );
      }

      const now = new Date().toISOString().split(".")[0].replace(/[:]/g, "-");
      const exportFilename = `sandworm_${now}`;

      if (downloadOption === "clipboard") {
        const text = await blob.text();
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!", { duration: 2000 });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportFilename}.${downloadOption}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Download started!", { duration: 2000 });
      }

      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        `Failed to export data: ${
          error instanceof Error ? error.message : "Unknown Error"
        }`,
        { duration: 2000 }
      );
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const sizeWarning = getSizeWarning(estimatedSize);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sizeWarning && (
            <Alert variant="default">
              <AlertDescription>{sizeWarning.message}</AlertDescription>
            </Alert>
          )}

          <RadioGroup
            value={downloadOption}
            onValueChange={value => setDownloadOption(value as ExportFormat)}
          >
            {["csv", "json", "parquet", "clipboard"].map(format => (
              <div className="flex items-center space-x-2" key={format}>
                <RadioGroupItem value={format} id={format} />
                <Label htmlFor={format}>{format.toUpperCase()}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="text-sm text-gray-500">
            Estimated size: {estimatedSize}
            {data.length > maxRows && (
              <div className="flex items-center mt-2 text-amber-500">
                <AlertCircle className="h-4 w-4 mr-2" />
                Warning: Large dataset ({data.length.toLocaleString()} rows)
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-gray-500 text-center">
                Processing... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
