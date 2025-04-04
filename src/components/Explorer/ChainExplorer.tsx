import React from "react";
import { Sheet } from "lucide-react";
import Image from "next/image";

interface Chain {
  id: string;
  name: string;
}

interface ChainExplorerProps {
  chains: Chain[];
  onSelect: (id: string) => void;
}

export const ChainExplorer: React.FC<ChainExplorerProps> = ({
  chains,
  onSelect,
}) => {
  console.log(chains);
  return (
    <div className="flex flex-col gap-2 p-4 border w-full">
      {chains.map(chain => (
        <button
          type="button"
          key={chain.id}
          className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center lowercase font-medium justify-between"
          onClick={() => onSelect(chain.name)}
        >
          <span className="flex space-x-2 items-center ">
            <Sheet size={15} />
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
