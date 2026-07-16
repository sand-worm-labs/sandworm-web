"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";

// =====================================
// ⬢ Constants
// =====================================
export const MIN_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const DEFAULT_SIDEBAR_WIDTH = 320;
export const DEFAULT_SMALL_SCREEN_WIDTH = 300;

const SMALL_SCREEN_BREAKPOINT = 768;
const WIDTH_STORAGE_KEY = "sidebar-width";
const OPEN_STORAGE_KEY = "sidebar-open";

// =====================================
// ⬢ Types
// =====================================
type SideBarWidth = number;

type SideBarState = {
  isOpen: boolean;
  width: SideBarWidth;
  rightPanelId: string | null;
  rightPanelMeta: Record<string, string> | null;
};

type SideBarAPI = {
  toggle: (open?: boolean) => void;
  resize: (width: SideBarWidth) => void;
  open: (value?: boolean) => void;
  close: () => void;
  openRightPanel: (id: string, meta?: Record<string, string>) => void;
  closeRightPanel: () => void;
};

type SideBarContext = {
  state: SideBarState;
  api: SideBarAPI;
};

// =====================================
// ⬢ Context
// =====================================
const initialContext: SideBarContext = {
  state: {
    isOpen: false,
    width: DEFAULT_SIDEBAR_WIDTH,
    rightPanelId: null,
    rightPanelMeta: null,
  },
  api: {
    toggle: () => {},
    resize: () => {},
    open: () => {},
    close: () => {},
    openRightPanel: () => {},
    closeRightPanel: () => {},
  },
};

const Context = createContext<SideBarContext>(initialContext);

// =====================================
// ⬢ Hook
// =====================================
export default function useSideBar(): SideBarContext {
  return useContext(Context);
}

// =====================================
// ⬢ Utils
// =====================================
function getInitialWidth(): SideBarWidth {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;

  const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
  if (isSmallScreen) return DEFAULT_SMALL_SCREEN_WIDTH;

  const stored = localStorage.getItem(WIDTH_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (
      !Number.isNaN(parsed) &&
      parsed >= MIN_SIDEBAR_WIDTH &&
      parsed <= MAX_SIDEBAR_WIDTH
    ) {
      return parsed;
    }
  }

  return DEFAULT_SIDEBAR_WIDTH;
}

function getInitialOpen(): boolean {
  if (typeof window === "undefined") return false;

  if (window.location.pathname.includes("/documents/")) return false;

  if (
    new URLSearchParams(window.location.search).get("sidebarCollapsed") ===
    "true"
  ) {
    return false;
  }

  const stored = localStorage.getItem(OPEN_STORAGE_KEY);
  if (stored !== null) return stored === "true";

  return false;
}

// =====================================
// ⬢ Provider
// =====================================
export function SideBarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(getInitialOpen);
  const [width, setWidth] = useState<SideBarWidth>(getInitialWidth);
  const [rightPanelId, setRightPanelId] = useState<string | null>(null);
  const [rightPanelMeta, setRightPanelMeta] = useState<Record<
    string,
    string
  > | null>(null);

  useEffect(() => {
    localStorage.setItem(WIDTH_STORAGE_KEY, width.toString());
  }, [width]);

  useEffect(() => {
    localStorage.setItem(OPEN_STORAGE_KEY, String(isOpen));
  }, [isOpen]);

  // 🔁 Clamp width on viewport resize
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
      if (isSmallScreen && width > DEFAULT_SMALL_SCREEN_WIDTH) {
        setWidth(DEFAULT_SMALL_SCREEN_WIDTH);
      } else if (width < MIN_SIDEBAR_WIDTH) {
        setWidth(MIN_SIDEBAR_WIDTH);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  // ⬢ Derived state
  const sidebarState: SideBarState = useMemo(
    () => ({ isOpen, width, rightPanelId, rightPanelMeta }),
    [isOpen, width, rightPanelId, rightPanelMeta]
  );

  const api: SideBarAPI = useMemo(
    () => ({
      toggle: (open?: boolean) => {
        setIsOpen(open !== undefined ? open : prev => !prev);
      },
      resize: (newWidth: SideBarWidth) => {
        setWidth(
          Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth))
        );
      },
      open: (value?: boolean) => {
        setIsOpen(value !== undefined ? value : true);
      },
      close: () => {
        setIsOpen(false);
      },
      openRightPanel: (id: string, meta?: Record<string, string>) => {
        // ⌐ Mutual exclusion with the left sidebar is enforced where the
        // notebook panel's active state actually lives (PrivateDocumentPage),
        // so every panel type collapses the sidebar consistently, not just
        // the ones routed through this generic API.
        setRightPanelId(id);
        setRightPanelMeta(meta ?? null);
      },
      closeRightPanel: () => {
        setRightPanelId(null);
        setRightPanelMeta(null);
      },
    }),
    []
  );

  const value = useMemo(
    () => ({ state: sidebarState, api }),
    [sidebarState, api]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
