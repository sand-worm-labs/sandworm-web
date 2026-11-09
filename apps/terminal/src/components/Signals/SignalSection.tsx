import type { ReactNode } from "react";

export function SignalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-ink-400">{title}</h3>
      {children}
    </section>
  );
}
