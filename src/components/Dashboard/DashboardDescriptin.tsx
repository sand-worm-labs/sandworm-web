import Image from "next/image";

import { Badge } from "@/components/ui/badge";

export const ResearchDescription = () => {
  const info = {
    title: "GMX V1 Exploit",
    image: "/img/gmx.png",
    type: "Exploit Report",
    chain: "Arbitrum",
    tags: ["DeFi", "Re-entrancy", "Bridge", "Multichain Risk"],
    description: `
      In July 2025, GMX V1 on Arbitrum was exploited for approximately $42 million, 
due to a re-entrancy vulnerability in its GLP redemption logic. The attacker 
manipulated unstake functions to repeatedly extract funds before balances updated, 
then bridged a portion to Ethereum using CCTP.

While this incident was isolated to GMX V1, it’s part of a broader pattern: 
over $2.3 billion was lost to exploits across all chains in the first half of 2025 alone — 
with bridges, liquidity protocols, and DeFi incentives consistently targeted.

This report focuses on:
      • How the GMX exploit was executed  
      • Onchain fund flows and wallet activity  
      • Cross-chain laundering paths  
      • The ongoing pattern of vulnerabilities in legacy V1 protocols

      Sandworm provides a forensic lens on the mechanics of this attack.
    `,
  };

  return (
    <section className="w-full px-4 py-6 border-b border-white/10 bg-black text-white">
      <div className="flex items-start gap-10">
        <div className="min-w-[300px] min-h-[300px]">
          <Image
            src={info.image}
            alt={info.title}
            width={300}
            height={300}
            className="rounded-lg border border-white/10 object-cover"
          />
        </div>
        <div className="flex-1 border max-h-[300px] overflow-y-auto p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">{info.title}</h2>
            <Badge
              variant="outline"
              className="bg-red-600 text-white border-red-500"
            >
              {info.type}
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-600 text-white border-blue-500"
            >
              {info.chain}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {info.tags.map(tag => (
              <Badge
                key={info.title}
                variant="outline"
                className="bg-white/5 text-white border-white/10 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-white/80 mt-4 leading-relaxed whitespace-pre-wrap">
            {info.description.trim()}
          </p>
        </div>
      </div>
    </section>
  );
};
