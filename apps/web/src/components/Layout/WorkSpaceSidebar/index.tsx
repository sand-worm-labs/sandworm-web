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

export const WorkspaceSidebar = () => {
  const pathname = usePathname();

  //note: we replace this with useworkspace hook once ready
  const workspaceId = pathname.split("/")[2] ?? "";

  const mainNav: NavItem[] = [
    { name: "Home", href: `/workspace/${workspaceId}`, icon: Home },
    {
      name: "Sessions",
      href: `/workspace/${workspaceId}/session`,
      icon: Clock,
    },
    {
      name: "Explore",
      href: `/workspace/${workspaceId}/explore`,
      icon: Search,
    },
  ];

  const toolsNav: NavItem[] = [
    {
      name: "Ask a question",
      href: `/workspace/${workspaceId}/notebook`,
      icon: Bot,
    },
    {
      name: "Console",
      href: `/workspace/${workspaceId}/console`,
      icon: Terminal,
    },
    {
      name: "All tools",
      href: `/workspace/${workspaceId}/tools`,
      icon: LuLayoutGrid,
    },
  ];

  const linkClasses = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
     ${
       pathname === href
         ? "bg-white dark:bg-[#181C21] shadow-[0_0.5px_4px_#2516660A] text-black dark:text-white "
         : "text-gray-600 dark:text-white hover:bg-[#ffffff] dark:hover:bg-[#181C21] hover:text-black dark:hover:text-white"
     }`;

  return (
    <aside className="w-[220px] h-full flex flex-col justify-between dark:bg-[#0C1015] bg-[#F1F3F4] border-r dark:border-[#262A30] border-[#E9ECEF]">
      <div>
        <div className="px-4 py-4" />

        <nav className="flex-1 px-3">
          {/* MAIN NAV */}
          <ul className="space-y-1">
            {mainNav.map(item => (
              <li key={item.name}>
                <Link href={item.href} className={linkClasses(item.href)}>
                  <item.icon
                    strokeWidth={1.8}
                    className={`h-4 w-4 text-[#1C3B5A] dark:text-[#868E96]`}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <hr className="border-t-[1px] border-[#E6E0F1] dark:border-[#262A30] mt-4" />

          {/* TOOLS NAV */}
          <ul className="space-y-1 mt-4">
            {toolsNav.map(item => (
              <li key={item.name}>
                <Link href={item.href} className={linkClasses(item.href)}>
                  <item.icon
                    strokeWidth={1.8}
                    className={`h-4 w-4 text-[#1C3B5A] dark:text-[#868E96]`}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <AccountDropdown />
    </aside>
  );
};
