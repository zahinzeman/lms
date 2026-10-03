export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-ink-muted">Loading Bootcamp BD...</span>
      </div>
    </div>
  );
}
