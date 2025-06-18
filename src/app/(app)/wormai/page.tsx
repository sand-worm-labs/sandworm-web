import { LandingTextarea } from "@/components/Ai/landing-textarea";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col size-full shrink-0 relative overflow-hidden">
      <main className="flex-1 size-full overflow-hidden flex flex-col justify-center items-center ">
        <div className="flex-1 size-full overflow-hidden flex flex-col justify-center items-center gap-8 px-4 md:px-0">
          <h1 className="text-3xl xl:text-4xl font-semibold text-center tracking-tighter text-pretty">
            Ask the Blockchain
          </h1>
          <div className="max-w-xl mx-auto w-full dark">
            <Suspense fallback={null}>
              <LandingTextarea />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
