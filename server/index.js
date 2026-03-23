/**
 * Scout v4.0 – Express Server Entry Point
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const scoutRoutes = require("./routes/scoutRoutes");

const PORT = process.env.PORT || 3001;

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Basic request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", scoutRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", version: "4.0.0" }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Scout v4.0] Server running on http://localhost:${PORT}`);
  console.log(`  ANTHROPIC_API_KEY set: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`  Ollama base URL: ${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}`);
});
