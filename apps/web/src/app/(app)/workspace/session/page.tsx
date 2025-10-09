"use client";

import React from "react";

export default function SessionPage() {
  return (
    <main className=" flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Session</h1>
      <p className="text-gray-500 text-center max-w-md">
        This is where your session history will live. For now, consider this a
        placeholder until the design is ready
      </p>

      <div className="mt-8 p-6 border rounded-xl shadow-sm bg-white">
        <p className="text-gray-600">📝 Dummy activity log item</p>
      </div>
    </main>
  );
}
