import * as d3 from "d3";
import { totalData, offlineData, onlineData } from "../mock";

import "./index.css";

const data = {
  total: totalData,
  byType: offlineData.concat(onlineData)
};

const WIDTH = 0.8 * window.innerWidth;
const HEIGHT = 0.8 * window.innerHeight;
const MAX_RADIUS = 100;

const TOTAL_COLOR = "#97BA86";
const ONLINE_COLOR = "#ECB031";
const OFFLINE_COLOR = "#31C7EC";

const initialType = "total";
const t = d3.transition().duration(1500);

const svg = d3
  .select(".chart-svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

const g = svg
  .append("g")
  .attr("transform", `translate(${WIDTH / 2}, ${HEIGHT / 2})`);

const radiusScale = d3
  .scaleLinear()
  .domain([0, d3.max(data[initialType], d => d.number)])
  .range([0, MAX_RADIUS]);

const ticked = () => {
  d3.selectAll(".bubble").attr("transform", d => {
    return `translate(${d.x}, ${d.y})`;
  });
};

const simulation = d3
  .forceSimulation(data[initialType])
  .force("charge", d3.forceManyBody().strength(-15))
  .force("forceX", d3.forceX().strength(0.05))
  .force("forceY", d3.forceY().strength(0.05))
  .force("center", d3.forceCenter())
  .on("tick", ticked);

d3.select(".decade-btn").on("click", () => {
  render("byType");
});

d3.select(".combine-btn").on("click", () => {
  render("total");
});

const transformByType = d => {
  let x = -300;
  if (d.type === "total") {
    x = 0;
  } else if (d.type === "online") {
    x = 300;
  }
  return `translate(${x}, 0)`;
};

const colorByType = d => {
  if (d.type === "total") {
    return TOTAL_COLOR;
  } else if (d.type === "online") {
    return ONLINE_COLOR;
  }
  return OFFLINE_COLOR;
};

const render = type => {
  const bubbles = g.selectAll(".bubble").data(data[type]);

  const bubblesEnter = bubbles
    .enter()
    .append("g")
    .on("mouseover", function() {
      d3.select(this).raise();
      d3.select(this)
        .selectAll(".popover-el")
        .style("display", null);
    })
    .on("mouseout", function() {
      d3.select(this)
        .selectAll(".popover-el")
        .style("display", "none");
    })
    .attr("class", "bubble");

  bubbles
    .exit()
    .transition()
    .attr("transform", "translate(-300, 0)")
    .duration(200)
    .remove();

  const circles = bubblesEnter.append("circle").merge(bubbles.select("circle"));
  const rects = bubblesEnter.append("rect").merge(bubbles.select("rect"));

  const newTexts = bubblesEnter.append("g").attr("class", "text-group");
  newTexts
    .append("text")
    .attr("class", "text-category")
    .text(d => d.name)
    .attr('y', '1.5rem')
    .attr('x', 6);
  newTexts
    .append("text")
    .attr("class", "text-number")
    .text(d => `${d.number}% от общего количества`)
    .attr('y', '3rem')
    .attr('x', 6)
    .style('font-size', 10);

  const texts = newTexts
    .merge(bubbles.select("g"))
    .attr("class", "popover-el")
    .style("display", "none");

  circles
    .transition(t)
    .attr("transform", transformByType)
    .attr("r", ({ number }) => radiusScale(number))
    .attr("fill", colorByType)
    .duration(200);
  rects
    .transition(t)
    .attr("transform", transformByType)
    .attr("class", "popover")
    .attr("class", "popover-el")
    .style("display", "none")
    .attr("width", 200)
    .attr("height", 100)
    .attr("stroke", "#1a1f01")
    .attr("fill", "#fff")
    .duration(200);

  texts.transition(t).attr("transform", transformByType);

  simulation
    .nodes(data[type])
    .force("collide", d3.forceCollide(({ number }) => radiusScale(number) + 2))
    .alphaTarget(1);
};

render("total");
