import React from "react";
import { useRouter } from "next/navigation";

interface IChain {
  chain: {
    id: string;
    name: string;
  };
  entities: { id: string; name: string }[];
}

export const ChainExplorer: React.FC<{
  chains: IChain[];
  setCurrentView: (view: "chains" | "entities") => void;
  setSelectedChain: (chain: IChain) => void;
}> = ({ chains, setCurrentView, setSelectedChain }) => {
  const router = useRouter();

  const handleSelectChain = (chain: IChain) => {
    router.push(`?namespace=${chain.chain.id}`);
    setSelectedChain(chain); // Store the selected chain
    setCurrentView("entities"); // Switch to EntitiesExplorer
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md w-64">
      {chains.map(({ chain }) => (
        <button
          type="button"
          key={chain.id}
          className="cursor-pointer p-3 bg-secondary rounded-md hover:bg-primary/10"
          onClick={() => handleSelectChain({ chain, entities: [] })}
        >
          {chain.name} ({chain.id.toUpperCase()})
        </button>
      ))}
    </div>
  );
};
