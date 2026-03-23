/**
 * Scout v4.0 – God Mode (Deep Analysis Agent)
 * Uses Claude Opus API to produce a full opportunity brief.
 */

const Anthropic = require("@anthropic-ai/sdk");

const CLAUDE_OPUS_MODEL =
  process.env.CLAUDE_OPUS_MODEL || "claude-4-6-free";

/**
 * Generate a comprehensive opportunity brief for a validated idea.
 * @param {object} idea – opportunity object (from ScoutLite + validator result)
 * @param {string} [model] – override Claude model
 * @returns {Promise<object>} Structured opportunity brief
 */
async function runGodMode(idea, model) {
  const client = new Anthropic.default();
  const selectedModel = model || CLAUDE_OPUS_MODEL;

  const systemPrompt = `You are God Mode, a deep startup analyst. Produce a full opportunity brief.
Return ONLY a valid JSON object with exactly these keys:
{
  "problem": "<2-3 sentences describing the problem deeply>",
  "competitor_analysis": "<key competitors, their weaknesses, and your edge>",
  "buyer_psychology": "<what motivates the buyer, their fears, triggers>",
  "mvp_plan": "<3-step MVP with timeline estimate>",
  "monetization": "<primary and secondary revenue models>",
  "risks": "<top 3 risks and mitigation strategies>"
}
Be concise, specific, and actionable. No markdown, no extra text.`;

  const ideaSummary = JSON.stringify(idea, null, 2);
  const userPrompt = `Generate a full opportunity brief for:\n${ideaSummary}`;

  console.log(`[GodMode] Calling Claude model="${selectedModel}" for idea: ${idea.title || "unknown"}`);

  const message = await client.messages.create({
    model: selectedModel,
    max_tokens: 2048,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const rawContent = message.content?.[0]?.text || "";
  console.log(`[GodMode] Raw response length: ${rawContent.length}`);

  return parseJSONObject(rawContent);
}

function parseJSONObject(text) {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("GodMode: could not find JSON object in model response");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

module.exports = { runGodMode };
