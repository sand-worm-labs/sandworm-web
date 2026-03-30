"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCreateWorkspaceMutation } from "@/generated/graphql";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
  });

  const [createWorkspace, { loading }] = useCreateWorkspaceMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) return;

    try {
      const result = await createWorkspace({
        variables: {
          name: trimmedName,
        },
      });

      if (result.data?.createWorkspace) {
        router.push(`/workspace/${result.data.createWorkspace.id}`);
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-base-100 flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-[31rem] transform overflow-hidden rounded-3xl bg-white dark:bg-base-400 transition-all border border-[#DEE2E6] dark:border-border-tertiary ">
        <div className="flex items-center justify-between px-6 py-6 border-b border-border-secondary">
          <h1 className="text-xl font-semibold text-ink-100 dark:text-white">
            Create New Team
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label
              htmlFor="team-name"
              className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-2"
            >
              Team Name <span className="text-error">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              required
              placeholder="e.g., Defi Team"
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#262626] border border-[#DEE2E6] dark:border-[#363636] text-ink-100 dark:text-white placeholder:text-[#6C757D] dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-[#A308F0] focus:border-transparent transition-all text-sm font-medium"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <ul className="space-y-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                Workspace name should be less than 40 characters
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gray-400" />
                Cannot contain punctuation/special marks
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="w-full py-4 px-4 bg-[#A308F0] hover:bg-[#8a07c9] disabled:bg-[#868E96] text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Team...
                </>
              ) : (
                "Create Team"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
