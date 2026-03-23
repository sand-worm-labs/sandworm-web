import RotateLoader from "react-spinners/RotateLoader";
import type { CSSProperties } from "react";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
};

type LargeSpinnerProps = {
  color?: string;
};

function LargeSpinner({ color }: LargeSpinnerProps) {
  return <div className="bar-loader" />;
}

export default LargeSpinner;
