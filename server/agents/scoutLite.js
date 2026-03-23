/**
 * Scout v4.0 – Scout Lite (Discovery Agent)
 * Uses local Ollama model (Qwen) for lightweight discovery tasks.
 */

const axios = require("axios");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:4b";

/**
 * Discover 3–5 startup opportunities based on a user query.
 * @param {string} query - e.g. "find opportunities in AI for SMB India"
 * @param {string} [model] - override Ollama model
 * @returns {Promise<Array>} Array of opportunity objects
 */
async function runScoutLite(query, model) {
  const selectedModel = model || OLLAMA_MODEL;

  const systemPrompt = `You are Scout Lite, a startup opportunity discovery engine.
Given a user query, return exactly 3 to 5 startup opportunities as a valid JSON array.
Each element must have these keys: title, problem, target_user, signal_source, confidence.
confidence is a number between 0 and 1.
Respond ONLY with the JSON array, no markdown, no explanation.`;

  const userPrompt = `Discover startup opportunities for: "${query}"`;

  console.log(`[ScoutLite] Calling Ollama model="${selectedModel}" for query: ${query}`);

  const response = await axios.post(
    `${OLLAMA_BASE_URL}/api/chat`,
    {
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
      options: { temperature: 0.7, num_predict: 1024 },
    },
    { timeout: 120000 }
  );

  const rawContent = response.data?.message?.content || "";
  console.log(`[ScoutLite] Raw response length: ${rawContent.length}`);

  return parseJSONArray(rawContent);
}

/**
 * Parse a JSON array from a potentially noisy LLM response string.
 */
function parseJSONArray(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Find first '[' and last ']'
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("ScoutLite: could not find JSON array in model response");
  }

  const jsonStr = cleaned.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

module.exports = { runScoutLite };
