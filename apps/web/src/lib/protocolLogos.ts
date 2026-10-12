import { slugify } from "@/lib/showcase";

// A protocol's logo, at a route that answers with the studio's upload if there is one,
// and otherwise DefiLlama's icon for the same slug (see app/protocol-logos). A protocol
// added in the studio needs nothing here.
export const protocolLogoUrl = (name: string) =>
  `/protocol-logos/${slugify(name)}`;
