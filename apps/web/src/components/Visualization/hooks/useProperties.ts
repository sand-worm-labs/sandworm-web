import type { Properties } from "@sandworm/types";
import useSWR from "swr";

import { NEXT_PUBLIC_API_URL } from "@/utils/env";
import fetcher from "@/utils/fetcher";

export default function useProperties() {
  return useSWR<Properties>(`${NEXT_PUBLIC_API_URL()}/v1/properties`, fetcher);
}
