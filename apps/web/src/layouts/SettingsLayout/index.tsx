"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  UserRound,
  Settings,
  SlidersHorizontal,
  Users,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@sandworm/ui/components/avatar";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
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
    <div className=" w-full ">
      <div className="flex items-center gap-2 py-3 border-b border-[#E9ECEF] dark:border-[#262A30] px-10 text-[1.1rem]">
        <Link
          href="/workspace"
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition "
        >
          <ChevronLeft size={16} />
        </Link>

        <span>Settings</span>
      </div>
      {session && (
        <div className="container mx-auto py-6 flex justify-between md:items-center px-6 flex-col md:flex-row  space-y-4 items-start">
          <div className="flex space-x-3 items-center">
            {session?.user?.image ? (
              <Image
                src={session?.user.image}
                width={60}
                height={60}
                alt={`${session?.user.name} image`}
                className="rounded-full border"
              />
            ) : (
              <Avatar className="h-64 w-64">
                <AvatarFallback>
                  {session?.user.id?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-bold">{session?.user.name}</p>
              <span className=" text-text-gray text-sm">Personal Account</span>
            </div>
          </div>
          <Link
            href="workspace/explore"
            className="inline-block font-semibold rounded py-1.5 lg:px-4  border-borderLight border text-xs px-3 bg-white/15  hover:bg-btnHover"
          >
            Go to Public Profile
          </Link>
        </div>
      )}

      <div className="flex min-h-screen  md:flex-row flex-col ">
        <div className=" p-6 border-r dark:border-borderLight my-12 min-w-[30rem] border-[#E9ECEF] bg-[#F1F3F4] dark:bg-black">
          <ul className="mt-4  flex flex-col w-full ">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`border-l-4  px-6 py-1.5 text-sm font-medium mb-1 flex space-x-2  items-center rounded-lg  ${
                    pathname === tab.href
                      ? " bg-white dark:bg-[#181C21] dark:border-[#262A30] border-[#E9ECEF] border "
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

        <main className="flex-1 p-6  line-bg">
          <div className=" border-t-8 border-l-8 h-20 ml-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
