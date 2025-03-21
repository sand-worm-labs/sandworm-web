"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Profile", href: "/settings/profile" },
  { name: "Account", href: "/settings/account" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen container mx-auto">
      <aside className="w-72 p-6 border-r border-borderLight my-12">
        <h2 className="text-sm font-semibold text-white">Settings</h2>
        <nav className="mt-4 space-y-5">
          {tabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`block px-4 py-1.5 rounded-md text-sm ${
                pathname === tab.href
                  ? "text-orange-600 bg-dark-translucent"
                  : "text-text-gray hover:bg-dark-translucent"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 line-bg">
        <div className="grid-overlay" />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
