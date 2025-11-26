'use client';


import React, { useRef, useEffect } from 'react';
import type { ChartProps, OHLCData } from './types';

const Chart: React.FC<ChartProps> = ({ data, width = 800, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    // Find min and max values
    const highs = data.map((d: OHLCData) => d.high);
    const lows = data.map((d: OHLCData) => d.low);
    const minPrice = Math.min(...lows);
    const maxPrice = Math.max(...highs);

    const priceRange = maxPrice - minPrice;
    const candleWidth = width / data.length;

    data.forEach((candle: OHLCData, index: number) => {
      const x = index * candleWidth;
      const yHigh = ((maxPrice - candle.high) / priceRange) * height;
      const yLow = ((maxPrice - candle.low) / priceRange) * height;
      const yOpen = ((maxPrice - candle.open) / priceRange) * height;
      const yClose = ((maxPrice - candle.close) / priceRange) * height;

      // Draw high-low line
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, yHigh);
      ctx.lineTo(x + candleWidth / 2, yLow);
      ctx.stroke();

      // Draw open-close body
      const bodyHeight = Math.abs(yClose - yOpen);
      const bodyY = Math.min(yOpen, yClose);
      const isGreen = candle.close > candle.open;

      ctx.fillStyle = isGreen ? 'green' : 'red';
      ctx.fillRect(x + candleWidth * 0.1, bodyY, candleWidth * 0.8, bodyHeight);

      // Draw open/close wicks if body is small
      if (bodyHeight < 1) {
        ctx.strokeStyle = isGreen ? 'green' : 'red';
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, yOpen);
        ctx.lineTo(x + candleWidth / 2, yClose);
        ctx.stroke();
      }
    });
  }, [data, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Chart;