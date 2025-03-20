import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface IEntity {
  id: string;
  name: string;
}

interface IChain {
  chain: {
    id: string;
    name: string;
  };
  entities: IEntity[];
}

interface EntitiesExplorerProps {
  selectedChain: IChain;
  setCurrentView: (view: "chains" | "entities") => void;
}

export const EntitiesExplorer: React.FC<EntitiesExplorerProps> = ({
  selectedChain,
  setCurrentView,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const namespace = searchParams.get("namespace");

  const handleSelectEntity = (tableId: string) => {
    router.push(`?namespace=${namespace}&id=${tableId}`);
  };

  console.log(selectedChain);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center mb-2">
        <button
          onClick={() => {
            router.push("?");
            setCurrentView("chains"); // Go back to ChainExplorer
          }}
          className="text-primary hover:underline text-sm mr-2"
        >
          ← Back
        </button>
        <h3 className="font-medium">{selectedChain.chain.name} Tables</h3>
      </div>

      {selectedChain.entities.map(entity => (
        <button
          type="button"
          key={entity.id}
          onClick={() => handleSelectEntity(entity.id)}
          className="p-3 bg-secondary rounded-md hover:bg-primary/10 text-left"
        >
          {entity.name}
        </button>
      ))}
    </div>
  );
};
