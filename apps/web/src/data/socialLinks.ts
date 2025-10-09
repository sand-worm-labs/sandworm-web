import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";

import type { SocialLink } from "@/types/link";

export const socialLinks: SocialLink[] = [
  { name: "GitHub", icon: FaGithub, href: "https://github.com/sand-worm-labs" },
  { name: "Discord", icon: FaDiscord, href: "https://discord.gg/pftQtpcjK2" },
  { name: "Twitter", icon: FaTwitter, href: "https://x.com/sandwormlabs" },
];
