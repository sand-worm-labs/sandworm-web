import { usePathname, useSearchParams } from "next/navigation";

// props to chat gpt
function extractParamValue(
  pathname: string,
  path: string,
  paramName: string
): string {
  const regexPattern = pathname.replace(/\[([^\]]+)\]/g, (_match, p1) =>
    p1 === paramName ? "([\\w-]+)" : "[^/]+"
  );

  const regex = new RegExp(regexPattern);

  const match = regex.exec(path);

  return match?.[1] ?? "";
}

export const useStringQuery = (name: string): string => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const path = typeof window === "undefined" ? "" : window.location.pathname;

  // First check URL search params (?key=value)
  const searchParam = searchParams?.get(name);

  // If not in search params, extract from path params ([slug])
  const arg = searchParam ?? extractParamValue(pathname, path, name);

  return arg ?? "";
};
