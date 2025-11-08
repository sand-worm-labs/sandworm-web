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
    appClock: 456,
    userAppClock: {
      "4a6e71c4-2c06-460b-bb29-f337bf64e0bc": 789,
    },
  };

  const mockUser = {
    createdAt: "2025-10-21T14:03:41.471Z",
    email: "dqzxu2gbs@mozmail.com",
    id: "4a6e71c4-2c06-460b-bb29-f337bf64e0bc",
    lastVisitedWorkspaceId: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
    name: "Si Cy",
    picture: null,
    roles: {
      "4a6e71c4-2c06-460b-bb29-f337bf64e0bc": "admin",
    },
    updatedAt: "2025-11-07T21:32:32.536Z",
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
