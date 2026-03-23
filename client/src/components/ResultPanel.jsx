/**
 * ResultPanel – renders agent results intelligently based on mode.
 */

function VerdictBadge({ verdict }) {
  const map = {
    GO: "bg-scout-go/20 text-scout-go border-scout-go/40",
    "NO-GO": "bg-scout-nogo/20 text-scout-nogo border-scout-nogo/40",
    PIVOT: "bg-scout-pivot/20 text-scout-pivot border-scout-pivot/40",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full border text-sm font-bold tracking-wide ${
        map[verdict] || "bg-scout-border/30 text-scout-text border-scout-border"
      }`}
    >
      {verdict}
    </span>
  );
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 70 ? "bg-scout-go" : pct >= 40 ? "bg-scout-pivot" : "bg-scout-nogo";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-scout-border rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-scout-muted w-8 text-right">{pct}%</span>
    </div>
  );
}

function OpportunityCard({ opp, onSelect }) {
  return (
    <div className="bg-scout-surface border border-scout-border rounded-xl p-4 flex flex-col gap-2 hover:border-scout-accent/50 transition-all">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-scout-text">{opp.title}</h3>
        <span className="text-xs text-scout-muted whitespace-nowrap">
          {Math.round((opp.confidence || 0) * 100)}% conf
        </span>
      </div>
      <p className="text-sm text-scout-muted">{opp.problem}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-scout-border/50 px-2 py-0.5 rounded-full">
          👤 {opp.target_user}
        </span>
        <span className="bg-scout-border/50 px-2 py-0.5 rounded-full">
          📡 {opp.signal_source}
        </span>
      </div>
      {onSelect && (
        <button
          onClick={() => onSelect(opp)}
          className="mt-1 self-start text-xs px-3 py-1.5 rounded-lg bg-scout-accent/20 text-scout-accent hover:bg-scout-accent/30 border border-scout-accent/30 transition-all"
        >
          Validate this →
        </button>
      )}
    </div>
  );
}

function ValidationResult({ data }) {
  const checks = data.reasons || {};
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <VerdictBadge verdict={data.verdict} />
        <div className="flex-1">
          <ConfidenceBar value={data.confidence} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(checks).map(([key, val]) => (
          <div
            key={key}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              val.passed
                ? "border-scout-go/30 bg-scout-go/5"
                : "border-scout-nogo/30 bg-scout-nogo/5"
            }`}
          >
            <span className="mt-0.5 text-sm">{val.passed ? "✅" : "❌"}</span>
            <div>
              <span className="text-xs font-mono font-semibold text-scout-muted uppercase">
                {key.replace(/_/g, " ")}
              </span>
              <p className="text-sm text-scout-text mt-0.5">{val.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefSection({ label, content }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-semibold text-scout-accent uppercase tracking-widest">
        {label}
      </h4>
      <p className="text-sm text-scout-text leading-relaxed">{content}</p>
    </div>
  );
}

function GodModeBrief({ brief }) {
  const sections = [
    { key: "problem", label: "Problem" },
    { key: "competitor_analysis", label: "Competitor Analysis" },
    { key: "buyer_psychology", label: "Buyer Psychology" },
    { key: "mvp_plan", label: "MVP Plan" },
    { key: "monetization", label: "Monetization" },
    { key: "risks", label: "Risks" },
  ];
  return (
    <div className="flex flex-col gap-5">
      {sections.map(({ key, label }) =>
        brief[key] ? (
          <BriefSection key={key} label={label} content={brief[key]} />
        ) : null
      )}
    </div>
  );
}

export default function ResultPanel({ mode, result, onSelectOpportunity }) {
  if (!result) return null;

  const isError = !!result.error;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-scout-muted uppercase tracking-wider">
          Results
        </h2>
        <span className="text-xs text-scout-muted">
          {new Date().toLocaleTimeString()}
        </span>
      </div>

      {isError ? (
        <div className="bg-scout-nogo/10 border border-scout-nogo/30 rounded-xl p-4">
          <p className="text-scout-nogo font-semibold text-sm">Error</p>
          <p className="text-scout-text text-sm mt-1">{result.error}</p>
        </div>
      ) : mode === "scout-lite" && result.opportunities ? (
        <div className="grid grid-cols-1 gap-3">
          {result.opportunities.map((opp, i) => (
            <OpportunityCard
              key={i}
              opp={opp}
              onSelect={onSelectOpportunity}
            />
          ))}
        </div>
      ) : mode === "validate" ? (
        <div className="bg-scout-surface border border-scout-border rounded-xl p-4">
          <ValidationResult data={result} />
        </div>
      ) : mode === "god-mode" && result.brief ? (
        <div className="bg-scout-surface border border-scout-border rounded-xl p-4">
          <GodModeBrief brief={result.brief} />
        </div>
      ) : (
        // Fallback: raw JSON
        <pre className="bg-scout-surface border border-scout-border rounded-xl p-4 text-xs text-scout-text overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
