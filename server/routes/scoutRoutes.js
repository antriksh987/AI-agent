/**
 * Scout v4.0 – API Routes
 * POST /scout-lite  → ScoutLite agent
 * POST /validate    → Validator agent
 * POST /god-mode    → GodMode agent
 * GET  /memory      → Read stored ideas
 */

const express = require("express");
const router = express.Router();

const { runScoutLite } = require("../agents/scoutLite");
const { runValidator } = require("../agents/validator");
const { runGodMode } = require("../agents/godMode");
const {
  readMemory,
  isDuplicate,
  storeValidated,
  storeRejected,
} = require("../memory/memoryHelper");

// ─── Scout Lite ───────────────────────────────────────────────────────────────
router.post("/scout-lite", async (req, res) => {
  const { query, model } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "query is required" });
  }

  console.log(`[Route /scout-lite] query="${query}"`);

  try {
    const opportunities = await runScoutLite(query.trim(), model);
    return res.json({ success: true, opportunities });
  } catch (err) {
    console.error("[Route /scout-lite] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Validator ────────────────────────────────────────────────────────────────
router.post("/validate", async (req, res) => {
  const { idea, model } = req.body;

  if (!idea || typeof idea !== "object") {
    return res.status(400).json({ error: "idea object is required" });
  }

  console.log(`[Route /validate] idea="${idea.title}"`);

  // Duplicate check
  if (idea.title && isDuplicate(idea.title)) {
    return res.status(409).json({
      error: "This idea has already been researched",
      duplicate: true,
    });
  }

  try {
    const result = await runValidator(idea, model);

    // Persist to memory
    const ideaWithResult = { ...idea, validation: result };
    if (result.verdict === "GO" || result.verdict === "PIVOT") {
      storeValidated(ideaWithResult);
    } else {
      storeRejected(ideaWithResult);
    }

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[Route /validate] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── God Mode ─────────────────────────────────────────────────────────────────
router.post("/god-mode", async (req, res) => {
  const { idea, model } = req.body;

  if (!idea || typeof idea !== "object") {
    return res.status(400).json({ error: "idea object is required" });
  }

  console.log(`[Route /god-mode] idea="${idea.title}"`);

  try {
    const brief = await runGodMode(idea, model);
    return res.json({ success: true, brief });
  } catch (err) {
    console.error("[Route /god-mode] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Memory ───────────────────────────────────────────────────────────────────
router.get("/memory", (req, res) => {
  try {
    const mem = readMemory();
    return res.json({ success: true, ...mem });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
