import { createContext, useContext, useState, useEffect, useMemo } from "react";

// =====================================
// ⬢ Constants
// =====================================
export const MIN_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const DEFAULT_SIDEBAR_WIDTH = 320;
export const DEFAULT_SMALL_SCREEN_WIDTH = 300;

const SMALL_SCREEN_BREAKPOINT = 768;
const STORAGE_KEY = "sidebar-width";

// =====================================
// ⬢ Types
// =====================================
type SideBarWidth = number;

type SideBarState = {
  isOpen: boolean;
  width: SideBarWidth;
};

type SideBarAPI = {
  toggle: (open?: boolean) => void;
  resize: (width: SideBarWidth) => void;
  open: (value?: boolean) => void;
  close: () => void;
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
    isOpen: true,
    width: DEFAULT_SIDEBAR_WIDTH,
  },
  api: {
    toggle: () => {},
    resize: () => {},
    open: () => {},
    close: () => {},
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
  const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
  if (isSmallScreen) {
    return DEFAULT_SMALL_SCREEN_WIDTH;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
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
  return (
    new URLSearchParams(window.location.search).get("sidebarCollapsed") !==
    "true"
  );
}

// =====================================
// ⬢ Provider
// =====================================
export function SideBarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(getInitialOpen);
  const [width, setWidth] = useState<SideBarWidth>(getInitialWidth);

  // 🔁 Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, width.toString());
  }, [width]);

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

  // ⬢ derived
  const sidebarState: SideBarState = useMemo(
    () => ({ isOpen, width }),
    [isOpen, width]
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
    }),
    []
  );

  const value = useMemo(
    () => ({ state: sidebarState, api }),
    [sidebarState, api]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
