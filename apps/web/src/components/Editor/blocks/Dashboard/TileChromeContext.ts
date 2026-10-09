import { createContext, useContext } from "react";
import type { DashboardChrome } from "@sandworm/editor";

// Tells a block drawn inside a dashboard tile how its tile is styled, without
// passing the setting through every block component on the way down. A plain
// tile has no card behind it, so the block's output must not paint one either.
export const TileChromeContext = createContext<DashboardChrome>("card");

export const useTileChrome = () => useContext(TileChromeContext);
