import React from "react";
import Image from "next/image";

import { type Chain, getChainLogoUrl } from "@/store/chains";

import { FourSquare } from "../Assets/FourSquare";

interface IChainListPanelProps {
  chains: Chain[];
  onSelect: (id: string) => void;
}

export const ChainListPanel: React.FC<IChainListPanelProps> = ({
  chains,
  onSelect,
}) => {
  return (
    <div className="flex flex-col  w-full ">
      {chains.map(chain => (
        <button
          type="button"
          key={chain.name}
          className="cursor-pointer py-3 px-3 rounded-none hover:bg-white/15 text-sm text-left flex items-center lowercase  justify-between border-b last:border-b-0 transition-colors border-b-[#E9ECEF] dark:border-border-tertiary "
          onClick={() => onSelect(chain.short_code)}
        >
          <span className="flex space-x-2 items-center ">
            <FourSquare />
            <span> {chain.short_code}</span>
          </span>

          <Image
            alt={`${chain.name} logo`}
            src={getChainLogoUrl(chain.name)}
            width={25}
            height={25}
            unoptimized
            className="rounded-full "
          />
        </button>
      ))}
    </div>
  );
};
