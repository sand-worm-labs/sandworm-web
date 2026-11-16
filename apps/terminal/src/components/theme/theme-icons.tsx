type IconProps = { size?: number; className?: string };

const strokeProps = {
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function Sun({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <g {...strokeProps} strokeWidth="1.5">
        <path d="M12 3.75V3" />
        <path d="M12 17.25C14.8995 17.25 17.25 14.8995 17.25 12C17.25 9.10051 14.8995 6.75 12 6.75C9.10051 6.75 6.75 9.10051 6.75 12C6.75 14.8995 9.10051 17.25 12 17.25Z" />
        <path d="M6 6L5.25 5.25" />
        <path d="M6 18L5.25 18.75" />
        <path d="M18 6L18.75 5.25" />
        <path d="M18 18L18.75 18.75" />
        <path d="M3.75 12H3" />
        <path d="M12 20.25V21" />
        <path d="M20.25 12H21" />
      </g>
    </svg>
  );
}

export function Moon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M6.75706 1.75684C6.44273 2.79688 6.41644 3.90271 6.68097 4.95651C6.94551 6.01032 7.49098 6.97262 8.25925 7.74089C9.02752 8.50916 9.98982 9.05463 11.0436 9.31917C12.0974 9.58371 13.2033 9.55741 14.2433 9.24309C13.9418 10.2345 13.3887 11.1308 12.6378 11.8449C11.8869 12.559 10.9639 13.0665 9.9587 13.3179C8.95345 13.5693 7.90023 13.5561 6.9016 13.2796C5.90298 13.003 4.993 12.4726 4.26029 11.7399C3.52758 11.0071 2.99712 10.0972 2.72056 9.09854C2.44401 8.09991 2.4308 7.04669 2.68221 6.04144C2.93363 5.0362 3.4411 4.11319 4.1552 3.36233C4.8693 2.61147 5.76568 2.05835 6.75706 1.75684Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function Desktop({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <g {...strokeProps}>
        <path d="M3 12L13 12C13.5523 12 14 11.5523 14 11L14 4C14 3.44771 13.5523 3 13 3L3 3C2.44771 3 2 3.44771 2 4L2 11C2 11.5523 2.44771 12 3 12Z" />
        <path d="M10 14H6" />
        <path d="M2 9.5H14" />
        <path d="M8 12V14" />
      </g>
    </svg>
  );
}
