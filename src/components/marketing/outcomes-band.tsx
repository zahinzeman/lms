export function OutcomesBand() {
  const stats = [
    { value: "28,400+", label: "Enrolled Students", sub: "Across 42+ districts" },
    { value: "৳45M+", label: "Creator Earnings", sub: "Paid bi-weekly in BDT" },
    { value: "94.2%", label: "Completion Rate", sub: "Via gamified accountability" },
    { value: "4.92 / 5", label: "Student Satisfaction", sub: "From 6,200+ verified reviews" },
  ];

  return (
    <section className="py-12 bg-surface-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-accent tracking-tight mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-bold text-ink">{stat.label}</p>
              <p className="text-xs text-ink-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
