"use client";

import { useSearchParams } from "next/navigation";

import { explorerMockData } from "@/_mockdata/explorer";

export default function FieldExplorer() {
  const searchParams = useSearchParams();
  const namespace = searchParams.get("namespace");
  const id = searchParams.get("id");

  if (!namespace || !id) return <p>Invalid selection</p>;

  const chainData = explorerMockData.find(
    chain => chain.chain.id === namespace
  );
  const entity = chainData?.entities.find(table => table.id === id);

  if (!entity) return <p>Invalid Entity</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Fields for {entity.name}</h2>
      <ul className="space-y-2">
        {entity.fields.map(field => (
          <li key={field.name} className="p-3 bg-secondary rounded-md">
            {field.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
