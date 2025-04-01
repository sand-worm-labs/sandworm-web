import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Database } from "lucide-react";

export const QueryHistory = () => {
  return (
    <Card className="h-full overflow-hidden border-none dark">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className=" font-semibold">Data Explorer</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>Hello from the other side</CardContent>
    </Card>
  );
};
