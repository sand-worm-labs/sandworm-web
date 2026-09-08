import clsx from "clsx";

import { publicWidthClasses } from "./constants";
import { ContentSkeleton, TitleSkeleton } from "./ContentSkeleton";

export function PublicSkeleton() {
  return (
    <div className="w-full flex justify-center">
      <div className={clsx(publicWidthClasses, "py-20")}>
        <TitleSkeleton visible />
        <ContentSkeleton visible />
      </div>
    </div>
  );
}
