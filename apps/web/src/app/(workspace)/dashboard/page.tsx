"use client";

import dynamic from "next/dynamic";
import Head from "next/head";

const Dashboard = dynamic(
  () => import("@/components/Visualization/blocks/Dashboard"),
  {
    ssr: false,
  }
);

export default function DashboardPage() {
  const mockDocument = {
    title: "Test Dashboard",
    publishedAt: new Date().toISOString(),
    data: {},
  };

  const mockUser = {
    id: "user_123",
    name: "Test User",
    email: "test@example.com",
  };

  const mockRole = "admin";

  return (
    <>
      <Head>
        <title>{mockDocument.title}</title>
      </Head>

      <main className="min-h-screen p-6 bg-neutral-950 text-white">
        <Dashboard
          document={mockDocument}
          role={mockRole}
          user={mockUser}
          isEditing={false}
          publish={() => Promise.resolve()}
          publishing={false}
        />
      </main>
    </>
  );
}
