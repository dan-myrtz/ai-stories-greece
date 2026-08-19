import {readData} from "./lib/corpus.js";

const TOP_N = 20;

const rows = readData("GR_noun_phrases.csv")
  .map((r) => ({phrase: r["Noun Phrase"], count: Number(r.Count)}))
  .sort((a, b) => b.count - a.count)
  .slice(0, TOP_N);

process.stdout.write(JSON.stringify(rows));
