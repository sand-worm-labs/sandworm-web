"use client";

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  subtitle,
  center,
}) => {
  return (
    <div className={center ? "text-center" : "text-start"}>
      <div className="text-[26px] font-medium text-ink-100">{title}</div>
      <div className="text-base max-w-[28rem] text-ink-500 mt-2">
        {subtitle}
      </div>
    </div>
  );
};
