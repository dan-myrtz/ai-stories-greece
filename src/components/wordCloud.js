import * as d3 from "../vendor/d3.js";
import cloud from "../vendor/d3-cloud.js";

// Renders a word cloud sized by frequency/count. Returns a Promise<SVGElement>
// since d3-cloud's layout runs asynchronously. Always pair this with a
// visible ranked list elsewhere on the page — size-only encoding here is a
// mood board, not the precise reading (that's what the list is for).
export function wordCloud(
  rows,
  {
    width = 640,
    height = 420,
    text = (d) => d.word,
    value = (d) => d.frequency,
    color = () => "var(--series-1)",
    minSize = 12,
    maxSize = 64,
    font = "var(--font-display)",
  } = {}
) {
  const extent = d3.extent(rows, value);
  const size = d3.scaleSqrt().domain(extent).range([minSize, maxSize]);

  return new Promise((resolve) => {
    cloud()
      .size([width, height])
      .words(rows.map((d) => ({...d, text: text(d), size: size(value(d))})))
      .padding(3)
      .rotate(0)
      .font("sans-serif") // measurement font; drawn font is applied separately below
      .fontSize((d) => d.size)
      .on("end", (placed) => resolve(draw(placed)))
      .start();
  });

  function draw(placed) {
    const svg = d3
      .create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height)
      .attr("role", "img")
      .attr("aria-label", `Word cloud: ${placed.map((d) => d.text).join(", ")}`);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    g.selectAll("text")
      .data(placed)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("font-size", (d) => `${d.size}px`)
      .attr("font-family", font)
      .attr("fill", (d) => color(d))
      .text((d) => d.text)
      .append("title")
      .text((d) => `${d.text}: ${d.frequency ?? d.count}`);

    return svg.node();
  }
}
