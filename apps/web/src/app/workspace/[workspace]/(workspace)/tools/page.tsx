"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@sandworm/ui/components/card";
import { ArrowRight } from "lucide-react";
import { ToolsiIlustration } from "@/components/Assets/ToolsiIlustration";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useDocuments } from "@/components/Visualization/hooks/useDocuments";

import SquareFour from "@/components/Assets/SquareFour";

type Tool = {
  id: string;
  name: string;
  description: string;
  href?: string;
  action?: () => void | Promise<void>;
  color?: string;
};

type ToolCardProps = {
  tool: Tool;
};

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const isDisabled = !tool.href && !tool.action;

  const handleClick = (e: React.MouseEvent) => {
    if (tool.action) {
      e.preventDefault();
      tool.action();
    }
  };

  const content = (
    <Card
      className={`
        bg-base-100  border-none shadow-none 
        rounded-3xl p-6 pb-8 pt-6 flex flex-row gap-x-3 text-left h-full items-center
        transition-all duration-200 ease-out
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <SquareFour color={tool.color} className="shrink-0" />
      {!isDisabled && (
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
      )}

      <CardContent className="p-0 mt-0 pt-0">
        <h3 className="text-[0.90rem] dark:text-white text-ink-100  font-bold font-body">
          {tool.name}
        </h3>
        <p className="text-ink-400 dark:text-gray-300 text-[0.85rem] leading-relaxed font-body mt-1 font-medium">
          {tool.description}
        </p>
      </CardContent>
    </Card>
  );

  if (isDisabled) {
    return <div className="inline-block h-full">{content}</div>;
  }

  if (tool.action) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-block h-full group relative cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={tool.href!} className="inline-block h-full group relative ">
      {content}
    </Link>
  );
};

export default function ToolsPage() {
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();

  const [documentsState, { createDocument }] = useDocuments(workspaceId);

  const onCreateNotebook = useCallback(async () => {
    if (documentsState.loading) return;

    try {
      const doc = await createDocument({ parentId: null, version: 2 });
      router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
    } catch (err) {
      console.error(err);
    }
  }, [documentsState, createDocument, router, workspaceId]);

  const tools: Tool[] = [
    {
      id: "worm-chat",
      name: "Worm Chat",
      description:
        "Ask questions in plain English and explore onchain data with AI-powered insights.",
      href: `/workspace/${workspaceId}`,
      color: "#A8FB63",
    },
    {
      id: "report",
      name: "Smartlens/Report",
      description:
        "Generate clear, structured summaries and narratives from blockchain data in seconds.",
      href: `/workspace/${workspaceId}`,
      color: "#F863FB",
    },
    {
      id: "visualization",
      name: "Visualization",
      description:
        "Turn raw data into interactive charts and graphs — customize or let AI handle it.",
      color: "#BAD2A7",
    },
    {
      id: "query-console",
      name: "Query Console",
      description:
        "Write and refine queries directly, with AI suggestions to guide you when needed.",
      href: `/workspace/${workspaceId}/console`,
      color: "#ED2D64",
    },
    {
      id: "notebook",
      name: "Notebook",
      description:
        "Combine queries, charts, and notes into a single shareable workspace.",
      action: onCreateNotebook,
      color: "#FFADE4",
    },
    {
      id: "smart-query",
      name: "Smart Queries",
      description:
        "Explore blockchain data interactively. Select chains, metrics, and filters to build live queries and get instant onchain insights.",
      color: "#FFADE4",
    },
  ];

  return (
    <div className="relative ">
      <div className="absolute top-[-1rem] left-[50%] transform translate-x-[-50%]">
        <ToolsiIlustration />
      </div>
      <div className="flex flex-col items-center gap-3  mt-7 px-8 mb-16 text-center font-body ">
        <h2 className="text-2xl font-medium text-ink-100 font-body ">
          Explore Tools for specific Functionalities
        </h2>
        <p className="text-sm max-w-[35rem] text-ink-400 font-medium">
          These Tools help you quickly jump into specific workflows without
          needing the full data analysis workflow in the main product.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 mt-12 container mx-auto">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
