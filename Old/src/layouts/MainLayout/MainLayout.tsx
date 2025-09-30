import type { ChildrenProps } from "@/types";

export default function MainLayout({ children }: ChildrenProps) {
  return (
    <div className="overflow-x-hidden h-full flex flex-col dark:bg-var(--background) text-black dark:text-white">
      {children}
    </div>
  );
}
