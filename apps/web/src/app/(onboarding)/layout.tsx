import Image from "next/image";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh relative overflow-hidden">
      <div className="grid grid-cols-2 h-full">
        {children}

        <div className="relative h-full w-full p-4">
          <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
            <Image
              alt="banner image"
              src="/img/sample.png"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white roobert drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                <p className="text-2xl md:text-3xl font-semibold">
                  Deep and Insightful Onchain data
                </p>
                <p className="text-xl md:text-2xl">for teams and enterprise</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
