import type { ChildrenProps } from "@/types";

export default function MainLayout({ children }: ChildrenProps) {
  return (
    <div className="overflow-hidden  min-h-screen relative  h-full w-full flex flex-col bg-black ">
      {children}
    </div>
  );
}
