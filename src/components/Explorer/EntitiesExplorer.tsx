import React from "react";
import type { ExplorerTable } from "@/_mockdata/explorer";
import { Sheet } from "lucide-react";

interface EntitiesExplorerProps {
  entities: ExplorerTable[];
  onSelect: (entityId: string) => void;
}

export const EntitiesExplorer: React.FC<EntitiesExplorerProps> = ({
  entities,
  onSelect,
}) => {
  return (
    <div className="flex flex-col p-4 border  gap-2  w-full">
      {entities.map(entity => (
        <button
          type="button"
          key={entity.id}
          onClick={() => onSelect(entity.id)}
          className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center space-x-2 lowercase font-medium"
        >
          <Sheet size={15} />
          <span> {entity.name}</span>
        </button>
      ))}
    </div>
  );
};
