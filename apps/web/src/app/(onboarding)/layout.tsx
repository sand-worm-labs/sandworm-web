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
            <span className="uppercase font-tertiary  font-bold ">
              Sandworm
            </span>
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
    <div className="h-dvh relative overflow-hidden bg-white dark:bg-[#141412]">
      <div className="grid md:grid-cols-2 h-full">
        {children}

        <div className="relative hidden h-full w-full md:block">
          <div className="relative h-full w-full min-h-[100dvh] overflow-hidden shadow-lg">
            <Image
              alt=""
              src="/img/abstract.png"
              fill
              priority
              sizes="50vw"
              className="object-cover"
              aria-hidden="true"
            />

            <video
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/img/abstract.png"
              aria-hidden="true"
            >
              <source src="/videos/aurora.webm" type="video/webm" />
              <source src="/videos/aurora.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-x-0 bottom-[2rem] z-10 flex flex-col items-center">
              <SandwormLogo width="50" height="50" />
              <h2 className="mt-3 mb-1 text-center font-body text-3xl font-medium text-white">
                {content.title}
              </h2>
              <div className="mt-2 text-center font-body text-[#B4CACE]">
                <p className="text-lg font-medium md:text-base">
                  {content.subtitle}
                </p>
                <p className="mt-0.5 text-lg font-medium md:text-base">
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
