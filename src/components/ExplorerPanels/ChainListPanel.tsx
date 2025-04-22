import React from "react";
import { CiViewTable } from "react-icons/ci";
import Image from "next/image";

interface Chain {
  id: string;
  name: string;
}

interface IChainListPanelProps {
  chains: Chain[];
  onSelect: (id: string) => void;
}

export const ChainListPanel: React.FC<IChainListPanelProps> = ({
  chains,
  onSelect,
}) => {
  console.log(chains);
  return (
    <div className="flex flex-col  w-full border-t">
      {chains.map(chain => (
        <button
          type="button"
          key={chain.name}
          className="cursor-pointer py-4 px-3 rounded-none hover:bg-white/15 text-sm text-left flex items-center lowercase font-medium justify-between border-b last:border-b-0 transition-colors "
          onClick={() => onSelect(chain.name)}
        >
          <span className="flex space-x-2 items-center ">
            <CiViewTable size={15} />
            <span> {chain.name}</span>
          </span>

          <Image
            alt={`${chain.name} logo`}
            src={`https://raw.githubusercontent.com/sand-worm-sql/assets/master/blockchains/${chain.name.toLowerCase()}/info/logo.png`}
            width={25}
            height={25}
            unoptimized
            className="rounded-full border"
          />
        </button>
      ))}
    </div>
  );
};
