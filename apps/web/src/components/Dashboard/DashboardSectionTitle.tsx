interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-white tracking-tight">
        {title}
      </h2>

      {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
    </div>
  );
};
