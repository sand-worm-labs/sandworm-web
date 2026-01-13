import Image from "next/image";
import { SandwormLogo } from "@/components/Assets";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh relative overflow-hidden">
      <div className="grid grid-cols-2 h-full">
        {children}

        <div className="relative h-full w-full ">
          <div className="relative h-full w-full rounded-none overflow-hidden shadow-lg">
            <Image
              alt="banner image"
              src="/img/abstract.png"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col bottom-[-76%]">
              <SandwormLogo width="50" height="50" />
              <h2 className="text-3xl font-medium text-center text-white mb-1 mt-3 font-primary ">
                Welcome back
              </h2>
              <div className="text-center text-[#B4CACE] font-primary mt-2 ">
                <p className="text-lg md:text-base font-normal">
                  Deep and Insightful Onchain data for
                </p>
                <p className="text-lg md:text-base font-normal mt-0.5">
                  teams and enterprise
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
