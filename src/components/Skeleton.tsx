export function CardSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 animate-pulse">
      <div className="h-12 w-12 rounded-2xl bg-foreground/10 mb-4" />
      <div className="h-6 w-3/4 rounded-lg bg-foreground/10 mb-3" />
      <div className="h-4 w-full rounded bg-foreground/10 mb-2" />
      <div className="h-4 w-5/6 rounded bg-foreground/10" />
    </div>
  );
}
