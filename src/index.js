import * as d3 from "d3";
import data from "../mock";

import "./index.css";

const WIDTH = 0.8 * window.innerWidth;
const HEIGHT = 0.8 * window.innerHeight;
const MAX_RADIUS = 100;

const TOTAL_COLOR = "#97BA86";
const ONLINE_COLOR = "#ECB031";
const OFFLINE_COLOR = "#31C7EC";

const svg = d3
  .select(".chart-svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

const radiusScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => d.number)])
  .range([0, MAX_RADIUS]);

const ticked = () => {
  d3.selectAll(".bubble").attr("transform", d => {
    return `translate(${d.x}, ${d.y})`;
  });
};

const simulation = d3.forceSimulation(data).on("tick", ticked);


const colorByType = d => {
  return OFFLINE_COLOR;
};

const forceX = d => {
  return (0.8 * d.place * WIDTH) / 14;
};

const forceY = d => {
  return (0.8 * d.type * HEIGHT) / 8;
};

const render = () => {
  const bubbles = svg.selectAll(".bubble").data(data);

  const bubblesEnter = bubbles
    .enter()
    .append("g")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT / 2);

  bubblesEnter
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

  bubbles.merge(bubblesEnter);

  bubbles.exit().remove();

  const circles = bubbles.select("circle").merge(bubblesEnter.append("circle"));
  const rects = bubbles.select("rect").merge(bubblesEnter.append("rect"));

  const newTexts = bubblesEnter.append("g").attr("class", "text-group");
  newTexts
    .append("text")
    .attr("class", "text-category")
    .text(d => d.name)
    .attr("y", 25)
    .attr("x", 6);
  newTexts
    .append("text")
    .attr("class", "text-number")
    .text(d => `${d.number}% от общего количества`)
    .attr("y", 50)
    .attr("x", 6)
    .style("font-size", 10);

  const texts = bubbles
    .select("g")
    .merge(newTexts)
    .attr("class", "popover-el")
    .style("display", "none");

  circles
    .attr("r", ({ number }) => radiusScale(number))
    .attr("fill", colorByType);
  rects
    .attr("class", "popover")
    .attr("class", "popover-el")
    .style("display", "none")
    .attr("width", 200)
    .attr("height", 100)
    .attr("stroke", "#1a1f01")
    .attr("fill", "#fff");

  simulation
    .nodes(data)
    .force("forceX", d3.forceX(forceX).strength(0.1))
    .force("forceY", d3.forceY(forceY).strength(0.1));
};

// d3.csv("dataset.csv", d => {
//   return {
//     crimePlace: d.crime_place,
//     victimDamageRub: d.victim_damage_rub,
//     crimeType: d.crime_type
//   };
// }).then(data => {
//   const dataFiltered = data.filter(
//     ({ victimDamageRub }) =>
//       !isNaN(parseFloat(victimDamageRub)) && victimDamageRub > 0
//   );
//   const newDataObject = {};
//   for (const datum of dataFiltered) {
//     const { crimePlace, crimeType, victimDamageRub: damage } = datum;
//     if (!newDataObject[`${crimeType}_${crimePlace}`]) {
//       newDataObject[`${crimeType}_${crimePlace}`] = {
//         damage: 0,
//         number: 0,
//         type: parseInt(crimeType),
//         place: parseInt(crimePlace),
//       };
//     }
//     newDataObject[`${crimeType}_${crimePlace}`].number = newDataObject[`${crimeType}_${crimePlace}`].number + 1;
//     newDataObject[`${crimeType}_${crimePlace}`].damage+=parseInt(damage, 10);
//   }
//   console.log(JSON.stringify(Object.values(newDataObject)))
// });

render();
