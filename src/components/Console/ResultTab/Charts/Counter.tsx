interface CounterCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description?: string;
  decimals?: number;
}

export const CounterCard = ({
  title,
  value,
  prefix = "",
  suffix = "",
  description,
  decimals = 0,
}: CounterCardProps) => {
  return (
    <div className="counter-card relative bg-[#0d0d0d] border border-[#194390] rounded-md px-6 py-5 text-white w-full max-w-sm shadow-sm transition-shadow duration-200 hover:shadow-orange-500/10 ">
      <h3 className="text-xs uppercase tracking-widest text-white/70 mb-1">
        {title}
      </h3>

      <div className="text-3xl font-bold tracking-tight text-white">
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </div>

      {description && (
        <p className="text-xs text-white/50 mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
