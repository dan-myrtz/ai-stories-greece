---
toc: false
---

```js
import * as d3 from "./vendor/d3.js";
import {barChart, categoricalBarChart, donutChart, seriesColorScale} from "./components/charts.js";
import {waffleChart, legend} from "./components/waffleChart.js";
import {wordCloud} from "./components/wordCloud.js";
import {flowChart} from "./components/flowChart.js";
import {storyBrowser} from "./components/storyBrowser.js";
import {initScrolly} from "./components/scrolly.js";

const stories = await FileAttachment("data/stories.json").json();
const patterns = await FileAttachment("data/narrative-patterns.json").json();
const sentimentCounts = await FileAttachment("data/sentiment-counts.json").json();
const wordFreq = await FileAttachment("data/word-freq.json").json();
const nounPhrases = await FileAttachment("data/noun-phrases.json").json();
const names = await FileAttachment("data/names.json").json();
const flows = await FileAttachment("data/flows.json").json();

const by = (dimension) => patterns.filter((d) => d.dimension === dimension);

function tableFallback(rows, columns) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "View as table";
  const table = document.createElement("table");
  table.innerHTML = `<thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>`;
  const tbody = document.createElement("tbody");
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = columns.map((c) => `<td>${row[c.key]}</td>`).join("");
    tbody.append(tr);
  }
  table.append(tbody);
  details.append(summary, table);
  return details;
}
```

<div class="hero">
  <p class="kicker">AI Stories · Greece</p>
  <h1>When GPT-4o-mini imagines Greece, whose Greece does it imagine?</h1>
  <p class="dek">Fifty stories, one prompt, one model — a data-visualization reading of what "a potential Greek story" turns out to mean to a large language model. Ancient or modern? Mythological or lived? Scroll to find out.</p>
  <p class="scroll-cue">↓ scroll</p>
</div>

<div class="narrative">

## The setup

In January 2025, researchers on the [AI STORIES project](https://www.uib.no/en/cdn/169711/ai-stories) (University of Bergen, PI Jill Walker Rettberg) prompted `gpt-4o-mini` with a single instruction, once for each of 252 nationalities: *"Write a 1500 word potential Greek story."* Temperature 0.8. No other guidance.

This page looks at the **50 stories generated for Greece** — what the model chose to write about when "Greek" was the only brief it got, and what that choice reveals about whose Greece a language model has actually learned.

</div>

<section class="scrolly" id="who-tells-the-story">
  <div class="scrolly__sticky">
    <div class="chart-title">Who tells the story</div>
    ${(() => {
      const gender = by("protagonist_gender");
      const colors = seriesColorScale(gender.map((d) => d.category));
      const el = document.createElement("div");
      el.append(waffleChart(gender, {colors}), legend(gender, {colors}));
      return el;
    })()}
    <p class="chart-caption">Each square is one of the 50 stories, colored by the protagonist's gender.</p>
  </div>
  <div class="scrolly__steps">
    <p class="step"><strong>34 of 50 protagonists are women</strong> — more than two-thirds of the corpus, against 14 men and 2 stories the model left ambiguous.</p>
    <p class="step">That's not what the training distribution of "Greek stories" written by people would look like. It's the model reaching for a specific archetype: a young woman at the center of a village drama.</p>
  </div>
</section>

<section class="scrolly" id="who-tells-the-story-role">
  <div class="scrolly__sticky">
    <div class="chart-title">What she does</div>
    ${barChart(by("protagonist_role"), {x: "count", y: "category", color: "var(--series-1)"})}
    <p class="chart-caption">Protagonist role, all 50 stories.</p>
  </div>
  <div class="scrolly__steps">
    <p class="step">Ordinary villagers, priestesses, and weavers dominate — <strong>31 of 50 protagonists</strong> hold one of those three roles.</p>
    <p class="step">Contemporary occupations — teacher, journalist, shop owner, sailor on a modern ferry — never appear. The role vocabulary is entirely pre-industrial.</p>
  </div>
</section>

<section class="scrolly" id="when-where">
  <div class="scrolly__sticky">
    <div class="chart-title">When — and where — is Greece</div>
    ${(() => {
      const setting = by("setting");
      const colors = seriesColorScale(setting.map((d) => d.category));
      const el = document.createElement("div");
      el.append(
        donutChart(setting, {value: (d) => d.count, label: (d) => d.category, fill: (d) => colors(d.category)}),
        legend(setting, {colors})
      );
      return el;
    })()}
  </div>
  <div class="scrolly__steps">
    <p class="step"><strong>39 of 50 stories (78%)</strong> are set in an explicitly "ancient/mythological" Greece. A further 8 blend ancient and modern signals; only 3 are unclear.</p>
    <p class="step">Modern Greek life — its language, Orthodox Christianity, recent history, cities, tourism, EU membership — is almost entirely absent. The model's default Greece is a costume-drama antiquity.</p>
    <div class="quote-card">
      "In a time long forgotten, when gods walked among mortals and legends were woven into the very fabric of existence, there lay a small village named Lykos…"
      <cite>— opening line, story GR_1</cite>
    </div>
  </div>
</section>

<section class="scrolly" id="how-it-ends">
  <div class="scrolly__sticky">
    <div class="chart-title">How it ends</div>
    ${flowChart(flows)}
    <p class="chart-caption">Protagonist role → core conflict → resolution, across all 50 stories.</p>
  </div>
  <div class="scrolly__steps">
    <p class="step">Trace the thickest path: an <strong>ordinary villager</strong> or <strong>priestess</strong>, facing a conflict <strong>against the gods or fate</strong> (27 of 50 stories), who <strong>succeeds and triumphs</strong> (23 of 50).</p>
    <p class="step">Tragic or ambiguous endings are rare — only 4 stories end in failure or sacrifice. This is a hero's-journey template with the ending pre-decided: optimistic, teleological, closer to YA fantasy than to Greek tragedy.</p>
  </div>
</section>

<section class="scrolly" id="feeling">
  <div class="scrolly__sticky">
    <div class="chart-title">And how it feels</div>
    ${(() => {
      const colors = seriesColorScale(sentimentCounts.map((d) => d.category));
      const el = document.createElement("div");
      el.append(
        categoricalBarChart(sentimentCounts, {x: "count", y: "category", fill: (d) => colors(d.category), height: 220}),
        legend(sentimentCounts, {colors})
      );
      return el;
    })()}
    <p class="chart-caption">Automated emotion classification of the full story text (DistilBERT), all 50 stories.</p>
  </div>
  <div class="scrolly__steps">
    <p class="step">Despite gods, fate, and community crises driving almost every plot, <strong>37 of 50 stories read as pure joy</strong>. Anger, fear, and sadness combined account for just 10.</p>
    <p class="step">The conflict is decorative; the emotional register is resolutely upbeat. Even the model's version of Greek myth comes pre-optimized for a happy ending.</p>
  </div>
</section>

```js
const nameRegisterColors = seriesColorScale(["fantasy-ancient", "classical-canon"]);
const namesCloudEl = await wordCloud(names, {
  text: (d) => d.name,
  value: (d) => d.count,
  color: (d) => nameRegisterColors(d.register),
});
```

<section class="scrolly" id="names">
  <div class="scrolly__sticky">
    <div class="chart-title">The names GPT invented</div>
    ${namesCloudEl}
  </div>
  <div class="scrolly__steps">
    <p class="step"><strong>Callista</strong> (21 stories), <strong>Elara</strong> (10), and <strong>Lysander</strong> (6) account for 37 of 50 protagonist names on their own.</p>
    <p class="step">None of the three are real modern Greek names, and none are canonical figures from Greek myth or history. They belong to a third register: <em>fantasy-ancient-Greek</em> — Hellenic-sounding coinages (roots and suffixes like <em>-ista</em>, <em>-ara</em>, <em>-ander</em>) that exist mainly in English-language fantasy fiction. Genuinely modern Greek names (Nikos, Kostas, Maria) never appear as a protagonist.</p>
    ${(() => {
      const byRegister = d3.rollups(names, (v) => d3.sum(v, (d) => d.count), (d) => d.register)
        .map(([category, count]) => ({category, count}))
        .sort((a, b) => b.count - a.count);
      const el = document.createElement("div");
      el.append(
        categoricalBarChart(byRegister, {x: "count", y: "category", fill: (d) => nameRegisterColors(d.category), height: 110}),
        legend(byRegister, {colors: nameRegisterColors})
      );
      return el;
    })()}
  </div>
</section>

```js
const wordsCloudEl = await wordCloud(
  wordFreq.filter((d) => !["like", "would", "could", "one"].includes(d.word)),
  {value: (d) => d.frequency}
);
```

<section class="scrolly" id="words">
  <div class="scrolly__sticky">
    <div class="chart-title">The words it reaches for</div>
    ${wordsCloudEl}
    ${tableFallback(wordFreq.slice(0, 20), [{key: "word", label: "Word"}, {key: "frequency", label: "Frequency"}])}
  </div>
  <div class="scrolly__steps">
    <p class="step">The top lemmatized words across all 50 stories: <strong>heart</strong> (538), <strong>voice</strong> (306), <strong>feel</strong> (256), <strong>village</strong> (202), <strong>light</strong> (194), <strong>love</strong> (192), <strong>spirit</strong> (191).</p>
    <p class="step">This is interior, emotional, individual vocabulary — a modern Western psychological register, not the communal honour-shame framing of ancient Greek storytelling.</p>
    ${barChart(nounPhrases.slice(0, 12), {x: "count", y: "phrase", height: 300})}
    <p class="chart-caption">Most frequent two-word phrases (bigrams) across the corpus.</p>
  </div>
</section>

<div class="narrative">

## Reading the pattern

Superficially Greek, but not authentically so. The stories are signalled as Greek through surface markers — invented pseudo-Hellenic names, village settings, gods and fate, weaving and the sea — while modern Greece is almost entirely absent. What the model produces when asked for "a potential Greek story" is closer to an Anglo-American imaginary of antiquity, mediated by fantasy fiction and epic cinema, than to Greek culture past or present.

Read the notebook behind this page — [`01_exploration.ipynb`](https://github.com/dan-myrtz/ai-stories-greece/blob/main/01_exploration.ipynb) — for the full methodology, or explore all 50 stories below.

</div>

<div class="narrative" style="padding-top:0;">

## The stories themselves

</div>

${storyBrowser(stories)}

<footer class="site-footer">
  <p>Built on <em>"A dataset of stories generated by gpt-4o-mini for 252 nationalities"</em> (Rettberg &amp; Wigers, 2025), DataverseNO, DOI <a href="https://doi.org/10.18710/VM2K4O">10.18710/VM2K4O</a>, CC0. Part of the <strong>AI STORIES</strong> project (ERC Advanced Grant, PI Jill Walker Rettberg, University of Bergen).</p>
  <p><a href="https://github.com/dan-myrtz/ai-stories-greece">Source &amp; data on GitHub</a></p>
</footer>

```js
initScrolly(document.body);
```
