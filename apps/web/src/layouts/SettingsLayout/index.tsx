"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, ChevronLeft, CreditCard } from "lucide-react";
import { Button } from "@sandworm/ui/components/button";

import { User } from "@/components/Assets/User";
import { SliderHorizontal } from "@/components/Assets/SliderHorizontal";
import { GearIcon } from "@/components/Assets/GearIcon";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { useSignout } from "@/components/Editor/hooks/useAuth";

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
      icon: <UserRound size={18} />,
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
      icon: <CreditCard size={18} />,
    },
  ];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-base-200">
      <header className="flex shrink-0 items-center gap-2 border-b border-base-300 bg-base-500 px-10 py-3 text-[1.1rem] dark:border-border-tertiary dark:bg-base-500">
        <Link
          href="/workspace"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-ink-400 hover:bg-base-350 hover:text-ink-500 dark:text-ink-400 dark:hover:bg-base-700 dark:hover:text-ink-200 transition-all duration-100"
        >
          <ChevronLeft size={16} />
        </Link>

        <span>Settings</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside
          className="flex shrink-0 flex-col justify-between border-r border-border-secondary bg-base-200 p-6 px-3 dark:border-borderLight dark:border-border-tertiary dark:bg-base-500 md:h-full md:overflow-hidden"
          style={{ minWidth: 250 }}
        >
          <ul className="mt-4 flex w-full flex-col">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`mb-1.5 flex items-center space-x-2 rounded-xl border-l-4 px-4 py-1.5 text-sm font-medium ${
                    pathname === tab.href
                      ? "bg-base-600 text-primary dark:bg-editor-100"
                      : "text-text-gray hover:bg-dark-translucent"
                  }`}
                >
                  <span className="hidden flex-shrink-0 md:block">
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

        <main className="min-h-0 flex-1 overflow-y-auto bg-base-200 p-6 px-2 dark:bg-base-100 md:px-6  ">
          <div className="ml-4 border-l-8 border-t-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
