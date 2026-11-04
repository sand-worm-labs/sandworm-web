type StepIntroProps = { title: string; description: string };

export function StepIntro({ title, description }: StepIntroProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[26px] font-medium leading-tight text-ink-100">
        {title}
      </h1>
      <p className="text-sm font-medium text-ink-200">{description}</p>
    </div>
  );
}
