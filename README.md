# 🔭 Scout v4.0 – Multi-Agent AI Research Engine

Scout is an AI-powered opportunity research engine that discovers, validates, and analyzes startup ideas using a modular multi-agent pipeline.

## Architecture

```
/server
  /agents
    scoutLite.js    ← Discovery Agent  (Ollama/Qwen – local)
    validator.js    ← Decision Agent   (Claude Sonnet)
    godMode.js      ← Analysis Agent   (Claude Opus)
  /routes
    scoutRoutes.js  ← POST /api/scout-lite, /validate, /god-mode
  /memory
    memory.json     ← Persistent store of validated/rejected ideas
    memoryHelper.js ← Read/write helpers + duplicate detection
  index.js          ← Express server

/client             ← React + Vite + Tailwind frontend
  /src
    App.jsx
    /components
      ModeSelector.jsx
      ResultPanel.jsx
      LoadingSpinner.jsx
```

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | Required |
| [Ollama](https://ollama.ai) | latest | For Scout Lite (local model) |
| Anthropic API key | — | For Validator & God Mode |

### Install Ollama model

```bash
ollama pull qwen3:4b
```

## Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd AI-agent
npm install            # installs root dev deps (concurrently)
npm run install:all    # installs server + client deps
```

### 2. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env and set ANTHROPIC_API_KEY
```

### 3. Run (development)

```bash
npm run dev
```

This starts:
- **Backend** → `http://localhost:3001`
- **Frontend** → `http://localhost:5173`

Or run separately:
```bash
npm run dev:server   # backend only
npm run dev:client   # frontend only
```

## API Reference

All routes are prefixed with `/api`.

### `POST /api/scout-lite`
Discover 3–5 startup opportunities using Ollama/Qwen.

**Body:**
```json
{ "query": "find opportunities in AI for SMB India", "model": "qwen3:4b" }
```

**Response:**
```json
{
  "success": true,
  "opportunities": [
    {
      "title": "...",
      "problem": "...",
      "target_user": "...",
      "signal_source": "...",
      "confidence": 0.85
    }
  ]
}
```

---

### `POST /api/validate`
Run 5 validation checks on an idea using Claude Sonnet.

**Body:**
```json
{ "idea": { "title": "...", "problem": "...", ... } }
```

**Response:**
```json
{
  "success": true,
  "verdict": "GO",
  "confidence": 0.78,
  "reasons": {
    "pain_exists": { "passed": true, "note": "..." },
    "clear_buyer": { "passed": true, "note": "..." },
    "buildable": { "passed": true, "note": "..." },
    "competitors_exist": { "passed": false, "note": "..." },
    "timing_recent": { "passed": true, "note": "..." }
  }
}
```

---

### `POST /api/god-mode`
Generate a full opportunity brief using Claude Opus.

**Body:**
```json
{ "idea": { "title": "...", "problem": "...", "validation": { ... } } }
```

**Response:**
```json
{
  "success": true,
  "brief": {
    "problem": "...",
    "competitor_analysis": "...",
    "buyer_psychology": "...",
    "mvp_plan": "...",
    "monetization": "...",
    "risks": "..."
  }
}
```

---

### `GET /api/memory`
Returns all stored validated and rejected ideas.

## Memory System

All validated (`GO`/`PIVOT`) and rejected (`NO-GO`) ideas are stored in `server/memory/memory.json`. Duplicate submissions (same title) are rejected with HTTP 409.

## Model Configuration

You can override the model per-request via the `model` field in the request body, or set environment variables in `server/.env`:

| Env variable | Default | Used by |
|---|---|---|
| `OLLAMA_MODEL` | `qwen3:4b` | Scout Lite |
| `CLAUDE_SONNET_MODEL` | `claude-4-6-free` | Validator |
| `CLAUDE_OPUS_MODEL` | `claude-4-6-free` | God Mode |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Scout Lite |
