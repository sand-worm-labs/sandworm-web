import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExplorerTable } from "@/_mockdata/explorer";

interface EntitiesExplorerProps {
  entities: ExplorerTable[];
}

export const EntitiesExplorer: React.FC<EntitiesExplorerProps> = ({
  entities,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedEntity = searchParams.get("id");

  console.log(selectedEntity, selectedEntity, entities);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md w-64">
      {entities.map(entity => (
        <button
          type="button"
          key={entity.id}
          onClick={() => router.push(`?id=${entity.id}`)}
          className={`p-2 rounded-md text-left ${
            selectedEntity === entity.id
              ? "bg-green-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {entity.name}
        </button>
      ))}
    </div>
  );
};
