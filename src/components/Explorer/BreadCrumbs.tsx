"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { explorerMockData } from "@/_mockdata/explorer";

export default function FieldExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const namespace = searchParams.get("namespace");
  const id = searchParams.get("id");

  const chainData = namespace
    ? explorerMockData.find(chain => chain.chainId === namespace)
    : null;
  const entity = chainData?.entities.find(table => table.id === id);

  const handleNavigate = (params: { namespace?: string; id?: string }) => {
    const newParams = new URLSearchParams();
    if (params.namespace) newParams.set("namespace", params.namespace);
    if (params.id) newParams.set("id", params.id);
    router.push(`/workspace?${newParams.toString()}`);
  };

  return (
    <nav className="py-3 px-4 border-b text-sm capitalize font-medium">
      <span className="cursor-pointer" onClick={() => handleNavigate({})}>
        Workspace
      </span>
      {namespace && (
        <>
          {" / "}
          <span
            className=" cursor-pointer"
            onClick={() => handleNavigate({ namespace })}
          >
            {namespace.charAt(0).toUpperCase() + namespace.slice(1)}
          </span>
        </>
      )}
      {id && (
        <>
          {" / "}
          <span className="cursor-pointer">
            {entity?.name || "Invalid Entity"}
          </span>
        </>
      )}
    </nav>
  );
}
