import type { ChildrenProps } from "@/types";

export default function MainLayout({ children }: ChildrenProps) {
  return (
    <div className="overflow-x-hidden h-full flex flex-col bg-var(--background)">
      {children}
    </div>
  );
}
