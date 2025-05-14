"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { DicebearAvatar } from "@/components";

const tabs = [
  { name: "Profile", href: "/settings/profile" },
  { name: "Account", href: "/settings/account" },
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
    <div className=" w-full border-l-[8px]">
      {session && (
        <div className="container mx-auto py-12 flex justify-between items-center px-6">
          <div className="flex space-x-3 ">
            {session?.user?.image ? (
              <Image
                src={session?.user.image}
                width={50}
                height={50}
                alt={`${session?.user.name} image`}
                className="rounded-full border"
              />
            ) : (
              <DicebearAvatar
                size={50}
                seed={session?.user?.name || "sandworm"}
              />
            )}
            <div>
              <p className="font-medium">{session?.user.name}</p>
              <span className="mt-1 text-text-gray">Personal Account</span>
            </div>
          </div>
          <Link
            href="/explore"
            className="inline-block font-medium rounded py-1.5 lg:px-6  border-borderLight border text-sm px-3 bg-white/15  hover:bg-btnHover"
          >
            Go to Public Profile
          </Link>
        </div>
      )}

      <div className="flex min-h-screen container mx-auto ">
        <div className=" p-6 border-r border-borderLight my-12 w-[35rem]">
          <ul className="mt-4  flex flex-col w-full ">
            {tabs.map(tab => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`border-l-4 border-red-400 inline-block min-w-40 px-12 py-1.5 rounded-none text-sm mb-4  ${
                    pathname === tab.href
                      ? " bg-dark-translucent "
                      : "text-text-gray hover:bg-dark-translucent"
                  }`}
                >
                  {tab.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <main className="flex-1 p-6 line-bg">
          <div className="grid-overlay" />
          <div className="content border-t-8 border-l-8 h-20 ml-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
