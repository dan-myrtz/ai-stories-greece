import * as d3 from "../vendor/d3.js";
import {sankey, sankeyLinkHorizontal} from "../vendor/d3-sankey.js";

const STAGE_COLOR = {
  role: "var(--series-1)",
  conflict: "var(--series-2)",
  resolution: "var(--series-3)",
};

const STAGE_LABEL = {
  role: "protagonist role",
  conflict: "core conflict",
  resolution: "resolution",
};

// Three-stage Sankey: protagonist_role -> core_conflict -> resolution_type.
// Nodes/links are colored by stage (3 categorical slots), with every node
// directly labeled — the specific category always reads from text, never
// from hue alone.
export function flowChart({nodes, links}, {width = 720, height = 520} = {}) {
  const stageOrder = {role: 0, conflict: 1, resolution: 2};
  const nodeById = new Map(nodes.map((d) => [d.id, d]));

  const graph = sankey()
    .nodeId((d) => d.id)
    .nodeAlign((d) => stageOrder[d.stage])
    .nodeWidth(14)
    .nodePadding(10)
    .extent([
      [1, 20],
      [width - 1, height - 20],
    ])({
    nodes: nodes.map((d) => ({...d})),
    links: links.map((d) => ({...d})),
  });

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height)
    .attr("role", "img")
    .attr("aria-label", "Flow from protagonist role to core conflict to resolution");

  svg
    .append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", (d) => STAGE_COLOR[d.source.stage])
    .attr("stroke-opacity", 0.25)
    .attr("stroke-width", (d) => Math.max(1, d.width))
    .append("title")
    .text((d) => `${d.source.label} → ${d.target.label}: ${d.value}`);

  const node = svg
    .append("g")
    .selectAll("g")
    .data(graph.nodes)
    .join("g");

  node
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("rx", 2)
    .attr("fill", (d) => STAGE_COLOR[d.stage])
    .append("title")
    .text((d) => `${STAGE_LABEL[d.stage]}: ${d.label} (${d.value})`);

  node
    .append("text")
    .attr("x", (d) => (stageOrder[d.stage] === 2 ? d.x0 - 8 : d.x1 + 8))
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) => (stageOrder[d.stage] === 2 ? "end" : "start"))
    .attr("font-size", 11)
    .attr("fill", "var(--text-secondary)")
    .text((d) => `${d.label} (${d.value})`);

  return svg.node();
}

export {STAGE_COLOR, STAGE_LABEL};
