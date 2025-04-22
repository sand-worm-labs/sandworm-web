"use client";

import { useSearchParams, useRouter } from "next/navigation";

import type { IChainEntity } from "@/types";

interface IExplorerBreadCrumbsProps {
  entities: IChainEntity[];
}

export const ExplorerBreadCrumbs: React.FC<IExplorerBreadCrumbsProps> = ({
  entities,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chain = searchParams.get("namespace");
  const entity = searchParams.get("id");

  const activeEntity = entities.find(e => e.name === entity);

  const handleNavigate = (params: { namespace?: string; id?: string }) => {
    const newParams = new URLSearchParams();
    if (params.namespace) newParams.set("namespace", params.namespace);
    if (params.id) newParams.set("id", params.id);
    router.push(`/workspace?${newParams.toString()}`);
  };

  return (
    <nav className="py-3 px-4 border-b text-sm capitalize font-medium">
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => handleNavigate({})}
      >
        Workspace
      </button>
      {chain && (
        <>
          {" / "}
          <button
            type="button"
            className=" cursor-pointer"
            onClick={() => handleNavigate({ namespace: chain })}
          >
            {chain.charAt(0).toUpperCase() + chain.slice(1)}
          </button>
        </>
      )}
      {entity && (
        <>
          {" / "}
          <span className="cursor-pointer">{activeEntity?.name || "NA"}</span>
        </>
      )}
    </nav>
  );
};
