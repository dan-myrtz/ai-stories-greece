import {loadCorpus, distributionsOf} from "./lib/corpus.js";

const corpus = loadCorpus();
const rows = distributionsOf(corpus, [
  "protagonist_gender",
  "protagonist_role",
  "setting",
  "core_conflict",
  "resolution_type",
]);

process.stdout.write(JSON.stringify(rows));
