import React from "react";
import { useRouter } from "next/navigation";

interface IChain {
  id: string;
  name: string;
  onSelect: (id: string) => void;
}

export const ChainExplorer: React.FC<{
  chains: IChain[];
}> = ({ chains }) => {
  const router = useRouter();

  const handleSelectChain = (chain: string) => {
    router.push(`?namespace=${chain.id}`);
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md w-64">
      {chains.map(chain => (
        <button
          type="button"
          key={chain.id}
          className="cursor-pointer p-3 bg-secondary rounded-md hover:bg-primary/10"
          onClick={() => handleSelectChain(chain.chain.id)}
        >
          {chain.chain.name} ({chain.chain.id.toUpperCase()})
        </button>
      ))}
    </div>
  );
};
