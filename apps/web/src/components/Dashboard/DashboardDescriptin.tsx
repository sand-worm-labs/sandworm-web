import Image from "next/image";

import { Badge } from "@/components/ui/badge";

export const ResearchDescription = () => {
  const degeninfo = {
    title: "Uniswap Degen Activity",
    image: "/img/degen.png",
    type: "Token Analysis",
    chain: "Base",
    tags: ["DeFi", "Transaction", "Wallet"],
    description: `
      This dashboard shows the summary of DEGEN Uniswap activity such as transaction count (buy and sell), top wallet interactions, Uniswap burn events, and liquidity activity on Base. It harnesses Sandworm's forensic tools to monitor real-time transaction data, identify dominant wallets, track burn activities, and analyze liquidity contributions, with Degen priced at approximately $0.004 as of July 2025.
    `,
  };

  return (
    <section className="w-full px-4 py-6 border-b border-white/10 bg-black text-white">
      <div className="flex items-start gap-10">
        <div className="min-w-[300px] min-h-[300px]">
          <Image
            src={degeninfo.image}
            alt={degeninfo.title}
            width={300}
            height={300}
            className="rounded-lg border border-white/10 object-cover"
          />
        </div>
        <div className="flex-1 border max-h-[300px] overflow-y-auto p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">
              {degeninfo.title}
            </h2>
            <Badge
              variant="outline"
              className="bg-red-600 text-white border-red-500"
            >
              {degeninfo.type}
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-600 text-white border-blue-500"
            >
              {degeninfo.chain}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {degeninfo.tags.map((tag) => (
              <Badge
                key={degeninfo.tags.indexOf(tag)}
                variant="outline"
                className="bg-white/5 text-white border-white/10 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-white/80 mt-4 leading-relaxed whitespace-pre-wrap">
            {degeninfo.description.trim()}
          </p>
        </div>
      </div>
    </section>
  );
};
