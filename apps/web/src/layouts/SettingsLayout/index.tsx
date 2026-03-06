"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  UserRound,
  Settings,
  SlidersHorizontal,
  Users,
  ChevronLeft,
} from "lucide-react";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useSession } from "@/components/Visualization/hooks/useAuth";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: session } = useSession({ redirectToLogin: true });
  const pathname = usePathname();
  const workspaceId = useStringQuery("workspace");

  const tabs = [
    {
      name: "Profile",
      href: `/workspace/${workspaceId}/settings/profile`,
      icon: <UserRound size={16} />,
    },
    {
      name: "Account",
      href: `/workspace/${workspaceId}/settings/account`,
      icon: <Settings size={16} />,
    },
    {
      name: "Preferences",
      href: `/workspace/${workspaceId}/settings/preferences`,
      icon: <SlidersHorizontal size={16} />,
    },
    {
      name: "Users",
      href: `/workspace/${workspaceId}/settings/users`,
      icon: <Users size={16} />,
    },
  ];

  if (status === "loading") return null;

  return (
    <div className=" w-full">
      <div className="flex items-center gap-2 py-3 border-b border-[#F1F3F4] dark:border-border-tertiary px-10 text-[1.1rem] dark:bg-base-500">
        <Link
          href="/workspace"
          className="text-gray-500 hover:text-ink-100 dark:text-ink-400 dark:hover:text-white transition "
        >
          <ChevronLeft size={16} />
        </Link>

        <span>Settings</span>
      </div>

      <div className="flex min-h-screen  md:flex-row flex-col ">
        <div className=" p-6 px-3 border-r dark:border-borderLight my-12 min-w-[35rem] border-[#E9ECEF] dark:border-border-tertiary bg-[#FEFFFF] dark:bg-base-500">
          <ul className="mt-4  flex flex-col w-full ">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`border-l-4  px-8 py-1.5 text-sm font-medium mb-1 flex space-x-2  items-center rounded-xl  ${
                    pathname === tab.href
                      ? " bg-[#EBF7F7] dark:bg-[#181C21]  text-primary"
                      : "text-text-gray hover:bg-dark-translucent"
                  }`}
                >
                  {tab.icon}
                  <span> {tab.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <hr className="md:hidden" />

        <main className="flex-1 p-6  px-2 md:px-6 dark:bg-base-100  ">
          <div className=" border-t-8 border-l-8 h-20 ml-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
