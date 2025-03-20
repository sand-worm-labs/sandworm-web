import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface EntitiesExplorerProps {
  chain: {
    id: string;
    name: string;
    entities: { id: string; name: string }[];
  };
}

export const EntitiesExplorer: React.FC<EntitiesExplorerProps> = ({
  chain,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedEntity = searchParams.get("namespace");

  console.log(selectedEntity, selectedEntity, chain);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md w-64">
      {chain.entities.map(table => (
        <button
          type="button"
          key={table.id}
          onClick={() => router.push(`?namespace=${chain}&id=${table.id}`)}
          className={`p-2 rounded-md text-left ${
            selectedEntity === table.id
              ? "bg-green-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {table.name}
        </button>
      ))}
    </div>
  );
};
