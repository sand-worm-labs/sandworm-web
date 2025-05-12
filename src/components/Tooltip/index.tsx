import React, { useState, useRef } from "react";

interface TooltipProps {
  label: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ label, children }) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 300); // Delay to mimic sticky behavior
  };

  return (
    <div
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={tooltipId}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Escape") {
          setVisible(false);
        }
      }}
      style={{ position: "relative", display: "inline-block" }}
    >
      {React.cloneElement(children, { "aria-describedby": tooltipId })}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            padding: "8px",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "4px",
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
