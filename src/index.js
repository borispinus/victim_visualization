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

const render = type => {
  const bubbles = g.selectAll(".bubble").data(data[type]);

  const bubblesEnter = bubbles
    .enter()
    .append("g")
    .on("mouseover", function() {
      d3.select(this).raise();
      d3.select(this)
        .select(".popover")
        .style("display", null);
    })
    .on("mouseout", function() {
      d3.select(this)
        .select(".popover")
        .style("display", "none");
    })
    .attr("class", "bubble");

  bubbles
    .exit()
    .transition()
    .attr("transform", "translate(-300, 0)")
    .duration(200)
    .remove();

  bubblesEnter
    .append("circle")
    .merge(bubbles.select("circle"))
    .transition(t)
    .attr("transform", d => {
      let x = -300;
      if (d.type === "total") {
        x = 0;
      } else if (d.type === "online") {
        x = 300;
      }
      return `translate(${x}, 0)`;
    })
    .attr("r", ({ number }) => radiusScale(number))
    .attr("fill", "#C7A28F")
    .duration(200);

  bubblesEnter
    .append("rect")
    .merge(bubbles.select("rect"))
    .transition(t)
    .attr("transform", d => {
      let x = -300;
      if (d.type === "total") {
        x = 0;
      } else if (d.type === "online") {
        x = 300;
      }
      return `translate(${x}, 0)`;
    })
    .attr("class", "popover")
    .style("display", "none")
    .attr("width", 200)
    .attr("height", 100)
    .attr("stroke", "#1a1f01")
    .attr("fill", "#fff")
    .duration(200);

  simulation
    .nodes(data[type])
    .force("collide", d3.forceCollide(({ number }) => radiusScale(number) + 2))
    .alphaTarget(1);
};

render("total");
