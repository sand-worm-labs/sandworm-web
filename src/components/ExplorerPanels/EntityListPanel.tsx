import React from "react";
import { Sheet } from "lucide-react";

import type { IChainEntitySet } from "@/types";

type EntityType = "raw" | "project" | "decoded";

interface IEntityListPanelProps {
  entities: IChainEntitySet;
  onSelect: (entityId: string, type: EntityType) => void;
}

const entityTypes: { key: EntityType; label: string }[] = [
  { key: "raw", label: "raw" },
  { key: "project", label: "project" },
  { key: "decoded", label: "decoded" },
];

export const EntityListPanel: React.FC<IEntityListPanelProps> = ({
  entities,
  onSelect,
}) => {
  return (
    <div className="flex flex-col p-4 border gap-2 w-full">
      {entityTypes.map(({ key, label }) => {
        const list = entities[key];
        if (!list?.length) return null;

        return (
          <div key={key}>
            <p className="text-xs text-text-gray font-medium">{label}</p>
            {list.map(entity => (
              <button
                type="button"
                key={entity.name}
                onClick={() => onSelect(entity.name, key)}
                className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center space-x-2 lowercase font-medium"
              >
                <Sheet size={15} />
                <span>{entity.name}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
};
