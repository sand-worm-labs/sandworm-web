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
            <div className="absolute inset-0 flex flex-col top-[30%]">
              <div className="text-center text-white font-primary ">
                <p className="text-3xl md:text-[1.95rem] font-normal">
                  Deep and Insightful Onchain data
                </p>
                <p className="text-3xl md:text-[1.95rem] font-normal mt-1">
                  for teams and enterprise
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
