"use client";

import { useEffect, useState } from "react";
import { CloseIconButton } from "@/components/CloseIconButton";

interface BannerAlertProps {
  id: string;
  message: string;
  alwaysShow?: boolean;
}

// =====================================
// ⬢ Banner Alert
// =====================================
export const BannerAlert: React.FC<BannerAlertProps> = ({
  id,
  message,
  alwaysShow = false,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!alwaysShow) {
      const dismissed = sessionStorage.getItem(`dismissed-alert-${id}`);
      if (dismissed === "true") {
        setVisible(false);
      }
    }
  }, [id, alwaysShow]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(`dismissed-alert-${id}`, "true");
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-yellow-900 text-yellow-200 px-4 py-1.5 flex items-center justify-between text-sm border-b border-yellow-800  shadow-md">
      <p className="text-sm font-medium ">{message}</p>
      <CloseIconButton
        size="sm"
        onClick={handleClose}
        aria-label="Dismiss alert"
        className="ml-4 text-yellow-200 hover:text-yellow-100 hover:bg-yellow-800/40 dark:hover:bg-yellow-800/40"
      />
    </div>
  );
};
