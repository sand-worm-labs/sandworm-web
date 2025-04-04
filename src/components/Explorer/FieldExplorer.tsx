"use client";

import { useSearchParams } from "next/navigation";
import type { Entity } from "@/_mockdata/explorer";

interface FieldExplorerProps {
  entities: Entity[];
}

export const FieldExplorer = ({ entities }: FieldExplorerProps) => {
  const searchParams = useSearchParams();
  const namespace = searchParams.get("namespace");
  const id = searchParams.get("id");

  if (!namespace || !id) return <p>Invalid selection</p>;

  const entity = entities.find(entity => entity.name === id);

  console.log(entity, entities, "entities");

  if (!entity) return <p>Invalid Entity</p>;

  return (
    <div className="flex flex-col gap-1 p-4 border w-full">
      <h2 className="text-sm font-medium mb-4">{entity.id}</h2>
      <ul className="space-y-2">
        {Object.entries(entity.fields).map(([name, type]) => (
          <li
            key={name}
            className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-primary/10 text-[0.8rem] font-medium text-left flex justify-between"
          >
            {name}
            <span className="bg-dark-translucent px-1 py-0.5 rounded">
              {type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
