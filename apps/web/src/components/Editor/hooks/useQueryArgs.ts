import { useParams, useSearchParams } from "next/navigation";

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
  const params = useParams();
  const searchParams = useSearchParams();

  // First check URL search params (?key=value)
  const searchParam = searchParams?.get(name);

  if (searchParam) {
    return searchParam;
  }

  // Then check dynamic route params
  const param = params?.[name];

  if (typeof param === "string") {
    return param;
  }

  if (Array.isArray(param)) {
    return param[0] ?? "";
  }

  return "";
};
