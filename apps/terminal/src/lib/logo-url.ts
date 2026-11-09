import { env } from "@/config/env";

// A company's logo, from the Showcase's logo store: one per company, shared by
// every client that has it. It is the team's upload when there is one, else
// DefiLlama's icon, else nothing, and then the avatar shows the initial.
export const logoUrl = (slug: string) => `${env.apiUrl}/showcase/logos/${slug}`;
