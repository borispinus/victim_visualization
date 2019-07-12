import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const Chart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", 700)
      .attr("height", 300);
  });

  return <div ref={chartRef} />;
};

export default Chart;
