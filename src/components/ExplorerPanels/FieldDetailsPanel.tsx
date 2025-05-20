"use client";

import { useSearchParams } from "next/navigation";

import type { IChainEntitySet } from "@/types";

interface IFieldDetailsPanelProps {
  entities: IChainEntitySet;
}

export const FieldDetailsPanel = ({ entities }: IFieldDetailsPanelProps) => {
  const searchParams = useSearchParams();
  const chain = searchParams.get("namespace");
  const entity = searchParams.get("id");

  const activeEntity = entities.raw.find(e => e.name === entity);

  if (!chain || !entity) return <p>Invalid selection</p>;

  if (!activeEntity) return <p>Entity not found</p>;

  return (
    <div className="flex flex-col gap-1 p-4 border w-full">
      <h2 className="text-sm font-medium mb-4">{activeEntity.name}</h2>
      <ul className="space-y-2">
        {Object.entries(activeEntity.fields).map(([name, type]) => (
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
