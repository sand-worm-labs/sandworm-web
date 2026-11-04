"use client";

import { HelpMenu } from "@sandworm/ui/kit/app-header";

import { footerLinks } from "@/data/footerLinks";
import { socialLinks } from "@/data/socialLinks";

const DOCS_URL =
  footerLinks.find(link => link.label === "Docs")?.href ??
  "https://docs.sandwormlab.xyz";

const GITHUB_URL =
  socialLinks.find(link => link.name === "GitHub")?.href ??
  "https://github.com/sand-worm-labs";

export default function HelpDropdown() {
  return <HelpMenu docsUrl={DOCS_URL} githubUrl={GITHUB_URL} />;
}
