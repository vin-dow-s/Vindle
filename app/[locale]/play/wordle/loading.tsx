export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8">
      <div className="h-5 w-16 animate-pulse rounded bg-edge/50" />
      <div className="mt-3 h-7 w-32 animate-pulse rounded bg-edge/50" />
      <div className="mt-3 h-96 animate-pulse rounded-[var(--radius-card)] border border-edge bg-card/50" />
    </main>
  );
}
