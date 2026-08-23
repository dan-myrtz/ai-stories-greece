import {loadCorpus, distributionsOf} from "./lib/corpus.js";

const corpus = loadCorpus();
const rows = distributionsOf(corpus, ["sentiment"]);

process.stdout.write(JSON.stringify(rows));
