"use client";

import { useSearchParams, useRouter } from "next/navigation";

import type { IChainEntitySet } from "@/types";

interface IExplorerBreadCrumbsProps {
  entities: IChainEntitySet;
}

export const ExplorerBreadCrumbs: React.FC<IExplorerBreadCrumbsProps> = ({
  entities,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chain = searchParams.get("namespace");
  const entity = searchParams.get("id");
  const type = searchParams.get("type") ?? "raw";

  const activeEntity = entities?.[type as keyof typeof entities]?.find(
    (e: any) => e.name === entity
  );

  // TODO: could be a hook or a util function
  const handleNavigate = (params: {
    namespace?: string;
    id?: string;
    type?: "raw" | "decoded" | "project";
  }) => {
    const newParams = new URLSearchParams();
    if (params.namespace) newParams.set("namespace", params.namespace);
    if (params.id) newParams.set("id", params.id);
    if (params.type) newParams.set("type", params.type);
    router.push(`/console?${newParams.toString()}`);
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
