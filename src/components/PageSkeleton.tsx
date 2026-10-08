export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
      <div className="h-5 w-40 rounded-full bg-surface" />
      <div className="mt-4 h-12 w-2/3 rounded-2xl bg-surface" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-[1.75rem] bg-surface" />
        ))}
      </div>
    </div>
  );
}
