"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Breadcrumbs() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const namespace = searchParams.get("namespace");
  const id = searchParams.get("id");

  if (!namespace) return null; // Hide if no namespace exists

  // Generate paths for breadcrumbs
  const handleNavigate = (newParams: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <nav className="py-3 px-4 border-b ">
      <ul className="flex items-center space-x-2 text-sm capitalize">
        <li>
          <button
            onClick={() => handleNavigate({ namespace: null, id: null })}
            className=" hover:text-primary"
          >
            Workspace
          </button>
          <span> /</span>
        </li>
        <li>
          <button
            onClick={() => handleNavigate({ id: null })}
            className=" hover:text-primary capitalize"
          >
            {namespace}
          </button>
          {id && <span> /</span>}
        </li>
        {id && (
          <li className="hover:text-primary cursor-pointer">
            {id.replace(`${namespace}.`, "")}
          </li>
        )}
      </ul>
    </nav>
  );
}
