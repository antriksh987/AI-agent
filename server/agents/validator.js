/**
 * Scout v4.0 – Validator (Decision Agent)
 * Uses Claude Sonnet API to run 5 validation checks on a startup idea.
 */

const Anthropic = require("@anthropic-ai/sdk");

const CLAUDE_SONNET_MODEL =
  process.env.CLAUDE_SONNET_MODEL || "claude-4-6-free";

/**
 * Validate a startup idea through 5 checks.
 * @param {object} idea – opportunity object from ScoutLite
 * @param {string} [model] – override Claude model
 * @returns {Promise<object>} { verdict, confidence, reasons }
 */
async function runValidator(idea, model) {
  const client = new Anthropic.default();
  const selectedModel = model || CLAUDE_SONNET_MODEL;

  const systemPrompt = `You are a startup validator. You evaluate ideas through exactly 5 checks:
1. pain_exists – Is there a real, documented pain point?
2. clear_buyer – Is the buyer persona specific and reachable?
3. buildable – Can this be built within 3 months by a small team?
4. competitors_exist – Are there existing solutions (validates the market)?
5. timing_recent – Is there a recent trend or signal supporting this now?

Return ONLY a valid JSON object with this shape:
{
  "verdict": "GO" | "NO-GO" | "PIVOT",
  "confidence": <number 0-1>,
  "reasons": {
    "pain_exists": { "passed": <bool>, "note": "<one sentence>" },
    "clear_buyer": { "passed": <bool>, "note": "<one sentence>" },
    "buildable": { "passed": <bool>, "note": "<one sentence>" },
    "competitors_exist": { "passed": <bool>, "note": "<one sentence>" },
    "timing_recent": { "passed": <bool>, "note": "<one sentence>" }
  }
}
No markdown, no extra text.`;

  const ideaSummary = JSON.stringify(idea, null, 2);
  const userPrompt = `Validate this startup idea:\n${ideaSummary}`;

  console.log(`[Validator] Calling Claude model="${selectedModel}" for idea: ${idea.title || "unknown"}`);

  const message = await client.messages.create({
    model: selectedModel,
    max_tokens: 1024,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const rawContent = message.content?.[0]?.text || "";
  console.log(`[Validator] Raw response length: ${rawContent.length}`);

  return parseJSONObject(rawContent);
}

function parseJSONObject(text) {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Validator: could not find JSON object in model response");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

module.exports = { runValidator };
