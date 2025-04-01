"use client";

import { useSearchParams } from "next/navigation";

import { explorerMockData } from "@/_mockdata/explorer";

export default function FieldExplorer() {
  const searchParams = useSearchParams();
  const namespace = searchParams.get("namespace");
  const id = searchParams.get("id");

  if (!namespace || !id) return <p>Invalid selection</p>;

  const chainData = explorerMockData.find(chain => chain.chainId === namespace);

  const entity = chainData?.entities.find(table => table.id === id);

  if (!entity) return <p>Invalid Entity</p>;

  return (
    <div className="flex flex-col gap-1 p-4 border w-full">
      <h2 className="text-sm font-medium mb-4">{chainData?.chainId} </h2>
      <ul className="space-y-2">
        {entity.fields.map(field => (
          <li
            key={field.name}
            className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-primary/10 text-[0.8rem] font-medium text-left flex justify-between "
          >
            {field.name}
            <span className="bg-dark-translucent px-1 py-0.5 rounded">
              {field.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
