import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";

import type { SocialLink } from "@/types/link";

export const socialLinks: SocialLink[] = [
  { name: "GitHub", icon: FaGithub, href: "/" },
  { name: "Discord", icon: FaDiscord, href: "/" },
  { name: "Twitter", icon: FaTwitter, href: "/" },
];
