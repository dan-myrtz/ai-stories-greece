// Shared helper: read the raw CSVs from /data, normalize IDs, and join them
// into one array of 50 per-story records. Imported by the data loaders in
// src/data/*.json.js — not itself a loader (no .json.js suffix).
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, resolve} from "node:path";
import {csvParse} from "d3-dsv";

const here = dirname(fileURLToPath(import.meta.url));
// src/data/lib/corpus.js -> repo root is three levels up, then into data/
const DATA_DIR = resolve(here, "../../../data");

function readCsv(name) {
  return csvParse(readFileSync(resolve(DATA_DIR, name), "utf-8"));
}

// Both "Story_ID" and "story_id" appear across the CSVs (GR_sentiments.csv
// alone uses the lowercase form) — normalize every row to one `story_id` key.
function withStoryId(row) {
  const id = row.Story_ID ?? row.story_id;
  if (!id) throw new Error(`row missing Story_ID/story_id: ${JSON.stringify(row)}`);
  return {...row, story_id: id};
}

function byStoryId(rows) {
  return new Map(rows.map(withStoryId).map((r) => [r.story_id, r]));
}

// Story text isn't formatted consistently: most open straight with
// "**Title**", some with a "# Title" or "### Title" markdown heading, and a
// few have a preamble line first ("Sure! Here's a potential Greek story...")
// or a "---" rule before the title. A line only counts as a title if it's
// ENTIRELY a bold span or ENTIRELY a heading — a bold phrase midway through
// a sentence doesn't count.
const TITLE_LINE = /^(?:\*\*(?:Title:\s*)?(.+?)\*\*|#{1,6}\s+(.+?))\s*$/;

// A short bold label opening a paragraph, e.g. "**Setting:** Ancient
// Greece, in the city of..." — metadata some stories prepend, not prose.
const BOLD_LABEL = /^\*\*[A-Za-z][A-Za-z /]{1,25}:\*\*/;

// A line/paragraph that isn't prose: blank, a "---" rule, a heading/bold
// line (chapter/part markers that sometimes follow the title), or a
// metadata paragraph opening with a bold label.
function isDecorative(line) {
  const trimmed = line.trim();
  return trimmed === "" || /^-{3,}$/.test(trimmed) || TITLE_LINE.test(trimmed) || BOLD_LABEL.test(trimmed);
}

function findTitleLineIndex(lines) {
  return lines.findIndex((line) => TITLE_LINE.test(line.trim()));
}

function extractTitle(story, storyId) {
  const lines = story.split("\n");
  const index = findTitleLineIndex(lines);
  if (index === -1) return `Untitled — ${storyId}`;
  const match = lines[index].trim().match(TITLE_LINE);
  return (match[1] ?? match[2]).trim();
}

function excerptOf(story) {
  const lines = story.split("\n");
  const titleIndex = findTitleLineIndex(lines);
  const rest = lines.slice(titleIndex === -1 ? 0 : titleIndex + 1).join("\n");
  const paragraphs = rest.split(/\n\s*\n/).map((p) => p.trim());
  const firstParagraph = paragraphs.find((p) => p && !isDecorative(p)) ?? paragraphs.find((p) => p) ?? "";
  if (firstParagraph.length <= 400) return firstParagraph;
  const clipped = firstParagraph.slice(0, 400);
  const lastSentenceEnd = Math.max(clipped.lastIndexOf(". "), clipped.lastIndexOf("! "), clipped.lastIndexOf("? "));
  return (lastSentenceEnd > 200 ? clipped.slice(0, lastSentenceEnd + 1) : clipped.trim() + "…").trim();
}

let _corpus;

// Returns the 50 merged story records: stories + summaries + sentiments +
// narrative_patterns joined on the normalized story_id.
export function loadCorpus() {
  if (_corpus) return _corpus;

  const stories = byStoryId(readCsv("GR_stories.csv"));
  const summaries = byStoryId(readCsv("GR_summaries.csv"));
  const sentiments = byStoryId(readCsv("GR_sentiments.csv"));
  const patterns = byStoryId(readCsv("GR_narrative_patterns.csv"));

  const merged = [...stories.values()].map((s) => {
    const summary = summaries.get(s.story_id);
    const sentiment = sentiments.get(s.story_id);
    const pattern = patterns.get(s.story_id);
    return {
      story_id: s.story_id,
      title: extractTitle(s.Story, s.story_id),
      story: s.Story,
      excerpt: excerptOf(s.Story),
      word_count: s.Story.trim().split(/\s+/).length,
      summary: summary?.Summaries ?? null,
      sentiment: sentiment?.sentiment ?? null,
      confidence: sentiment ? Number(sentiment.confidence) : null,
      protagonist_gender: pattern?.protagonist_gender ?? null,
      protagonist_role: pattern?.protagonist_role ?? null,
      setting: pattern?.setting ?? null,
      core_conflict: pattern?.core_conflict ?? null,
      resolution_type: pattern?.resolution_type ?? null,
    };
  });

  if (merged.length !== 50) {
    throw new Error(`expected 50 merged stories, got ${merged.length}`);
  }
  for (const record of merged) {
    for (const [key, value] of Object.entries(record)) {
      if (value === null || value === undefined) {
        throw new Error(`story ${record.story_id} missing field "${key}" after join`);
      }
    }
  }

  _corpus = merged;
  return merged;
}

export function readData(name) {
  return readCsv(name);
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({category, count}))
    .sort((a, b) => b.count - a.count);
}

export function distributionsOf(corpus, dimensions) {
  const out = [];
  for (const dimension of dimensions) {
    for (const {category, count} of countBy(corpus, dimension)) {
      out.push({dimension, category, count});
    }
  }
  return out;
}
