import React from "react";

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
  return (
    <div className="flex flex-col gap-2 p-4 border w-full">
      {chains.map(chain => (
        <button
          type="button"
          key={chain.id}
          className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left"
          onClick={() => onSelect(chain.id)}
        >
          {chain.name}
        </button>
      ))}
    </div>
  );
};
