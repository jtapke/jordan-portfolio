export default function LoadingState() {
  return (
    <div class="space-y-4">
      <p class="font-mono text-xs text-text-secondary uppercase tracking-wider mb-2">Pulling latest updates...</p>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          class="bg-bg-secondary border border-border rounded-sm p-5 animate-pulse"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-2 h-2 rounded-full bg-border" />
            <div class="h-3 w-16 bg-border rounded" />
            <div class="h-3 w-24 bg-border rounded ml-auto" />
          </div>
          <div class="h-5 w-3/4 bg-border rounded mb-2" />
          <div class="h-4 w-full bg-border rounded mb-1" />
          <div class="h-4 w-2/3 bg-border rounded" />
        </div>
      ))}
    </div>
  );
}
