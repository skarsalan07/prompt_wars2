export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
        {eyebrow}
      </p>
      <div className="space-y-1">
        <h2 className="font-serif text-2xl leading-tight text-[var(--ink)] md:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
