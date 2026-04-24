"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, ChevronLeft } from "lucide-react";
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
  ];

  return (
    <div className=" w-full min-h-screen  bg-[#FEFFFF] ">
      <div className="flex items-center gap-2 py-3 border-b border-[#F1F3F4] dark:border-border-tertiary px-10 text-[1.1rem] dark:bg-base-500 bg-[#FBFBFB]">
        <Link
          href="/workspace"
          className="text-ink-400  hover:text-ink-100 dark:text-ink-400 dark:hover:text-white transition "
        >
          <ChevronLeft size={16} />
        </Link>

        <span>Settings</span>
      </div>

      <div className="flex flex-1 min-h-0 md:flex-row flex-col h-full">
        <div
          className="p-6 px-3 border-r dark:border-borderLight my-12 border-border-secondary  dark:border-border-tertiary bg-[#FEFFFF] dark:bg-base-500 flex-col justify-between flex self-stretch h-screen"
          style={{ minWidth: 250 }}
        >
          <ul className="mt-4 flex  flex-col w-full">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`border-l-4  px-4 py-1.5 text-sm font-medium mb-1.5 flex space-x-2  items-center rounded-xl  ${pathname === tab.href
                      ? " bg-[#EBF7F7] dark:bg-[#181C21]  text-primary"
                      : "text-text-gray hover:bg-dark-translucent"
                    }`}
                >
                  <span className="flex-shrink-0 hidden md:block">
                    {tab.icon}
                  </span>
                  <span> {tab.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="lg:block hidden">
            <Button
              variant="destructive"
              onClick={signout}
              className="w-full text-[0.8rem] py-2 bg-[#FF0000] dark:bg-[#FF4444] font-body "
            >
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        <hr className="md:hidden" />

        <main className="flex-1 p-6  px-2 md:px-6 dark:bg-base-100 bg-[#FEFFFF]   ">
          <div className=" border-t-8 border-l-8 h-20 ml-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
