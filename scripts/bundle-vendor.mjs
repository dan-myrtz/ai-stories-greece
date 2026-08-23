// Pre-bundles browser-side dependencies into single self-contained ESM
// files under src/vendor/. Observable Framework's `npm:` import scheme
// fetches from cdn.jsdelivr.net at build time, which this environment's
// network policy blocks — so components import these local vendor
// bundles by relative path instead, built here from the packages already
// installed from the (allowed) npm registry.
import {build} from "esbuild";
import {mkdirSync} from "node:fs";

const outdir = new URL("../src/vendor/", import.meta.url).pathname;
mkdirSync(outdir, {recursive: true});

const entries = {
  "d3.js": `export * from "d3";`,
  "plot.js": `export * from "@observablehq/plot";`,
  // d3-cloud only has a default export (the `cloud()` layout function).
  "d3-cloud.js": `export {default} from "d3-cloud";`,
  "d3-sankey.js": `export * from "d3-sankey";`,
};

for (const [outfile, contents] of Object.entries(entries)) {
  await build({
    stdin: {contents, resolveDir: process.cwd(), loader: "js"},
    outfile: outdir + outfile,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    logLevel: "info",
  });
}

console.log("Vendor bundles written to", outdir);
