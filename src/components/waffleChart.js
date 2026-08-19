import * as d3 from "../vendor/d3.js";

// A 10-wide pictogram grid: one square per story, colored by category,
// filled in category order. Reads as "34 of 50" far more viscerally than
// a bar or donut at this scale (n=50).
export function waffleChart(rows, {width = 420, cols = 10, gap = 6, colors} = {}) {
  const total = d3.sum(rows, (d) => d.count);
  const size = (width - gap * (cols - 1)) / cols;
  const rowsCount = Math.ceil(total / cols);
  const height = rowsCount * (size + gap) - gap;

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height)
    .attr("role", "img")
    .attr("aria-label", rows.map((d) => `${d.category}: ${d.count} of ${total}`).join(", "));

  let i = 0;
  for (const {category, count} of rows) {
    const color = colors(category);
    for (let k = 0; k < count; k++, i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      svg
        .append("rect")
        .attr("x", col * (size + gap))
        .attr("y", row * (size + gap))
        .attr("width", size)
        .attr("height", size)
        .attr("rx", 3)
        .attr("fill", color)
        .append("title")
        .text(`${category} — story ${i + 1} of ${total}`);
    }
  }

  return svg.node();
}

export function legend(rows, {colors, formatLabel = (d) => d.category} = {}) {
  const el = document.createElement("div");
  el.className = "legend";
  for (const row of rows) {
    const item = document.createElement("span");
    item.className = "swatch";
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = colors(row.category);
    item.append(dot, document.createTextNode(`${formatLabel(row)} (${row.count})`));
    el.append(item);
  }
  return el;
}
