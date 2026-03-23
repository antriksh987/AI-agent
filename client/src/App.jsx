import { useState } from "react";
import ModeSelector from "./components/ModeSelector";
import ResultPanel from "./components/ResultPanel";
import LoadingSpinner from "./components/LoadingSpinner";

const DEFAULT_MODEL_LABELS = {
  "scout-lite": "Ollama / Qwen",
  validate: "Claude Sonnet",
  "god-mode": "Claude Opus",
};

const LOADING_MESSAGES = {
  "scout-lite": "Scanning opportunities with Scout Lite…",
  validate: "Running 5 validation checks with Claude Sonnet…",
  "god-mode": "Generating deep brief with Claude Opus…",
};

const DEFAULT_QUERIES = {
  "scout-lite": "find opportunities in AI for SMB India",
  validate: "",
  "god-mode": "",
};

export default function App() {
  const [mode, setMode] = useState("scout-lite");
  const [query, setQuery] = useState(DEFAULT_QUERIES["scout-lite"]);
  const [ideaJson, setIdeaJson] = useState("");
  const [modelOverride, setModelOverride] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleModeChange(newMode) {
    setMode(newMode);
    setResult(null);
    if (newMode === "scout-lite") {
      setQuery(DEFAULT_QUERIES["scout-lite"]);
    }
  }

  function handleSelectOpportunity(opp) {
    setMode("validate");
    setIdeaJson(JSON.stringify(opp, null, 2));
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let body;
      let endpoint;

      if (mode === "scout-lite") {
        endpoint = "/api/scout-lite";
        body = { query: query.trim() };
      } else {
        let ideaObj;
        try {
          ideaObj = JSON.parse(ideaJson);
        } catch {
          setResult({ error: "Invalid JSON in the idea field." });
          setLoading(false);
          return;
        }
        endpoint = mode === "validate" ? "/api/validate" : "/api/god-mode";
        body = { idea: ideaObj };
      }

      if (modelOverride.trim()) {
        body.model = modelOverride.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !loading &&
    (mode === "scout-lite" ? query.trim().length > 0 : ideaJson.trim().length > 0);

  return (
    <div className="min-h-screen bg-scout-bg text-scout-text">
      {/* Header */}
      <header className="border-b border-scout-border bg-scout-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔭</span>
            <div>
              <h1 className="text-sm font-bold text-scout-text">Scout v4.0</h1>
              <p className="text-xs text-scout-muted">AI Opportunity Engine</p>
            </div>
          </div>
          <span className="text-xs text-scout-muted bg-scout-border/50 px-2 py-1 rounded-full">
            {DEFAULT_MODEL_LABELS[mode]}
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Mode Selector */}
        <ModeSelector value={mode} onChange={handleModeChange} />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "scout-lite" ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-scout-muted uppercase tracking-wider">
                Discovery Query
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. find opportunities in AI for SMB India"
                rows={3}
                className="bg-scout-surface border border-scout-border rounded-xl px-4 py-3 text-scout-text placeholder-scout-muted/50 resize-none focus:outline-none focus:border-scout-accent/70 transition-colors text-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-scout-muted uppercase tracking-wider">
                {mode === "validate" ? "Idea to Validate (JSON)" : "Validated Idea (JSON)"}
              </label>
              <textarea
                value={ideaJson}
                onChange={(e) => setIdeaJson(e.target.value)}
                placeholder='{"title":"…","problem":"…","target_user":"…","signal_source":"…","confidence":0.8}'
                rows={6}
                className="bg-scout-surface border border-scout-border rounded-xl px-4 py-3 text-scout-text placeholder-scout-muted/50 resize-none focus:outline-none focus:border-scout-accent/70 transition-colors text-sm font-mono"
              />
              <p className="text-xs text-scout-muted">
                💡 Tip: Run Scout Lite first, then click &quot;Validate this →&quot; on any result to auto-fill this field.
              </p>
            </div>
          )}

          {/* Advanced options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs text-scout-muted hover:text-scout-accent transition-colors"
            >
              {showAdvanced ? "▼" : "▶"} Advanced options
            </button>
            {showAdvanced && (
              <div className="mt-2 flex flex-col gap-2">
                <label className="text-xs text-scout-muted">
                  Model Override (leave blank for default)
                </label>
                <input
                  type="text"
                  value={modelOverride}
                  onChange={(e) => setModelOverride(e.target.value)}
                  placeholder={
                    mode === "scout-lite"
                      ? "e.g. qwen3:4b"
                      : "e.g. claude-4-6-free"
                  }
                  className="bg-scout-surface border border-scout-border rounded-lg px-3 py-2 text-scout-text placeholder-scout-muted/50 focus:outline-none focus:border-scout-accent/70 transition-colors text-xs font-mono"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-scout-accent hover:bg-scout-accentHover disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white"
          >
            {loading
              ? "Running…"
              : mode === "scout-lite"
              ? "🔭 Discover Opportunities"
              : mode === "validate"
              ? "✅ Validate Idea"
              : "⚡ Run God Mode"}
          </button>
        </form>

        {/* Loading */}
        {loading && <LoadingSpinner message={LOADING_MESSAGES[mode]} />}

        {/* Results */}
        {!loading && result && (
          <ResultPanel
            mode={mode}
            result={result}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-scout-border mt-8 py-4">
        <p className="text-center text-xs text-scout-muted">
          Scout v4.0 · Multi-Agent AI Research Engine
        </p>
      </footer>
    </div>
  );
}
