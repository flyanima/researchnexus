import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Artifact } from '../types';

interface TimelineChartProps {
  artifacts: Artifact[];
  onArtifactClick: (artifact: Artifact) => void;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ artifacts, onArtifactClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!artifacts.length || !svgRef.current || !containerRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth;
    const height = 150;
    const margin = { top: 20, right: 30, bottom: 40, left: 30 };
    const width = containerWidth - margin.left - margin.right;

    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parsedData = artifacts.map(a => ({
      ...a,
      parsedDate: new Date(a.date)
    })).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    if (parsedData.length === 0) return;

    // Scales
    const timeExtent = d3.extent(parsedData, d => d.parsedDate) as [Date, Date];
    // Add some buffer to the dates
    const startDate = new Date(timeExtent[0].getTime() - 86400000 * 7); // -7 days
    const endDate = new Date(timeExtent[1].getTime() + 86400000 * 7); // +7 days

    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);

    // Axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %Y") as any);
    
    const axisGroup = svg.append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .attr('class', 'text-slate-400')
      .call(xAxis);
      
    axisGroup.select(".domain")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.5);

    svg.selectAll(".tick line")
      .attr("stroke", "#cbd5e1");
      
    // Animate Axis Fade In
    axisGroup.style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    // Line connecting points - Animation: Draw from left to right
    const line = svg.append('line')
      .attr('x1', 0)
      .attr('y1', height / 2)
      .attr('x2', 0) // Start with length 0
      .attr('y2', height / 2)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round');

    line.transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('x2', width);

    // Tooltip
    const tooltip = d3.select(containerRef.current)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#0f172a")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "8px")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("pointer-events", "none")
        .style("z-index", "10")
        .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)")
        .style("transition", "all 0.1s ease");

    // Circles - Animation: Pop in with staggering
    const circles = svg.selectAll('circle')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.parsedDate))
      .attr('cy', height / 2)
      .attr('r', 0) // Start radius 0
      .attr('fill', d => {
        if (d.type === 'HTML') return '#3b82f6';
        if (d.type === 'PDF') return '#ef4444';
        return '#10b981';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'cursor-pointer focus:outline-none');

    circles.transition()
      .delay((d, i) => 500 + i * 150) // Wait for line to start drawing, then stagger
      .duration(600)
      .ease(d3.easeElasticOut)
      .attr('r', 8);

    // Interactions
    circles
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 14)
          .attr('stroke-width', 3)
          .attr('filter', 'drop-shadow(0px 0px 8px rgba(0,0,0,0.2))');
          
        tooltip.style("visibility", "visible")
               .style("opacity", "0")
               .html(`<div class="font-bold mb-1">${d.title}</div><div class="text-slate-300 text-xs">${new Date(d.date).toLocaleDateString()}</div>`)
               .transition()
               .duration(200)
               .style("opacity", "1");
      })
      .on('mousemove', function(event) {
         tooltip.style("top", (event.pageY - 60) + "px")
                .style("left", (event.pageX + 10) + "px");
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('stroke-width', 2)
          .attr('filter', 'none');
          
        tooltip.style("visibility", "hidden");
      })
      .on('click', (event, d) => onArtifactClick(d));

  }, [artifacts, onArtifactClick]);

  return (
    <div ref={containerRef} className="w-full relative select-none">
      <svg ref={svgRef} className="overflow-visible"></svg>
    </div>
  );
};

export default TimelineChart;