import * as d3 from "d3";
import { data, types, places } from "../mock";

import "./index.css";

const WIDTH = 0.8 * window.outerWidth - 100;
const HEIGHT = 0.8 * window.outerHeight - 200;

const PLACES_NUMBER = places.length;
const TYPES_NUMBER = types.length;

const MAX_RADIUS =
  Math.min(WIDTH, HEIGHT) / Math.max(PLACES_NUMBER, TYPES_NUMBER);

const COLOR = "#97BA86";

const range = n => Array.from(Array(n + 1).keys());

const svg = d3
  .select(".chart-svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

const numberRadiusScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => d.number)])
  .range([0, MAX_RADIUS]);

const damageRadiusScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => d.damageAverage)])
  .range([0, MAX_RADIUS]);

const ticked = () => {
  d3.selectAll(".bubble").attr("transform", d => {
    return `translate(${d.x}, ${d.y})`;
  });
};

const simulation = d3.forceSimulation(data).on("tick", ticked);

const colorByType = d => {
  return COLOR;
};

const forceX = d => {
  return (d.place * WIDTH) / PLACES_NUMBER;
};

const forceY = d => {
  return (d.type * HEIGHT) / TYPES_NUMBER;
};

function wrap(text, width) {
  text.each(function() {
    let text = d3.select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

d3.select("button.number").on("click", () => {
  svg
    .selectAll("circle")
    .transition()
    .attr("r", d => numberRadiusScale(d.number));
});

d3.select("button.damage").on("click", () => {
  svg
    .selectAll("circle")
    .transition()
    .attr("r", d => damageRadiusScale(d.damageAverage));
});

const yScale = d3
  .scaleLinear()
  .range([0, HEIGHT])
  .domain([0, TYPES_NUMBER]);

const xScale = d3
  .scaleLinear()
  .range([0, WIDTH])
  .domain([0, PLACES_NUMBER]);

const xAxis = d3
  .axisTop(xScale)
  .tickValues(range(PLACES_NUMBER))
  .tickFormat(id => places[id - 1]);

const yAxis = d3
  .axisLeft(yScale)
  .tickValues(range(TYPES_NUMBER))
  .tickFormat(id => types[id - 1]);

svg
  .append("g")
  .attr("class", "axis x-axis")
  .call(xAxis)
  .selectAll(".tick text")
  .call(wrap, 100)
  .attr("transform", "translate(0, -50) rotate(-45)");

svg
  .append("g")
  .attr("class", "axis y-axis")
  .call(yAxis)
  .selectAll(".tick text")
  .call(wrap, WIDTH / PLACES_NUMBER)
  .attr("transform", "translate(-20, 0)");

const render = () => {
  const bubbles = svg.selectAll(".bubble").data(data);

  const bubblesEnter = bubbles.enter().append("g");

  bubblesEnter
    .on("mouseover", function() {
      d3.select(this).raise();
      d3.select(this)
        .append("line")
        .attr("class", "verticalGrid")
        .attr("y2", d => -1 * forceY(d))
        .attr("x2", 0);

      d3.select(this)
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("y2", 0)
        .attr("x2", d => -1 * forceX(d));

      d3.select(this)
        .selectAll("line")
        .attr("class", "horizontalGrid")
        .attr("y1", 0)
        .attr("x1", 0)
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
        .attr("stroke-dasharray", 4)
        .attr("stroke", COLOR)
        .attr("stroke-width", "1px");

      d3.select(this.parentNode)
        .selectAll("circle")
        .raise();
      d3.select(this)
        .selectAll(".popover-el")
        .raise();

      d3.select(this)
        .selectAll(".popover-el")
        .style("display", null);
    })
    .on("mouseout", function() {
      d3.select(this)
        .selectAll(".popover-el")
        .style("display", "none");

      d3.select(this)
        .selectAll("line")
        .remove();
    })
    .attr("class", "bubble");

  bubbles.merge(bubblesEnter);

  bubbles.exit().remove();

  const circles = bubbles.select("circle").merge(bubblesEnter.append("circle"));
  const rects = bubbles.select("rect").merge(bubblesEnter.append("rect"));

  const newTexts = bubblesEnter.append("g").attr("class", "text-group");

  newTexts
    .append("text")
    .attr("class", "text-number")
    .text(d => `${(d.numberPercentage * 100).toFixed(2)}% от общего количества`)
    .attr("y", 20)
    .attr("x", 6)
    .style("font-size", 10);

  newTexts
    .append("text")
    .attr("class", "text-number")
    .text(
      d =>
        `Средний ущерб: ${parseInt(d.damageAverage).toLocaleString(undefined, {
          minimumFractionDigits: 2
        })} руб`
    )
    .attr("y", 40)
    .attr("x", 6)
    .style("font-size", 10);

  newTexts
    .append("text")
    .attr("class", "text-number")
    .text(
      d =>
        `В ораны поступило обращение в ${(d.requestedPercentage * 100).toFixed(2)}%`
    )
    .attr("y", 60)
    .attr("x", 6)
    .style("font-size", 10);

  newTexts
    .append("text")
    .attr("class", "text-number")
    .text(
      d =>
        `Виновный был наказан в ${(d.punishedPercentage * 100).toFixed(2)}%`
    )
    .attr("y", 80)
    .attr("x", 6)
    .style("font-size", 10);

  const texts = bubbles
    .select(".text-group")
    .merge(newTexts)
    .attr("class", "popover-el")
    .style("display", "none");

  circles.attr("r", d => numberRadiusScale(d.number)).attr("fill", colorByType);
  rects
    .attr("class", "popover")
    .attr("class", "popover-el")
    .style("display", "none")
    .attr("width", 220)
    .attr("height", 100)
    .attr("stroke", "#1a1f01")
    .attr("fill", "#fff");

  simulation
    .nodes(data)
    .force("forceX", d3.forceX(forceX).strength(0.1))
    .force("forceY", d3.forceY(forceY).strength(0.1));
};

render();

d3.csv("dataset.csv", d => {
  return {
    crimePlace: d.crime_place,
    victimDamageRub: d.victim_damage_rub,
    crimeType: d.crime_type,
    isRequested: d.Q40,
    isPunished: d.victim_is_offender_punished
  };
}).then(data => {
  const dataFiltered = data.filter(
    ({ crimeType, crimePlace }) => parseInt(crimePlace) && parseInt(crimeType)
  );
  const newDataObject = {};

  for (const datum of dataFiltered) {
    const {
      crimePlace,
      crimeType,
      victimDamageRub: damage,
      isRequested,
      isPunished
    } = datum;
    if (!newDataObject[`${crimeType}_${crimePlace}`]) {
      newDataObject[`${crimeType}_${crimePlace}`] = {
        damage: 0,
        number: 0,
        type: parseInt(crimeType),
        place: parseInt(crimePlace),
        requestedNumber: 0,
        punishedNumber: 0
      };
    }
    newDataObject[`${crimeType}_${crimePlace}`].number =
      newDataObject[`${crimeType}_${crimePlace}`].number + 1;
    newDataObject[`${crimeType}_${crimePlace}`].numberPercentage =
      newDataObject[`${crimeType}_${crimePlace}`].number / dataFiltered.length;
    newDataObject[`${crimeType}_${crimePlace}`].damage += parseInt(damage, 10);
    newDataObject[`${crimeType}_${crimePlace}`].damageAverage =
      newDataObject[`${crimeType}_${crimePlace}`].damage /
      newDataObject[`${crimeType}_${crimePlace}`].number;
    newDataObject[`${crimeType}_${crimePlace}`].punishedNumber += parseInt(isPunished) === 1 ? 1 : 0;
    newDataObject[`${crimeType}_${crimePlace}`].requestedNumber += parseInt(isRequested) === 1 ? 1 : 0;
    newDataObject[`${crimeType}_${crimePlace}`].requestedPercentage =
      newDataObject[`${crimeType}_${crimePlace}`].requestedNumber /
      newDataObject[`${crimeType}_${crimePlace}`].number;
    newDataObject[`${crimeType}_${crimePlace}`].punishedPercentage =
      newDataObject[`${crimeType}_${crimePlace}`].punishedNumber /
      newDataObject[`${crimeType}_${crimePlace}`].number;
  }
  console.log(
    JSON.stringify(
      Object.values(newDataObject).filter(({ number }) => number > 10)
    )
  );
});
