/**
 * Merge + validate generated word batches into the final daily sets.
 *
 * Reads every scripts/_gen/<locale>-*.json (curated batches first), validates
 * and dedupes, caps at TARGET, and writes lib/words/daily.<locale>.json.
 *
 * Usage: node scripts/merge-words.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const GEN_DIR = "scripts/_gen";
const TARGET = 365;
const MIN_LEN = 4;
const MAX_LEN = 13;

const COMBINING = /[̀-ͯ]/g;
const SINGLE_TOKEN = /^\p{L}+$/u; // letters only — no spaces, hyphens, apostrophes

function normalize(word) {
  return word
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function isValid(entry, seen) {
  if (!entry || typeof entry.word !== "string" || typeof entry.definition !== "string")
    return false;
  const word = entry.word.trim();
  if (!SINGLE_TOKEN.test(word)) return false;
  const n = normalize(word);
  if (n.length < MIN_LEN || n.length > MAX_LEN) return false;
  if (seen.has(n)) return false;
  // The clue must not give away the answer.
  if (normalize(entry.definition).includes(n)) return false;
  return true;
}

async function load(file) {
  try {
    return JSON.parse(await readFile(path.join(GEN_DIR, file), "utf8"));
  } catch {
    console.warn(`  ! could not parse ${file} — skipped`);
    return [];
  }
}

async function mergeLocale(locale) {
  const files = (await readdir(GEN_DIR)).filter(
    (f) => f.startsWith(`${locale}-`) && f.endsWith(".json"),
  );
  const curatedFiles = files.filter((f) => f.includes("curated"));
  const themeFiles = files.filter((f) => !f.includes("curated")).sort();

  const seen = new Set();
  const out = [];
  const counts = {};
  let rejected = 0;

  const take = (e, label) => {
    if (out.length >= TARGET) return;
    if (isValid(e, seen)) {
      seen.add(normalize(e.word));
      out.push({ word: e.word.trim(), definition: e.definition.trim() });
      counts[label] = (counts[label] ?? 0) + 1;
    } else {
      rejected++;
    }
  };

  // Curated entries first (in full), then round-robin across themed batches so
  // every theme is represented up to the cap.
  for (const f of curatedFiles) for (const e of await load(f)) take(e, f);

  const queues = await Promise.all(themeFiles.map(load));
  let idx = 0;
  while (out.length < TARGET && queues.some((q) => q.length)) {
    const q = queues[idx % queues.length];
    idx++;
    if (q.length) take(q.shift(), themeFiles[(idx - 1) % themeFiles.length]);
  }

  const outFile = `lib/words/daily.${locale}.json`;
  await writeFile(outFile, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(
    `${locale}: ${out.length} kept (${Object.entries(counts)
      .map(([k, v]) => `${k.replace(`${locale}-`, "").replace(".json", "")}:${v}`)
      .join(" ")}), ${rejected} rejected → ${outFile}`,
  );
}

await mergeLocale("fr");
await mergeLocale("en");
