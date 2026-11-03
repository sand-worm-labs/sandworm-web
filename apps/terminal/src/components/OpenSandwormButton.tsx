"use client";

// A client component on purpose: @sandworm/ui/lib/utils exports a React hook next to `cn`, and
// the ui components are not marked "use client", so importing one from a server component
// fails the build. Keep @sandworm/ui imports in files like this one.
import { Button } from "@sandworm/ui/components/button";

import { WEB_APP_URL } from "@/lib/config";

export function OpenSandwormButton() {
  return (
    <Button asChild>
      <a href={WEB_APP_URL}>Open Sandworm</a>
    </Button>
  );
}
