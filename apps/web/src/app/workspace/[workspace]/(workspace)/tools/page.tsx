"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@sandworm/ui/components/card";
import { LuLayoutGrid } from "react-icons/lu";
import { ArrowRight } from "lucide-react";

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
    <Link href={tool.href} className="inline-block h-full group relative">
      <Card
        className="
          bg-[#FFFFFF] dark:border-[#262A30] dark:bg-[#111111] border-[#CED4DA]
          rounded-3xl p-6 pb-8 pt-6 flex flex-col text-left h-full
          transition-all duration-200 ease-out
        "
      >
        <span
          className="
            absolute top-4 right-4 opacity-0
            group-hover:opacity-100 group-hover:translate-x-0 group-hover:-translate-y-0
            -translate-x-1 -translate-y-1
            transition-all duration-200 ease-out
            dark:text-white text-[#1A1A1A] 
            text-xs font-bold
          "
        >
          <ArrowRight className="inline-block w-4 h-4 mr-1" />
        </span>

        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-[0.90rem] dark:text-white text-[#1A1A1A] font-medium">
            {tool.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <p className="text-[#6C757D] dark:text-gray-300 text-[0.85rem] leading-relaxed font-medium">
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function ToolsPage() {
  return (
    <div>
      <div className="flex items-center gap-3  mt-10 px-8 mb-5">
        <span className="bg-[#A308F020]  rounded-full p-2 flex items-center justify-center">
          <LuLayoutGrid className="w-4 h-4 text-[#A308F0] " />
        </span>
        <h2 className="text-xl font-medium ">Tools</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
