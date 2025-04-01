import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';

interface HeatmapData {
  date: string;
  hour: number;
  intensity: number;
}

interface WorkoutHeatmapProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
}

export const WorkoutHeatmap: React.FC<WorkoutHeatmapProps> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.date))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleBand()
      .domain(d3.range(24).map(String))
      .range([0, innerHeight])
      .padding(0.1);

    const color = d3
      .scaleSequential()
      .domain([0, d3.max(data, d => d.intensity) || 100])
      .interpolator(d3.interpolateInferno);

    // Draw heatmap cells
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.date) || 0)
      .attr('y', d => y(String(d.hour)) || 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => color(d.intensity))
      .attr('rx', 2)
      .attr('ry', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Show tooltip
        const tooltip = d3.select('#heatmap-tooltip');
        tooltip
          .style('opacity', 1)
          .html(`
            Date: ${format(new Date(d.date), 'MMM dd, yyyy')}<br/>
            Hour: ${d.hour}:00<br/>
            Intensity: ${d.intensity}
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', 'none');

        // Hide tooltip
        d3.select('#heatmap-tooltip')
          .style('opacity', 0);
      });

    // Add axes
    const xAxis = d3.axisBottom(x)
      .tickFormat(d => format(new Date(d), 'MMM dd'));
    const yAxis = d3.axisLeft(y)
      .tickFormat(d => `${d}:00`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g')
      .call(yAxis);

    // Add color legend
    const legendWidth = 20;
    const legendHeight = innerHeight;
    const legendScale = d3
      .scaleSequential()
      .domain([0, 100])
      .interpolator(d3.interpolateInferno);

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);

    const legendGradient = legend
      .append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('gradientTransform', 'rotate(90)');

    legendGradient
      .selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .join('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => legendScale(d * 100));

    legend
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    const legendAxis = d3
      .axisRight(d3.scaleLinear().domain([0, 100]).range([legendHeight, 0]))
      .ticks(5);

    legend
      .append('g')
      .attr('transform', `translate(${legendWidth},0)`)
      .call(legendAxis);

  }, [data, width, height]);

  return (
    <div className="relative">
      <svg ref={svgRef} />
      <div
        id="heatmap-tooltip"
        className="absolute pointer-events-none bg-white dark:bg-gray-800 p-2 rounded shadow-lg opacity-0 transition-opacity duration-200"
        style={{ zIndex: 10 }}
      />
    </div>
  );
};