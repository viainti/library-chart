import type { OHLCData } from './types';

export interface CoordinateSystem {
  pixelToPrice: (pixelY: number, chartHeight: number, minPrice: number, maxPrice: number) => number;
  priceToPixel: (price: number, chartHeight: number, minPrice: number, maxPrice: number) => number;
  pixelToTime: (pixelX: number, chartWidth: number, dataLength: number) => number;
  timeToPixel: (timeIndex: number, chartWidth: number, dataLength: number) => number;
  snapToCandle: (pixelX: number, chartWidth: number, dataLength: number) => number;
  snapToPrice: (pixelY: number, chartHeight: number, minPrice: number, maxPrice: number, step?: number) => number;
}

export const createCoordinateSystem = (): CoordinateSystem => ({
  pixelToPrice: (pixelY, chartHeight, minPrice, maxPrice) => {
    const priceRange = maxPrice - minPrice;
    return maxPrice - (pixelY / chartHeight) * priceRange;
  },

  priceToPixel: (price, chartHeight, minPrice, maxPrice) => {
    const priceRange = maxPrice - minPrice;
    return ((maxPrice - price) / priceRange) * chartHeight;
  },

  pixelToTime: (pixelX, chartWidth, dataLength) => {
    return Math.floor((pixelX / chartWidth) * dataLength);
  },

  timeToPixel: (timeIndex, chartWidth, dataLength) => {
    return (timeIndex / dataLength) * chartWidth;
  },

  snapToCandle: (pixelX, chartWidth, dataLength) => {
    const candleIndex = Math.round((pixelX / chartWidth) * dataLength);
    return Math.max(0, Math.min(dataLength - 1, candleIndex));
  },

  snapToPrice: (pixelY, chartHeight, minPrice, maxPrice, step = 0.01) => {
    const price = maxPrice - (pixelY / chartHeight) * (maxPrice - minPrice);
    return Math.round(price / step) * step;
  }
});

export const getDataBounds = (data: OHLCData[]) => {
  if (!data.length) return { minPrice: 0, maxPrice: 0, minVolume: 0, maxVolume: 0 };

  const prices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
  const volumes = data.map(d => d.volume || 0);

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minVolume: Math.min(...volumes),
    maxVolume: Math.max(...volumes)
  };
};