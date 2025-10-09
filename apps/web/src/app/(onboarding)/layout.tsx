import Image from "next/image";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen relative">
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
          </div>
        </div>
      </div>
    </div>
  );
}
