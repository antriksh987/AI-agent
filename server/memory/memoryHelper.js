/**
 * Scout v4.0 – Memory helpers
 * Reads / writes memory.json to persist validated and rejected ideas.
 */

const fs = require("fs");
const path = require("path");

const MEMORY_PATH = path.join(__dirname, "memory.json");

function readMemory() {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { validated: [], rejected: [] };
  }
}

function writeMemory(data) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Check if an idea (by title) already exists in memory.
 */
function isDuplicate(title) {
  const mem = readMemory();
  const normalised = title.trim().toLowerCase();
  const allIdeas = [...mem.validated, ...mem.rejected];
  return allIdeas.some((item) => item.title?.trim().toLowerCase() === normalised);
}

/**
 * Store a validated idea.
 */
function storeValidated(idea) {
  const mem = readMemory();
  mem.validated.push({ ...idea, storedAt: new Date().toISOString() });
  writeMemory(mem);
}

/**
 * Store a rejected idea.
 */
function storeRejected(idea) {
  const mem = readMemory();
  mem.rejected.push({ ...idea, storedAt: new Date().toISOString() });
  writeMemory(mem);
}

module.exports = { readMemory, isDuplicate, storeValidated, storeRejected };
