import React from "react";
import Image from "next/image";

import type { DataSourceType } from "@/types";

// =====================================
// ⬢ DataSourceIcon
// =====================================
// duckdb.jpg / dune.png are each source's official GitHub org avatar,
// fetched via the GitHub API (avatar_url for orgs "duckdb" / "duneanalytics")
// rather than guessed — see apps/web/public/icons/. sandworm.png is our own
// mark, already shipped with the app.

const ICON_SRC: Record<DataSourceType, string> = {
  duckdb: "/icons/duckdb.jpg",
  dune: "/icons/dune.png",
  sandwormcloud: "/icons/sandworm.png",
};

interface Props {
  type: DataSourceType;
  size?: number;
  className?: string;
}

export function DataSourceIcon({ type, size = 14, className }: Props) {
  const src = ICON_SRC[type];
  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`rounded-full object-cover ${className ?? ""}`}
    />
  );
}
