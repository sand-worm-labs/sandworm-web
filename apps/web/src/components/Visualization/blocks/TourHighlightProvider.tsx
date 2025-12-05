import React, { createContext, useContext, useState, useMemo } from "react";
import type { ReactNode } from "react";

// eslint-disable-next-line import/no-cycle
import TourHighlight from "./TourHighlight";

interface TourHighlightContextType {
  selector: string | null;
  setSelector: (selector: string | null) => void;
  isTourActive: boolean;
  setTourActive: (active: boolean) => void;
}

const TourHighlightContext = createContext<
  TourHighlightContextType | undefined
>(undefined);

export const TourHighlightProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selector, setSelector] = useState<string | null>(null);
  const [isTourActive, setTourActive] = useState(false);

  const contextValue = useMemo(
    () => ({ selector, setSelector, isTourActive, setTourActive }),
    [selector, isTourActive] // only recreate when these change
  );

  return (
    <TourHighlightContext.Provider value={contextValue}>
      <TourHighlight />
      {children}
    </TourHighlightContext.Provider>
  );
};

export const useTourHighlight = (): [
  { selector: string | null; isTourActive: boolean },
  {
    setSelector: (selector: string | null) => void;
    setTourActive: (active: boolean) => void;
  },
] => {
  const context = useContext(TourHighlightContext);
  if (!context) {
    console.warn(
      "useTourHighlight must be used within a TourHighlightProvider"
    );
    return [
      { selector: null, isTourActive: false },
      { setSelector: () => {}, setTourActive: () => {} },
    ];
  }
  return [
    { selector: context.selector, isTourActive: context.isTourActive },
    { setSelector: context.setSelector, setTourActive: context.setTourActive },
  ];
};
