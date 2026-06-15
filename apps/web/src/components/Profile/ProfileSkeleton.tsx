"use client";

import { Shimmer } from "@/components/Skeletons";

// =====================================
// ⬢ Profile Skeleton
// =====================================
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen font-body">
      <div className="mx-auto px-4 md:py-8 py-2 lg:w-[85%]">
        {/* Page title */}
        <Shimmer className="h-5 w-20 mb-6 rounded-md" />

        <div className="space-y-6">
          <div className="flex md:flex-row flex-col gap-x-4">
            {/* ─── LEFT: user info ─── */}
            <div className="rounded-2xl md:p-8 flex-1">
              <div className="flex flex-col gap-6">
                {/* Avatar + action button */}
                <div className="flex gap-x-5">
                  <Shimmer className="w-24 h-24 rounded-full shrink-0" />
                  <div className="flex items-center">
                    <Shimmer className="h-8 w-20 rounded-lg" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {/* Name + username */}
                  <div className="space-y-2">
                    <Shimmer className="h-5 w-44" />
                    <Shimmer className="h-4 w-28" />
                  </div>

                  {/* Status text */}
                  <Shimmer className="h-4 w-56" />

                  {/* Followers / Following / Joined */}
                  <div className="flex gap-4 items-center">
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="h-4 w-32" />
                  </div>

                  {/* Social icons */}
                  <div className="flex gap-3">
                    {["a", "b", "c"].map(k => (
                      <Shimmer key={k} className="h-9 w-9 rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: wallets ─── */}
            <div className="w-full flex-1 py-12 md:py-0">
              <div className="rounded-2xl md:p-6 space-y-3">
                <Shimmer className="h-6 w-32 rounded-lg" />
                {["a", "b"].map(k => (
                  <Shimmer key={k} className="h-14 w-full rounded-xl" />
                ))}
                <Shimmer className="h-12 w-full rounded-xl mt-6" />
              </div>
            </div>
          </div>

          {/* ─── Notebooks grid ─── */}
          <div className="rounded-2xl">
            <Shimmer className="h-5 w-24 mb-4 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => String(i)).map(k => (
                <Shimmer key={k} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
