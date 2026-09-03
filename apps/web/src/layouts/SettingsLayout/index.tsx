"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiUserCircle, PiCaretLeft, PiCreditCard } from "react-icons/pi";
import { Button } from "@sandworm/ui/components/button";

import { User } from "@/components/Assets/User";
import { SliderHorizontal } from "@/components/Assets/SliderHorizontal";
import { GearIcon } from "@/components/Assets/GearIcon";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { useSignout } from "@/components/Editor/hooks/useAuth";
import { ThemeTogggle } from "@/components/Theme/ThemeToggle";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signout = useSignout();
  const pathname = usePathname();
  const workspaceId = useStringQuery("workspace");

  const tabs = [
    {
      name: "Profile",
      href: `/workspace/${workspaceId}/settings/profile`,
      icon: <PiUserCircle size={18} />,
    },
    {
      name: "Account",
      href: `/workspace/${workspaceId}/settings/account`,
      icon: <GearIcon size={18} />,
    },
    {
      name: "Preferences",
      href: `/workspace/${workspaceId}/settings/preferences`,
      icon: <SliderHorizontal size={18} />,
    },
    {
      name: "Users",
      href: `/workspace/${workspaceId}/settings/users`,
      icon: <User size={18} />,
    },
    {
      name: "Plan",
      href: `/workspace/${workspaceId}/settings/plan`,
      icon: <PiCreditCard size={18} />,
    },
  ];

  const currentTab = tabs.find(tab => pathname.startsWith(tab.href));

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-base-200">
      <header className="flex shrink-0 items-center border-b border-base-300 bg-header-surface text-[1.1rem] dark:border-border-tertiary">
        <div
          className="flex shrink-0 items-center gap-2 border-r border-border-secondary px-10 py-3 dark:border-border-tertiary"
          style={{ minWidth: 250 }}
        >
          <Link
            href="/workspace"
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-ink-400 hover:bg-base-350 hover:text-ink-500 dark:text-ink-400 dark:hover:bg-base-700 dark:hover:text-ink-200 transition-all duration-100"
          >
            <PiCaretLeft size={16} />
          </Link>

          <span>Settings</span>
        </div>

        <div className="flex flex-1 items-center justify-between px-6 py-3">
          <span className="font-medium text-ink-100 dark:text-white">
            {currentTab?.name}
          </span>

          <ThemeTogggle iconSize={18} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside
          className="flex shrink-0 flex-col justify-between border-r border-border-secondary bg-base-200 p-6 px-3 dark:border-borderLight dark:border-border-tertiary dark:bg-sidebar-surface md:h-full md:overflow-hidden"
          style={{ minWidth: 250 }}
        >
          <ul className="mt-4 flex w-full flex-col">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`mb-1.5 flex items-center space-x-2 rounded-[10px] border px-4 py-1.5 text-sm font-medium transition-colors ${
                    pathname === tab.href
                      ? "bg-hover-bg dark:bg-white/[0.08] dark:text-white border-hover-border dark:border-transparent"
                      : "text-menu-ink dark:text-white border-transparent hover:bg-hover-bg dark:hover:bg-sidebar-hover hover:border-hover-border hover:dark:text-white"
                  }`}
                >
                  <span
                    className={`hidden flex-shrink-0 md:block ${
                      pathname === tab.href
                        ? "dark:text-ink-100"
                        : "dark:text-placeholder-muted"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <Button
              variant="destructive"
              onClick={signout}
              className="w-full py-2 font-body text-[0.8rem] bg-error dark:bg-[#FF4444]"
            >
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        <hr className="md:hidden" />

        <main className="min-h-0 flex-1 overflow-y-auto bg-base-200 p-6 px-2 dark:bg-page-surface md:px-6  ">
          <div className="ml-4 border-l-8 border-t-8 border-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
