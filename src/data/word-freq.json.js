import {readData} from "./lib/corpus.js";

const TOP_N = 60;

const rows = readData("GR_word_freq.csv")
  .map((r) => ({word: r.Word, frequency: Number(r.Frequency)}))
  .sort((a, b) => b.frequency - a.frequency)
  .slice(0, TOP_N);

process.stdout.write(JSON.stringify(rows));
