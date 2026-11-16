import type { IconType } from "react-icons";
import {
  PiArrowsLeftRight,
  PiBank,
  PiChartLineUp,
  PiCurrencyCircleDollar,
  PiGlobeHemisphereWest,
  PiShareNetwork,
  PiSquaresFour,
  PiWallet,
} from "react-icons/pi";

// The terminal's own icons for a sector, by the key the team picks. Sectors have
// no brand, so this small set is all there is to choose from.
export const SECTOR_SYMBOLS: Record<string, IconType> = {
  "cash-out": PiArrowsLeftRight,
  payments: PiCurrencyCircleDollar,
  wallets: PiWallet,
  lending: PiBank,
  trading: PiChartLineUp,
  bridges: PiShareNetwork,
};

export const DEFAULT_SECTOR_SYMBOL = PiSquaresFour;
// A region with no flag: more than one country
export const REGION_SYMBOL = PiGlobeHemisphereWest;
