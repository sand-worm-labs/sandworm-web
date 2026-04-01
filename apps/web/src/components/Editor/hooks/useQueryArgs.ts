import { useParams, useSearchParams } from "next/navigation";

// =====================================
// ⬢ Use String Queries
// =====================================
// Extract string value from route or search params
// Returns the first valid string match or empty string fallback
// =====================================
export const useStringQuery = (name: string): string => {
  const params = useParams();
  const searchParams = useSearchParams();

  const searchParam = searchParams?.get(name);

  if (searchParam) {
    return searchParam;
  }

  const param = params?.[name];

  if (typeof param === "string") {
    return param;
  }

  if (Array.isArray(param)) {
    return param[0] ?? "";
  }

  return "";
};
