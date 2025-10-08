"use client";

import React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tool = {
  id: string;
  name: string;
  description: string;
  href: string;
};

const tools: Tool[] = [
  {
    id: "worm-chat",
    name: "Worm Chat",
    description:
      "Ask questions in plain English and explore onchain data with AI-powered insights.",
    href: "/chats",
  },
  {
    id: "report",
    name: "Report",
    description:
      "Generate clear, structured summaries and narratives from blockchain data in seconds.",
    href: "/tools/report",
  },
  {
    id: "visualization",
    name: "Visualization",
    description:
      "Turn raw data into interactive charts and graphs — customize or let AI handle it.",
    href: "/tools/visualization",
  },
  {
    id: "query-console",
    name: "Query Console",
    description:
      "Write and refine queries directly, with AI suggestions to guide you when needed.",
    href: "/tools/query-console",
  },
  {
    id: "notebook",
    name: "Notebook",
    description:
      "Combine queries, charts, and notes into a single shareable workspace.",
    href: "/tools/notebook",
  },
  {
    id: "dashboards",
    name: "Dashboards",
    description:
      "Build live dashboards to track metrics, monitor activity, and collaborate in real time.",
    href: "/tools/dashboards",
  },
];

type ToolCardProps = {
  tool: Tool;
};

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <Link href={tool.href} className="inline-block h-full">
      <Card className="bg-[#FFFFFF] border-[#E9ECEF] dark:bg-[#111111] rounded-2xl p-6 flex flex-col text-left py-8 hover:shadow-md transition-shadow h-full">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm text-[#3B5C6A] font-semibold">
            {tool.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-[#242A2D] dark:text-gray-300 text-[0.95rem] leading-relaxed font-medium">
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function ToolsPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
