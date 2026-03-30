import type { Properties } from "@sandworm/types";
import useSWR from "swr";

import fetcher from "../../../utils/fetcher";
import { NEXT_PUBLIC_API_URL } from "../../../utils/env";

export default function useProperties() {
  return useSWR<Properties>(`${NEXT_PUBLIC_API_URL()}/v1/properties`, fetcher);
}
