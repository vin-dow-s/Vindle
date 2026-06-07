/**
 * Generate a large set of words + definitions for the "Mot du jour" mode using
 * the Claude API, with validation. Output is written as JSON you can review and
 * fold into lib/words/daily.<locale>.ts (or seed into Supabase).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-words.mjs <fr|en> <count> [outFile]
 *
 * Examples:
 *   node scripts/generate-words.mjs fr 365
 *   node scripts/generate-words.mjs en 365 lib/words/generated.en.json
 *
 * Always human-review the output before shipping.
 */
import Anthropic from "@anthropic-ai/sdk";
import { writeFile, readFile } from "node:fs/promises";

const MODEL = process.env.VINDLE_GEN_MODEL || "claude-sonnet-4-6";
const BATCH = 25;

const [, , localeArg = "fr", countArg = "60", outArg] = process.argv;
const locale = localeArg.toLowerCase();
const target = parseInt(countArg, 10);
const outFile = outArg || `lib/words/generated.${locale}.json`;

if (!["fr", "en"].includes(locale)) {
  console.error(`Unknown locale "${locale}". Use "fr" or "en".`);
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY in your environment.");
  process.exit(1);
}

const client = new Anthropic();

const language = locale === "fr" ? "French" : "English";

function normalize(word) {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function buildPrompt(count, avoid) {
  return [
    `Generate ${count} interesting ${language} vocabulary words for a word-guessing game, each with a short clue definition in ${language}.`,
    "Rules:",
    "- Common-ish but rich vocabulary (think evocative nouns/adjectives), no proper nouns, no abbreviations.",
    "- Single words only (no spaces).",
    "- The definition is ONE concise sentence and MUST NOT contain the target word or an obvious derivative of it.",
    "- Vary the difficulty and theme.",
    avoid.length
      ? `- Do NOT reuse any of these already-used words: ${avoid.join(", ")}.`
      : "",
    'Return ONLY a JSON array, no prose, of objects: [{"word": "...", "definition": "..."}].',
  ]
    .filter(Boolean)
    .join("\n");
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array in response.");
  return JSON.parse(raw.slice(start, end + 1));
}

function isValid(entry, seen) {
  if (!entry || typeof entry.word !== "string" || typeof entry.definition !== "string")
    return false;
  const norm = normalize(entry.word);
  if (norm.length < 4 || norm.length > 14) return false;
  if (seen.has(norm)) return false;
  // definition must not contain the word
  if (normalize(entry.definition).includes(norm)) return false;
  return true;
}

async function main() {
  /** @type {{word: string, definition: string}[]} */
  let existing = [];
  try {
    existing = JSON.parse(await readFile(outFile, "utf8"));
  } catch {
    /* fresh file */
  }

  const seen = new Set(existing.map((e) => normalize(e.word)));
  const results = [...existing];

  while (results.length < target) {
    const need = Math.min(BATCH, target - results.length);
    const avoid = [...seen].slice(-200);
    process.stdout.write(`Requesting ${need} (${results.length}/${target})… `);

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: buildPrompt(need, avoid) }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");

    let batch;
    try {
      batch = extractJson(text);
    } catch (err) {
      console.log(`parse error (${err.message}), retrying.`);
      continue;
    }

    let added = 0;
    for (const entry of batch) {
      if (!isValid(entry, seen)) continue;
      seen.add(normalize(entry.word));
      results.push({ word: entry.word.trim(), definition: entry.definition.trim() });
      added++;
    }
    console.log(`+${added}`);

    await writeFile(outFile, JSON.stringify(results, null, 2) + "\n", "utf8");
  }

  console.log(`Done. ${results.length} entries written to ${outFile}.`);
  console.log("Review them, then merge into lib/words/daily." + locale + ".ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
