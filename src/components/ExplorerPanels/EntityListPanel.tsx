import React from "react";
import { Sheet } from "lucide-react";

import type { IChainEntitySet } from "@/types";

interface IEntityListPanelProps {
  entities: IChainEntitySet;
  onSelect: (entityId: string) => void;
}

export const EntityListPanel: React.FC<IEntityListPanelProps> = ({
  entities,
  onSelect,
}) => {
  return (
    <div className="flex flex-col p-4 border  gap-2  w-full">
      <p className="text-xs text-text-gray font-medium">raw</p>
      {entities.raw.map(entity => (
        <button
          type="button"
          key={entity.name}
          onClick={() => onSelect(entity.name)}
          className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center space-x-2 lowercase font-medium"
        >
          <Sheet size={15} />
          <span> {entity.name}</span>
        </button>
      ))}
      <p className="text-xs text-text-gray font-medium">project</p>
      {entities.project.map(entity => (
        <button
          type="button"
          key={entity.name}
          onClick={() => onSelect(entity.name)}
          className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center space-x-2 lowercase font-medium"
        >
          <Sheet size={15} />
          <span> {entity.name}</span>
        </button>
      ))}
      <p className="text-xs text-text-gray font-medium">decoded</p>
      {entities.decoded.map(entity => (
        <button
          type="button"
          key={entity.name}
          onClick={() => onSelect(entity.name)}
          className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center space-x-2 lowercase font-medium"
        >
          <Sheet size={15} />
          <span> {entity.name}</span>
        </button>
      ))}
    </div>
  );
};
