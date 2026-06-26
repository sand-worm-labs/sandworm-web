import type React from "react";

interface BlockTypePillProps {
  label: string;
  icon: React.ReactNode;
}

export function BlockTypePill({ label, icon }: BlockTypePillProps) {
  return (
    <div
      className="flex items-center gap-x-1.5 px-2 py-1 rounded-md text-xs font-normal font-body select-none"
      style={{ backgroundColor: "#F7E8FF", color: "#A308F0" }}
    >
      <span className="flex items-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
