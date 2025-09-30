"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BannerAlertProps {
  id: string;
  message: string;
  alwaysShow?: boolean;
}

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
      <button
        type="button"
        onClick={handleClose}
        className="ml-4 hover:text-yellow-300 transition"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
