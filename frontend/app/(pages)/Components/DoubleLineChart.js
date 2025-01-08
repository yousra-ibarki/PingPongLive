// components/DoubleLineChart.js
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DoubleLineChart = ({ data, options }) => {
  const chartRef = useRef(null); // Create a reference for the canvas element

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      // Create the line chart instance
      const chart = new Chart(ctx, {
        type: 'line', // Specify the chart type as line
        data, // The data for the chart (includes the two lines)
        options, // The options to configure the chart
      });

      // Cleanup chart instance on component unmount
      return () => {
        chart.destroy();
      };
    }
  }, [data, options]);

  return <canvas ref={chartRef} />;
};

export default DoubleLineChart;
