export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-6">
      <div className="h-8 w-40 animate-pulse rounded bg-edge/50" />
      <div className="mt-5 flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-[var(--radius-card)] border border-edge bg-card/50"
          />
        ))}
      </div>
    </main>
  );
}
