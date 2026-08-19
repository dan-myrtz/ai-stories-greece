import * as Plot from "../vendor/plot.js";
import * as d3 from "../vendor/d3.js";

// Assigns the validated categorical slots (1..8) to a fixed set of
// categories, in the order given — never generated/cycled past 8.
export function seriesColorScale(categories) {
  return d3.scaleOrdinal(categories, categories.map((_, i) => `var(--series-${i + 1})`));
}

const CHROME = {
  style: {
    background: "transparent",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
  },
};

// Single-series horizontal bar (one hue for every bar — a value-ramp on a
// nominal category is the anti-pattern this avoids). Use for role, word,
// and noun-phrase frequency charts.
export function barChart(rows, {x, y, width = 420, height, color = "var(--series-1)", marginLeft = 130} = {}) {
  return Plot.plot({
    ...CHROME,
    width,
    height: height ?? Math.max(160, rows.length * 28),
    marginLeft,
    x: {label: null, grid: true, tickFormat: "~s"},
    y: {label: null},
    marks: [
      Plot.gridX({stroke: "var(--gridline)"}),
      Plot.barX(rows, {
        y,
        x,
        fill: color,
        rx: 3,
        insetTop: 4,
        insetBottom: 4,
        tip: true,
        title: (d) => `${d[y]}: ${d[x].toLocaleString()}`,
        sort: {y: "-x"},
      }),
      Plot.ruleX([0], {stroke: "var(--baseline)"}),
    ],
  });
}

// Multi-category horizontal bar with a fixed categorical color per row
// (caller supplies `fill`, already mapped from the shared series scale) —
// used for sentiment and name-register breakdowns. Pair with the shared
// `legend()` helper from waffleChart.js.
export function categoricalBarChart(rows, {x, y, fill, width = 420, height, marginLeft = 110} = {}) {
  return Plot.plot({
    ...CHROME,
    width,
    height: height ?? Math.max(160, rows.length * 28),
    marginLeft,
    x: {label: null, grid: true, tickFormat: "~s"},
    y: {label: null},
    marks: [
      Plot.gridX({stroke: "var(--gridline)"}),
      Plot.barX(rows, {
        y,
        x,
        fill,
        rx: 3,
        insetTop: 4,
        insetBottom: 4,
        tip: true,
        title: (d) => `${d[y]}: ${d[x].toLocaleString()}`,
        sort: {y: "-x"},
      }),
      Plot.ruleX([0], {stroke: "var(--baseline)"}),
    ],
  });
}

// Part-to-whole arc/donut — used once, for setting (3 segments; the
// anti-pattern guidance is that donuts only work at a glance with few
// slices — this stays well under that ceiling). Hand-built with d3.pie/arc:
// Plot has no first-class polar/pie mark, so d3 directly is the reliable
// path. A 2px surface-color gap (via padAngle) separates segments instead
// of a border; the biggest segment gets an inline label, the rest defer to
// the legend + tooltip.
export function donutChart(rows, {value, label, fill, width = 320, height = 320, innerRadius = 70} = {}) {
  const radius = Math.min(width, height) / 2 - 8;
  const total = d3.sum(rows, value);

  const arcs = d3
    .pie()
    .value(value)
    .padAngle(2 / radius)
    .sort(null)(rows);

  const arcGen = d3.arc().innerRadius(innerRadius).outerRadius(radius).cornerRadius(3);
  const labelArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius * 0.7);

  const svg = d3
    .create("svg")
    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height)
    .attr("role", "img")
    .attr("aria-label", rows.map((d) => `${label(d)}: ${value(d)} of ${total}`).join(", "));

  const g = svg.append("g");

  g.selectAll("path")
    .data(arcs)
    .join("path")
    .attr("d", arcGen)
    .attr("fill", (d) => fill(d.data))
    .append("title")
    .text((d) => `${label(d.data)}: ${value(d.data)} of ${total} (${Math.round((value(d.data) / total) * 100)}%)`);

  // Direct label only the largest wedge — selective labeling, not one per slice.
  const biggest = arcs.reduce((a, b) => (value(a.data) > value(b.data) ? a : b));
  g.append("text")
    .attr("transform", `translate(${labelArc.centroid(biggest)})`)
    .attr("text-anchor", "middle")
    .attr("font-family", "var(--font-body)")
    .attr("font-weight", 700)
    .attr("font-size", 20)
    .attr("fill", "#ffffff")
    .text(`${Math.round((value(biggest.data) / total) * 100)}%`);

  return svg.node();
}
