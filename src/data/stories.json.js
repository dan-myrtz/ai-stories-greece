import {loadCorpus} from "./lib/corpus.js";

process.stdout.write(JSON.stringify(loadCorpus()));
