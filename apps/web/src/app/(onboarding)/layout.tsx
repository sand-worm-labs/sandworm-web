import Image from "next/image";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen ">
      <div className="grid grid-cols-2">
        {children}
        <div className="py-4">
          <Image
            alt=" banner image"
            src="/img/sample.png"
            width="678"
            height="779"
          />
        </div>
      </div>
    </div>
  );
}
