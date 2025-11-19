import Head from "next/head";
import Image from "next/image";

import { AxiosService } from "@/services/axios";
import { TabsSection } from "@/components/TabsSection";
import type { QueryResponse } from "@/types";

const axios = new AxiosService(process.env["NEXT_PUBLIC_API_URL"]!, false);

// Mock Response
// =====================================
// Used Temporarily until backend API is ready
// =====================================
const mockQueryResponse: QueryResponse = {
  page_items: [
    {
      id: "q_001",
      title: "Top Active Wallets on Sui",
      description: "Shows the most active wallets on Sui over the last 7 days.",
      creator: "user_123",
      private: false,
      query: "SELECT * FROM sui.active_wallets LIMIT 20",
      tags: ["sui", "wallets", "activity"],
      stared_by: ["user_a", "user_b", "user_c"],
      forked_from: "",
      forked_by: ["user_x"],
      forked: false,
      createdAt: new Date("2025-01-05T12:00:00Z") as any,
      updatedAt: new Date("2025-01-05T12:00:00Z") as any,
      username: "chainwhisperer",
      image: "/img/demo-avatar.png",
    },
    {
      id: "q_002",
      title: "Base TVL Growth (30 Days)",
      description: "Tracks the 30-day growth of total value locked on Base.",
      creator: "user_467",
      private: false,
      query: "SELECT * FROM base.tvl_30d",
      tags: ["base", "tvl", "growth"],
      stared_by: ["user_b", "user_d"],
      forked_from: "",
      forked_by: [],
      forked: false,
      createdAt: new Date("2025-01-12T16:30:00Z") as any,
      updatedAt: new Date("2025-01-13T10:10:00Z") as any,
      username: "analytics_god",
      image: "/img/demo-avatar2.png",
    },
    {
      id: "q_003",
      title: "Ethereum Gas Fee Trend",
      description: "Daily average gas fees on Ethereum over the last month.",
      creator: "user_991",
      private: false,
      query: "SELECT * FROM eth.gas_trend_daily LIMIT 30",
      tags: ["ethereum", "gas", "fees"],
      stared_by: ["user_a"],
      forked_from: "q_001",
      forked_by: ["user_z", "user_h"],
      forked: true,
      createdAt: new Date("2025-02-02T09:20:00Z") as any,
      updatedAt: new Date("2025-02-04T13:40:00Z") as any,
      username: "eth_monk",
      image: "/img/demo-avatar3.png",
    },
  ],

  pagination: {
    total_records: 3,
    current_page: 1,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  },
};

interface ExplorePageProps {
  searchParams: Promise<{
    tab?: "all" | "starred" | "forked";
    page?: string;
    search?: string;
  }>;
}

// MetaData
// =====================================
export const metadata = {
  title: "Explore Queries – Sandworm",
  description:
    "Browse public onchain queries from the community. Discover insights across Sui, Base, Etherium, Optimism and more.",
};

// Fetch All Queries
// =====================================
async function getQueries(page = "1", search = "") {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const data = await axios.get<QueryResponse>(
      `/api/query/?page=${page}&limit=10${searchParam}`
    );
    return { data, hasError: false };
  } catch (error) {
    console.error("Failed to fetch queries:", error);
    return { data: mockQueryResponse, hasError: true };
  }
}

// Fetch Starred Queries
// =====================================
async function getStarredQueries(page = "1") {
  try {
    const data = await axios.get<QueryResponse>(
      `/api/query?type=stars&page=${page}&limit=10`
    );
    return { data: mockQueryResponse, hasError: true };
  } catch (error) {
    console.error("Failed to fetch starred queries:", error);
    return { data: mockQueryResponse, hasError: true };
  }
}

// Fetch Forked Queries
// =====================================
async function getForkedQueries(page = "1") {
  try {
    const data = await axios.get<QueryResponse>(
      `/api/query?type=forks&page=${page}&limit=10`
    );
    return { data, hasError: false };
  } catch (error) {
    console.error("Failed to fetch forked queries:", error);
    return { data: mockQueryResponse, hasError: true };
  }
}

// Explore Page Main
// =====================================
export default async function Explore({ searchParams }: ExplorePageProps) {
  const page = (await searchParams).page ?? "1";
  const search = (await searchParams).search ?? "";
  const defaultTab = (await searchParams).tab ?? "all";

  const [
    { data: allQueries, hasError: allError },
    { data: starredQueries, hasError: starredError },
    { data: forkedQueries, hasError: forkedError },
  ] = await Promise.all([
    getQueries(page, search),
    getStarredQueries(page),
    getForkedQueries(page),
  ]);

  const isAllEmpty = false; // 💭 We're setting this to falso temporarily

  return (
    <div className=" dark:text-white min-h-[88vh]">
      <Head>
        <title>Explore</title>
      </Head>

      <div className="pt-5 px-8">
        {isAllEmpty ? (
          <div className="flex items-center justify-center flex-col dark:text-white font-medium text-lg mt-16 px-3">
            <Image
              src="/img/nodata.svg"
              width={400}
              height={400}
              alt="no data"
            />
            <p className="mt-4">
              Something went wrong fetching queries. Try again
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[#455768] text-sm mb-8 px-4">
              See what others are creating using Sandworm
            </p>
            <TabsSection
              queries={allQueries}
              starredQueries={starredQueries}
              forkedQueries={forkedQueries}
              defaultTab={defaultTab}
            />
          </div>
        )}
      </div>
    </div>
  );
}
