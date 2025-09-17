import { Home, Search, Clock, Bot, Terminal } from "lucide-react";
import Link from "next/link";

import { AccountDropdown } from "@/components/AccountDropdown";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { name: "Home", href: "/workspace", icon: Home },
  { name: "Sessions", href: "/sessions", icon: Clock },
  { name: "Explore", href: "workspace/explore", icon: Search },
];

const toolsNav: NavItem[] = [
  { name: "Worm AI", href: "/wormai", icon: Bot },
  { name: "Console", href: "/console", icon: Terminal },
];

export const WorkspaceSidebar = () => {
  return (
    <aside className="w-64  border-r h-screen flex flex-col">
      <div className="px-6 py-4" />

      <AccountDropdown />

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {mainNav.map(item => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t" />

        <ul className="space-y-1">
          {toolsNav.map(item => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10"
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
