"use client";

import { Home, Search, Clock, Bot, Terminal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutGrid } from "react-icons/lu";

import { AccountDropdown } from "@/components/AccountDropdown";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { name: "Home", href: "/workspace", icon: Home },
  { name: "Sessions", href: "/workspace/session", icon: Clock },
  { name: "Explore", href: "/workspace/explore", icon: Search },
];

const toolsNav: NavItem[] = [
  { name: "Ask a question", href: "/chat", icon: Bot },
  { name: "Console", href: "/console", icon: Terminal },
  { name: "All tools", href: "/workspace/tools", icon: LuLayoutGrid },
];

export const WorkspaceSidebar = () => {
  const pathname = usePathname();

  const linkClasses = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
     ${
       pathname === href
         ? "bg-[#DEE2E6] text-black "
         : "text-gray-600 hover:bg-white/10"
     }`;

  return (
    <aside className="w-64 h-screen flex flex-col bg-[#F1F3F4]">
      <div className="px-6 py-4" />
      <AccountDropdown />

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {mainNav.map(item => (
            <li key={item.name}>
              <Link href={item.href} className={linkClasses(item.href)}>
                <item.icon
                  className={`h-5 w-5 ${
                    pathname === item.href ? "text-black" : "text-gray-600"
                  }`}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="space-y-1 mt-6">
          {toolsNav.map(item => (
            <li key={item.name}>
              <Link href={item.href} className={linkClasses(item.href)}>
                <item.icon
                  className={`h-5 w-5 ${
                    pathname === item.href ? "text-black" : "text-gray-600"
                  }`}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
