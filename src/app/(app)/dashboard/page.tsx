"use client";

import React from "react";

import { ResearchDescription } from "@/components/Dashboard/DashboardDescriptin";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { CounterCard } from "@/components/WorkSpace/ResultTab/Charts/Counter";
import { PieChart } from "@/components/WorkSpace/ResultTab/Charts/PieChart";

export default function Dashboard() {
  const gmxPieChartData = {
    columns: ["destination", "amount"],
    data: [
      ["Bridged to Ethereum", 9600000],
      ["Swapped to ETH", 32000000],
      ["Returned via Bounty", 2000000],
      ["Still on Arbitrum", 2000000],
      ["Unknown", 300000],
    ],
  };
  return (
    <div className="container mx-auto  mt-12">
      <DashboardHeader />
      <ResearchDescription />
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
        <PieChart
          result={gmxPieChartData}
          title="Funds Distribution Post‑GMX Exploit"
        />
      </div>
    </div>
  );
}
