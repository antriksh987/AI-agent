/**
 * LoadingSpinner – animated spinner with status message
 */
export default function LoadingSpinner({ message = "Processing…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-scout-border" />
        <div className="absolute inset-0 rounded-full border-2 border-t-scout-accent animate-spin" />
      </div>
      <p className="text-scout-muted text-sm">{message}</p>
    </div>
  );
}
