import type { ChildrenProps } from "@/types";

export default function MainLayout({ children }: ChildrenProps) {
  return (
    <div className="overflow-x-hidden  min-h-screen relative  h-full w-full flex flex-1 flex-col bg-black ">
      {children}
    </div>
  );
}
