"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@sandworm/ui/components/card";
import { ArrowRight } from "lucide-react";

import SquareFour from "@/components/Assets/SquareFour";

type Tool = {
  id: string;
  name: string;
  description: string;
  href: string;
  color?: string;
};

const tools: Tool[] = [
  {
    id: "worm-chat",
    name: "Worm Chat",
    description:
      "Ask questions in plain English and explore onchain data with AI-powered insights.",
    href: "/chats",
    color: "#A8FB63",
  },
  {
    id: "report",
    name: "Report",
    description:
      "Generate clear, structured summaries and narratives from blockchain data in seconds.",
    href: "/tools/report",
    color: "#F863FB",
  },
  {
    id: "visualization",
    name: "Visualization",
    description:
      "Turn raw data into interactive charts and graphs — customize or let AI handle it.",
    href: "/tools/visualization",
    color: "#BAD2A7",
  },
  {
    id: "query-console",
    name: "Query Console",
    description:
      "Write and refine queries directly, with AI suggestions to guide you when needed.",
    href: "/tools/query-console",
    color: "#ED2D64",
  },
  {
    id: "notebook",
    name: "Notebook",
    description:
      "Combine queries, charts, and notes into a single shareable workspace.",
    href: "/tools/notebook",
    color: "#FFADE4",
  },
  {
    id: "dashboards",
    name: "Dashboards",
    description:
      "Build live dashboards to track metrics, monitor activity, and collaborate in real time.",
    href: "/tools/dashboards",
    color: "#FFADE4",
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
        <SquareFour color={tool.color} />
        <span
          className="
            absolute top-4 right-4 opacity-0
            group-hover:opacity-100 group-hover:translate-x-0 group-hover:-translate-y-0
            -translate-x-1 -translate-y-1
            transition-all duration-200 ease-out
            dark:text-white text-ink-100  
            text-xs font-bold
          "
        >
          <ArrowRight className="inline-block w-4 h-4 mr-1" />
        </span>

        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-[0.90rem] dark:text-white text-ink-100  font-medium">
            {tool.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <p className="text-ink-400 dark:text-gray-300 text-[0.85rem] leading-relaxed font-medium">
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
      <div className="flex flex-col items-center gap-3  mt-10 px-8 mb-5 text-center">
        <h2 className="text-xl font-medium ">
          Explore Tools for specific Functionalities
        </h2>
        <p className="text-sm max-w-[35rem]">
          These Tools help you quickly jump into specific workflows without
          needing the full data analysis workflow in the main product.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
