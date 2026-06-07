/**
 * Build the Wordle/Motus "valid guess" dictionaries from open lexicons.
 *
 * Output: public/valid-guesses.<locale>.txt (one normalized 5-letter word per
 * line, uppercase A-Z). The client fetches these once to reject non-words.
 *
 * Sources:
 *   en — tabatkins/wordle-list (the standard allowed-guess list)
 *   fr — words/an-array-of-french-words (common French words, no proper nouns)
 *
 * Usage: node scripts/build-valid-guesses.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";

const LENGTH = 5;

const SOURCES = {
  en: {
    url: "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words",
    type: "lines",
  },
  fr: {
    url: "https://raw.githubusercontent.com/words/an-array-of-french-words/master/index.json",
    type: "json",
  },
};

const COMBINING = /[̀-ͯ]/g;
// Single-token words only (letters + accents); excludes hyphens, apostrophes,
// spaces and digits so "a-t-elle" / "ci-gît" don't collapse into fake words.
const SINGLE_TOKEN = /^[a-zA-ZÀ-ÿŒœ]+$/;

function normalize(word) {
  return word
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

async function fetchWords(src) {
  const res = await fetch(src.url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${src.url}`);
  const text = await res.text();
  return src.type === "json" ? JSON.parse(text) : text.split(/\r?\n/);
}

async function build(locale) {
  const src = SOURCES[locale];
  process.stdout.write(`Fetching ${locale}… `);
  const raw = await fetchWords(src);

  const set = new Set();
  for (const word of raw) {
    if (typeof word !== "string" || !SINGLE_TOKEN.test(word)) continue;
    const n = normalize(word);
    if (n.length === LENGTH) set.add(n);
  }

  const sorted = [...set].sort();
  await mkdir("public", { recursive: true });
  const out = `public/valid-guesses.${locale}.txt`;
  await writeFile(out, sorted.join("\n") + "\n", "utf8");
  console.log(`${sorted.length} words → ${out}`);
}

await build("en");
await build("fr");
