"use client";

import dynamic from "next/dynamic";
import Head from "next/head";

const Dashboard = dynamic(
  () => import("@/components/Visualization/blocks/Dashboard"),
  {
    ssr: false,
  }
);

export default function DashboardEditPage() {
  const mockDocument = {
    id: "mock-doc-id",
    appId: "",
    title: "Test Dashboard",
    clock: 0,
    appClock: 456,
    userAppClock: {
      "4a6e71c4-2c06-460b-bb29-f337bf64e0bc": 789,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    hasDashboard: true,
    icon: "DocumentIcon",
    orderIndex: 0,
    version: 2,
    isSyncedWithYjs: false,
    runSQLSelection: true,
    runUnexecutedBlocks: false,
    shareLinksWithoutSidebar: true,
    parentId: "mock-parent-id",
    workspaceId: "mock-workspace-id",
    yjsAppDocuments: [
      {
        userYjsAppDocuments: [
          {
            userId: "4a6e71c4-2c06-460b-bb29-f337bf64e0bc",
            clock: 789,
          },
        ],
      },
    ],
    yjsDocument: {
      clock: 0,
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

      <main className="min-h-screen dark:bg-neutral-950 dark:text-white">
        <Dashboard
          document={mockDocument}
          role={mockRole}
          user={mockUser}
          isEditing={true}
          publish={() => Promise.resolve()}
          publishing={false}
        />
      </main>
    </>
  );
}
