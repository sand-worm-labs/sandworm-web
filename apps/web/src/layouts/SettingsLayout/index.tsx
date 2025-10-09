"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserRound, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const tabs = [
  { name: "Profile", href: "/settings/profile", icon: <UserRound size={16} /> },
  { name: "Account", href: "/settings/account", icon: <Settings size={16} /> },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") return null;

  return (
    <div className=" w-full border-t">
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

      <div className="flex min-h-screen container mx-auto md:flex-row flex-col ">
        <div className=" p-6 border-r border-borderLight my-12 w-[35rem]">
          <ul className="mt-4  flex flex-col w-full ">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`border-l-4  px-12 py-2 rounded-none text-xs font-semibold mb-2 flex space-x-2  items-center  ${
                    pathname === tab.href
                      ? " bg-dark-translucent border-orange-600  "
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
