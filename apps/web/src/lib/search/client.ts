import { SearchClient } from "@sandworm/ui/kit/lib/search-client";

import { NEXT_PUBLIC_API_URL } from "@/utils/env";

export const searchClient = new SearchClient(() => NEXT_PUBLIC_API_URL());
