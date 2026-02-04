"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { SandwormLogo } from "@/components/Assets";

const getWelcomeContent = (pathname: string) => {
  switch (pathname) {
    case "/signup":
    case "/confirm-email":
    case "/check-mail":
      return {
        title: (
          <>
            Welcome to{" "}
            <span className="uppercase font-tertiary  font-bold ">Sandworm</span>
          </>
        ),
        subtitle: "Deep and Insightful Onchain data for",
      };
    case "/signin":
    case "/forgot-password":
    case "/reset-password":
    default:
      return {
        title: "Welcome back",
        subtitle: "Deep and Insightful Onchain data for",
      };
  }
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const content = getWelcomeContent(pathname);

  return (
    <div className="h-dvh relative overflow-hidden bg-white">
      <div className="grid md:grid-cols-2 h-full">
        {children}

        <div className="relative h-full w-full hidden md:block">
          <div className="relative h-full w-full rounded-none overflow-hidden shadow-lg">
            <div className="relative h-full w-full min-h-[100dvh]">
              <Image
                alt="banner image"
                src="/img/abstract.png"
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center flex-col bottom-[-76%]">
              <SandwormLogo width="50" height="50" />
              <h2 className="text-3xl font-medium text-center text-white mb-1 mt-3 font-body">
                {content.title}
              </h2>
              <div className="text-center text-[#B4CACE] font-body mt-2">
                <p className="text-lg md:text-base font-medium">
                  {content.subtitle}
                </p>
                <p className="text-lg md:text-base font-medium mt-0.5">
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
