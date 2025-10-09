import type { IconType } from "react-icons";

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  icon: IconType;
  href: string;
}
