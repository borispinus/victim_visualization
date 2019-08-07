import * as d3 from "d3";
import { data, types, places } from "../mock";

import "./index.css";

const WIDTH = 0.5 * window.outerWidth - 100;
const HEIGHT = 0.65 * window.outerHeight - 200;

const PLACES_NUMBER = places.length;
const TYPES_NUMBER = types.length;

const chartView = {
  number: 1,
  damage: 2,
  result: 3
};

const MAX_RADIUS =
  Math.min(WIDTH, HEIGHT) / Math.max(PLACES_NUMBER, TYPES_NUMBER);

const COLOR = "#97BA86";
const RESULT_COLOR = "#f58a42";
const RESULT_COLOR_2 = "#FFC433";

let currentType = chartView.number;

const formatPercent = d3.format(".0%");

const range = n => Array.from(Array(n + 1).keys());

const svg = d3
  .select(".chart-svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

const resultData = data.filter(({ place }) => place === 9);

const legend = svg
  .append("g")
  .attr("class", "legend")
  .style("display", "none");

legend
  .append("text")
  .text("Процент преступлений с")
  .attr("x", WIDTH - 125)
  .attr("y", 33);
const legendEls = legend
  .selectAll(".legend-el")
  .data([1, 2])
  .enter()
  .append("g")
  .attr("class", "legend-el");

legendEls
  .append("rect")
  .attr("width", 20)
  .attr("height", 20)
  .attr("y", d => (d === 1 ? 50 : 80))
  .attr("x", WIDTH - 125)
  .attr("fill", d => (d === 1 ? RESULT_COLOR_2 : RESULT_COLOR));

legendEls
  .append("text")
  .attr("width", 20)
  .attr("height", 20)
  .attr("y", d => (d === 1 ? 65 : 95))
  .attr("x", WIDTH - 100)
  .text(d => (d === 1 ? "обращениями в органы" : "наказанным виновным"));

const svgDefs = svg.append("defs");

const gradients = svgDefs
  .selectAll("linearGradient")
  .data(resultData)
  .enter()
  .append("linearGradient")
  .attr("id", d => `gradient_${d.type}`)
  .attr("x1", 0)
  .attr("y1", 1)
  .attr("x2", 0)
  .attr("y2", 0);

gradients
  .append("stop")
  .attr("offset", 0)
  .style("stop-color", RESULT_COLOR)
  .style("stop-opacity", 1);

gradients
  .append("stop")
  .attr("offset", d => d.punishedPercentage / d.requestedPercentage)
  .style("stop-color", RESULT_COLOR)
  .style("stop-opacity", 1);

gradients
  .append("stop")
  .attr("offset", d => d.punishedPercentage / d.requestedPercentage)
  .style("stop-color", RESULT_COLOR_2)
  .style("stop-opacity", 1);

gradients
  .append("stop")
  .attr("offset", 1)
  .style("stop-color", RESULT_COLOR_2)
  .style("stop-opacity", 1);

const numberScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => Math.sqrt(d.number))])
  .range([0, MAX_RADIUS]);

const damageScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => Math.sqrt(d.damageAverage))])
  .range([0, MAX_RADIUS]);

const resultScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => Math.sqrt(d.requestedPercentage))])
  .range([0, HEIGHT]);

const ticked = () => {
  d3.selectAll(".bubble").attr("transform", d => {
    return `translate(${d.x}, ${d.y})`;
  });
};

const simulation = d3.forceSimulation(data).on("tick", ticked);

const colorByType = d => {
  if (d.place === 9) return "#f58a42";
  return COLOR;
};

const forceX = d => {
  return (d.type * WIDTH) / TYPES_NUMBER;
};

const forceY = d => {
  return (d.place * HEIGHT) / PLACES_NUMBER;
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

const xScale = d3
  .scaleLinear()
  .range([0, HEIGHT])
  .domain([0, PLACES_NUMBER]);

const xScalePercaentage = d3
  .scaleLinear()
  .range([0, HEIGHT])
  .domain([1, 0]);

const yScale = d3
  .scaleLinear()
  .range([0, WIDTH])
  .domain([0, TYPES_NUMBER]);

const xAxis = d3
  .axisTop(yScale)
  .tickValues(range(TYPES_NUMBER))
  .tickFormat(id => types[id - 1]);

const yAxis = d3
  .axisLeft(xScale)
  .tickValues(range(PLACES_NUMBER))
  .tickFormat(id => places[id - 1]);

svg
  .append("g")
  .attr("class", "axis y-axis")
  .call(xAxis)
  .selectAll(".tick text")
  .call(wrap, 100)
  .attr(
    "transform",
    WIDTH < 600 ? "translate(0, -40) rotate(-45)" : "translate(0, -20)"
  );

svg
  .append("g")
  .attr("class", "axis x-axis")
  .call(yAxis)
  .selectAll(".tick text")
  .call(wrap, 220)
  .attr("transform", "translate(-20, 0)");

const render = () => {
  const bubbles = svg.selectAll(".bubble").data(data);

  const bubblesEnter = bubbles.enter().append("g");

  bubblesEnter
    .on("mouseover", function() {
      d3.select(this).raise();

      if (chartView.result !== currentType) {
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
      } else {
        d3.selectAll(".popover-el").attr(
          "transform",
          d => `translate(0, -${(d.requestedPercentage * HEIGHT) / 2})`
        );
      }

      d3.select(this.parentNode)
        .selectAll(".circle")
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

      d3.selectAll(".popover-el").attr("transform", "translate(0, 0)");
    })
    .attr("class", "bubble");

  bubbles.merge(bubblesEnter);

  bubbles.exit().remove();

  const circles = bubbles.select(".circle").merge(bubblesEnter.append("rect"));
  const rects = bubbles.select("popover").merge(bubblesEnter.append("rect"));

  const newTexts = bubblesEnter.append("g").attr("class", "text-group");

  const newTextsNumber = newTexts
    .append("text")
    .attr("class", "text-number")
    .attr("y", 20)
    .attr("x", 6)
    .style("font-size", 10);

  newTextsNumber
    .append("tspan")
    .text(d => `${(d.numberPercentage * 100).toFixed(2)}% `)
    .attr("class", "number-tspan")
    .style("font-weight", "bold");
  newTextsNumber.append("tspan").text("от числа преступлений");

  const newTextsDamage = newTexts
    .append("text")
    .attr("class", "text-damage")
    .attr("y", 40)
    .attr("x", 6)
    .style("font-size", 10);

  newTextsDamage.append("tspan").text("Средний ущерб: ");
  newTextsDamage
    .append("tspan")
    .attr("class", "damage-tspan")
    .text(
      d =>
        `${parseInt(d.damageAverage).toLocaleString(undefined, {
          minimumFractionDigits: 2
        })} руб.`
    );

  const newTextsRequested = newTexts
    .append("text")
    .attr("class", "text-requested")
    .attr("y", 60)
    .attr("x", 6)
    .style("font-size", 10);

  newTextsRequested.append("tspan").text("В органы поступило обращение в ");
  newTextsRequested
    .append("tspan")
    .attr("class", "result-tspan")
    .text(d => `${(d.requestedPercentage * 100).toFixed(2)}%`);

  const newTextsPunished = newTexts
    .append("text")
    .attr("class", "text-number")
    .attr("y", 80)
    .attr("x", 6)
    .style("font-size", 10);

  newTextsPunished.append("tspan").text("Виновный был наказан в ");
  newTextsPunished
    .append("tspan")
    .attr("class", "result-tspan")
    .text(d => `${(d.punishedPercentage * 100).toFixed(2)}%`);

  const texts = bubbles
    .select(".text-group")
    .merge(newTexts)
    .attr("class", "popover-el")
    .style("display", "none");

  circles
    .attr("rx", d => numberScale(Math.sqrt(d.number)))
    .attr("ry", d => numberScale(Math.sqrt(d.number)))
    .attr("width", d => numberScale(Math.sqrt(d.number)))
    .attr("height", d => numberScale(Math.sqrt(d.number)))
    .attr(
      "transform",
      d =>
        `translate(${-numberScale(Math.sqrt(d.number)) / 2}, ${-numberScale(
          Math.sqrt(d.number)
        ) / 2})`
    )
    .attr("fill", colorByType)
    .attr("class", "circle");
  rects
    .attr("class", "popover")
    .attr("class", "popover-el")
    .style("display", "none")
    .attr("width", 250)
    .attr("height", 100)
    .attr("stroke", "#1a1f01")
    .attr("fill", "#fff");

  simulation
    .nodes(data)
    .force("forceX", d3.forceX(forceX).strength(0.1))
    .force("forceY", d3.forceY(forceY).strength(0.1));
};

d3.select(".number").on("click", () => {
  currentType = chartView.number;
  svg
    .selectAll(".circle")
    .transition()
    .attr("rx", d => numberScale(Math.sqrt(d.number)))
    .attr("ry", d => numberScale(Math.sqrt(d.number)))
    .attr("width", d => numberScale(Math.sqrt(d.number)))
    .attr("height", d => numberScale(Math.sqrt(d.number)))
    .attr("fill", colorByType)
    .attr(
      "transform",
      d =>
        `translate(${-numberScale(Math.sqrt(d.number)) / 2}, ${-numberScale(
          Math.sqrt(d.number)
        ) / 2})`
    )
    .style("opacity", 1);

  svg
    .select(".x-axis")
    .call(yAxis.tickFormat(id => places.slice(0, -1).concat("Всего")[id - 1]))
    .selectAll(".tick text")
    .call(wrap, 220)
    .attr("transform", "translate(-10, 0)");
  legend.style("display", "none");
  d3.select(".x-axis .tick:last-of-type ").style("font-weight", "bold");
  d3.selectAll(".number-tspan").style("font-weight", "bold");
  d3.selectAll(".damage-tspan").style("font-weight", "normal");
  d3.selectAll(".result-tspan").style("font-weight", "normal");
});

d3.select(".damage").on("click", () => {
  currentType = chartView.damage;
  svg
    .selectAll(".circle")
    .transition()
    .attr("rx", d => damageScale(Math.sqrt(d.damageAverage)))
    .attr("ry", d => damageScale(Math.sqrt(d.damageAverage)))
    .attr("width", d => damageScale(Math.sqrt(d.damageAverage)))
    .attr("height", d => damageScale(Math.sqrt(d.damageAverage)))
    .attr("fill", colorByType)
    .attr(
      "transform",
      d =>
        `translate(${-damageScale(Math.sqrt(d.damageAverage)) /
          2}, ${-damageScale(Math.sqrt(d.damageAverage)) / 2})`
    )
    .style("opacity", 1);

  svg
    .select(".x-axis")
    .call(
      yAxis.tickFormat(id => places.slice(0, -1).concat("В среднем")[id - 1])
    )
    .selectAll(".tick text")
    .call(wrap, 220)
    .attr("transform", "translate(-10, 0)");
  legend.style("display", "none");
  d3.select(".x-axis .tick:last-of-type ").style("font-weight", "bold");

  d3.selectAll(".number-tspan").style("font-weight", "normal");
  d3.selectAll(".damage-tspan").style("font-weight", "bold");
  d3.selectAll(".result-tspan").style("font-weight", "normal");
});

d3.select(".result").on("click", () => {
  currentType = chartView.result;
  svg
    .selectAll(".circle")
    .attr("fill", d =>
      d.place === 9 ? `url(#gradient_${d.type})` : colorByType(d)
    )
    .transition()
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("height", d =>
      d.place === 9 ? resultScale(d.requestedPercentage) : 0
    )
    .attr("width", d => (d.place === 9 ? WIDTH / 15 : 0))
    .attr("transform", d =>
      d.place === 9
        ? `translate(${-WIDTH / 30}, ${-resultScale(d.requestedPercentage)})`
        : `translate(0, 0)`
    )
    .style("opacity", d => (d.place === 9 ? 1 : 0));

  d3.select(".x-axis")
    .call(d3.axisLeft(xScalePercaentage).tickFormat(formatPercent))
    .selectAll(".tick text")
    .call(wrap, 220)
    .attr("transform", "translate(-10, 0)");
  legend.style("display", null);
  d3.select(".x-axis .tick:last-of-type ").style("font-weight", "normal");

  d3.selectAll(".number-tspan").style("font-weight", "normal");
  d3.selectAll(".damage-tspan").style("font-weight", "normal");
  d3.selectAll(".result-tspan").style("font-weight", "bold");
});

render();

/*src/index.js:470
d3.csv("dataset.csv", d => {
  return {
    crimePlace: d.crime_place_grouped,
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
      crimeType: ct,
      victimDamageRub: damage,
      isRequested,
      isPunished
    } = datum;

    const crimeType = ct === "8" ? "7" : ct;

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

    if (!newDataObject[`${crimeType}_9`]) {
      newDataObject[`${crimeType}_9`] = {
        damage: 0,
        number: 0,
        type: parseInt(crimeType),
        place: 9,
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
    newDataObject[`${crimeType}_${crimePlace}`].punishedNumber +=
      parseInt(isPunished) === 1 ? 1 : 0;
    newDataObject[`${crimeType}_${crimePlace}`].requestedNumber +=
      parseInt(isRequested) === 1 ? 1 : 0;
    newDataObject[`${crimeType}_${crimePlace}`].requestedPercentage =
      newDataObject[`${crimeType}_${crimePlace}`].requestedNumber /
      newDataObject[`${crimeType}_${crimePlace}`].number;
    newDataObject[`${crimeType}_${crimePlace}`].punishedPercentage =
      newDataObject[`${crimeType}_${crimePlace}`].punishedNumber /
      newDataObject[`${crimeType}_${crimePlace}`].number;

    newDataObject[`${crimeType}_9`].number =
      newDataObject[`${crimeType}_9`].number + 1;
    newDataObject[`${crimeType}_9`].numberPercentage =
      newDataObject[`${crimeType}_9`].number / dataFiltered.length;
    newDataObject[`${crimeType}_9`].damage += parseInt(damage, 10);
    newDataObject[`${crimeType}_9`].damageAverage =
      newDataObject[`${crimeType}_9`].damage /
      newDataObject[`${crimeType}_9`].number;
    newDataObject[`${crimeType}_9`].punishedNumber +=
      parseInt(isPunished) === 1 ? 1 : 0;
    newDataObject[`${crimeType}_9`].requestedNumber +=
      parseInt(isRequested) === 1 ? 1 : 0;
    newDataObject[`${crimeType}_9`].requestedPercentage =
      newDataObject[`${crimeType}_9`].requestedNumber /
      newDataObject[`${crimeType}_9`].number;
    newDataObject[`${crimeType}_9`].punishedPercentage =
      newDataObject[`${crimeType}_9`].punishedNumber /
      newDataObject[`${crimeType}_9`].number;
  }
  console.log(JSON.stringify(Object.values(newDataObject)));
});
*/
