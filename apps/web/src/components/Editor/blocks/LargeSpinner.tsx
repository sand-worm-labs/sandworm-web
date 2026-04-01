type LargeSpinnerProps = {
  color?: string;
};

export function LargeSpinner({ color }: LargeSpinnerProps) {
  return <div className="bar-loader" style={{ backgroundColor: color }} />;
}

export default LargeSpinner;
