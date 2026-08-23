import {readData} from "./lib/corpus.js";

// Qualitative register for each protagonist name, following the notebook's
// own finding (01_exploration.ipynb, cell 14): most invented protagonist
// names "sound" Hellenic (Greek roots + suffixes like -ista/-ara/-ander) but
// are neither real modern Greek names nor canonical myth/history names.
// This lookup isn't derived from any CSV column — it formalizes that
// qualitative read for the chart. "modern-greek" has zero entries because
// none of the 50 stories used a genuinely contemporary Greek name
// (Nikos, Kostas, Maria, ...) for its protagonist.
const REGISTER = {
  Callista: "fantasy-ancient",
  Kallista: "fantasy-ancient",
  Elara: "fantasy-ancient",
  Lysander: "fantasy-ancient",
  Lysandra: "fantasy-ancient",
  Aetheria: "fantasy-ancient",
  Lyra: "fantasy-ancient",
  Thalia: "classical-canon",
  Lycos: "classical-canon",
  Leandros: "classical-canon",
  Daphne: "classical-canon",
  Thales: "classical-canon",
  Eurydice: "classical-canon",
  Alcyone: "classical-canon",
};

const rows = readData("GR_names.csv")
  .map((r) => ({
    name: r.Name,
    count: Number(r.Count),
    register: REGISTER[r.Name] ?? "classical-canon",
  }))
  .sort((a, b) => b.count - a.count);

process.stdout.write(JSON.stringify(rows));
