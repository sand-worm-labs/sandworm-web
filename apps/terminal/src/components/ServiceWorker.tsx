"use client";

import { useEffect } from "react";

// Registers the offline worker in public/sw.js. Off in dev, where a cached page
// would hide the change you just made.
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
