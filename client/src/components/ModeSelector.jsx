/**
 * ModeSelector – dropdown to choose Scout Lite / Validate / God Mode
 */
export default function ModeSelector({ value, onChange }) {
  const modes = [
    {
      id: "scout-lite",
      label: "🔭 Scout Lite",
      description: "Discover 3–5 opportunities (Ollama/Qwen)",
    },
    {
      id: "validate",
      label: "✅ Validate",
      description: "Run 5 validation checks (Claude Sonnet)",
    },
    {
      id: "god-mode",
      label: "⚡ God Mode",
      description: "Full opportunity brief (Claude Opus)",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-scout-muted uppercase tracking-wider">
        Agent Mode
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex flex-col items-start p-3 rounded-lg border transition-all text-left ${
              value === m.id
                ? "border-scout-accent bg-scout-accent/10 text-scout-text"
                : "border-scout-border bg-scout-surface text-scout-muted hover:border-scout-accent/50"
            }`}
          >
            <span className="font-semibold text-sm">{m.label}</span>
            <span className="text-xs mt-1 opacity-70">{m.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
