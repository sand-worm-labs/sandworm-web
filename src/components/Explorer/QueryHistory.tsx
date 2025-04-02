import React, { useState } from "react";
import { Database, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface VersionEntry {
  id: number;
  timestamp: string;
  query: string;
}

export const QueryHistory: React.FC = () => {
  const [versions, setVersions] = useState<VersionEntry[]>([
    {
      id: 1,
      timestamp: "2025-04-02 14:30",
      query:
        'SELECT * FROM users WHERE status = "active FROM users WHERE status = "active',
    },
    { id: 2, timestamp: "2025-04-02 14:15", query: "SELECT * FROM users" },
    {
      id: 3,
      timestamp: "2025-04-02 13:45",
      query: "SELECT id, name FROM users",
    },
    { id: 4, timestamp: "2025-04-02 13:20", query: "SELECT id FROM users " },
  ]);

  const handleRestore = (query: string): void => {
    console.log(`Restoring query: ${query}`);
    alert(`Query restored: ${query}`);
  };

  return (
    <Card className="h-full overflow-hidden border-none dark">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <Database className="h-5 w-5" />
            <CardTitle className="font-semibold">Version History</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className=" overflow-y-auto">
          {versions.map(version => (
            <div
              key={version.id}
              className="p-3 border-b last:border-b-0  transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">
                  {version.timestamp}
                </span>
                <button
                  type="button"
                  className="p-1 hover:bg-white/15 rounded-full"
                  onClick={() => handleRestore(version.query)}
                  title="Restore this version"
                >
                  <RotateCcw size={14} className="text-orange-500" />
                </button>
              </div>
              <div
                className="text-xs font-mono p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap"
                title={version.query}
              >
                {version.query}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
