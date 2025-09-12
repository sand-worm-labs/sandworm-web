"use client";

import React from "react";

import { ResearchDescription } from "@/components/Dashboard/DashboardDescriptin";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { CounterCard } from "@/components/WorkSpace/ResultTab/Charts/Counter";
import { PieChart } from "@/components/WorkSpace/ResultTab/Charts/PieChart";
import QueryResultsTable from "@/components/WorkSpace/ResultTab";
import { BarChart } from "@/components/WorkSpace/ResultTab/Charts/BarChart";

export default function Dashboard() {
  const degenTransactionData = {
    columnTypes: ["string", "number", "number"],
    columns: ["sender", "transaction_count", "total_usd"],
    data: [
      {
        sender: "0x00000000000ba9cd9f5175108141a82b6c24d727",
        transaction_count: 89,
        total_usd: 0,
      },
      {
        sender: "0x00000000edb4489cb49fe07246f39345c9f838cd",
        transaction_count: 124,
        total_usd: 0,
      },
      {
        sender: "0x00000000fdac7708d0d360bddc1bc7d097f47439",
        transaction_count: 2,
        total_usd: 0,
      },
      {
        sender: "0x000000338300a9a80000c868a40085b15dd000d0",
        transaction_count: 19,
        total_usd: 0,
      },
      {
        sender: "0x009d6dd200000000fb008500bc40001c27b8f379",
        transaction_count: 426,
        total_usd: 0,
      },
      {
        sender: "0x01ce4be3631746d157a09a53cf23c2a43578b84c",
        transaction_count: 65,
        total_usd: 0,
      },
      {
        sender: "0x0389879e0156033202c44bf784ac18fc02edee4f",
        transaction_count: 2129,
        total_usd: 0,
      },
    ],
    rowCount: 7,
  };

  return (
    <div className="container mx-auto  mt-12 pb-20 dark">
      <DashboardHeader />
      <ResearchDescription />
      <div className="mt-8 border border-[#1a1a1a] rounded-md p-4 bg-[#0d0d0d]">
        <QueryResultsTable
          result={degenTransactionData}
          title="AI Query Result"
          query="Generated via Worm AI Tool"
          viewMode="Table"
          showControls={false}
        />
      </div>
      <div className="grid grid-cols-[55%,45%] gap-4 mt-8">
        <div className="grid  md:grid-cols-2 gap-4">
          <CounterCard
            title="Total Exploited"
            value={42_000_000}
            prefix="$"
            description="Approximate amount stolen from GMX V1"
          />

          <CounterCard
            title="Bridged to ETH"
            value={9_600_000}
            prefix="$"
            description="Moved cross‑chain via CCTP"
          />

          <CounterCard
            title="White‑Hat Bounty"
            value={4_200_000}
            prefix="$"
            description="10% incentive offered for return"
          />

          <CounterCard
            title="Tokens Converted"
            value={11_700}
            suffix=" ETH"
            description="Swapped by attacker post‑bridging"
          />
        </div>
        <div className="border border-[#1a1a1a] rounded-md p-4 bg-[#0d0d0d]">
          <PieChart
            chartType="pie"
            showControls={false}
            result={degenTransactionData}
            title="Funds Distribution Post‑GMX Exploit"
          />
        </div>
      </div>
      <div className="mt-8 border border-[#1a1a1a] rounded-md p-4 bg-[#0d0d0d]">
        <QueryResultsTable
          result={degenTransactionData}
          title="AI Query Result"
          query="Generated via Worm AI Tool"
          viewMode="Table"
          showControls={false}
        />
        <BarChart
          chartType="bar"
          showControls={false}
          result={degenTransactionData}
          title="Funds Distribution Post‑GMX Exploit"
        />
      </div>
    </div>
  );
}
