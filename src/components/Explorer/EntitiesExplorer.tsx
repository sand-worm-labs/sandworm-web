import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExplorerTable } from "@/_mockdata/explorer";

interface EntitiesExplorerProps {
  entities: ExplorerTable[];
}

export const EntitiesExplorer: React.FC<EntitiesExplorerProps> = ({
  entities,
  onSelect,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedEntity = searchParams.get("id");

  console.log(selectedEntity, selectedEntity, entities);

  return (
    <div className="flex flex-col p-4 border  gap-2  w-full">
      {entities.map(entity => (
        <button
          type="button"
          key={entity.id}
          onClick={onSelect}
          className={`p-2 rounded-md text-left  hover:bg-primary/10 text-sm`}
        >
          {entity.name}
        </button>
      ))}
    </div>
  );
};
