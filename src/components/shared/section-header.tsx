interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
