import { SMA, EMA, RSI, MACD } from 'technicalindicators';
import type { OHLCData, IndicatorData } from './types';

export class IndicatorCalculator {
  static calculateSMA(data: OHLCData[], period: number): IndicatorData {
    const closes = data.map(d => d.close);
    const smaValues = SMA.calculate({ period, values: closes });

    return {
      name: `SMA(${period})`,
      type: 'line',
      data: smaValues,
      color: '#2962ff',
      style: 'solid',
      width: 2
    };
  }

  static calculateEMA(data: OHLCData[], period: number): IndicatorData {
    const closes = data.map(d => d.close);
    const emaValues = EMA.calculate({ period, values: closes });

    return {
      name: `EMA(${period})`,
      type: 'line',
      data: emaValues,
      color: '#ff6b35',
      style: 'solid',
      width: 2
    };
  }

  static calculateRSI(data: OHLCData[], period: number = 14): IndicatorData {
    const closes = data.map(d => d.close);
    const rsiValues = RSI.calculate({ period, values: closes });

    return {
      name: `RSI(${period})`,
      type: 'line',
      data: rsiValues,
      color: '#00d4aa',
      style: 'solid',
      width: 1
    };
  }

  static calculateMACD(data: OHLCData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: IndicatorData;
    signal: IndicatorData;
    histogram: IndicatorData;
  } {
    const closes = data.map(d => d.close);
    const macdResult = MACD.calculate({
      fastPeriod,
      slowPeriod,
      signalPeriod,
      values: closes,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });

    return {
      macd: {
        name: `MACD(${fastPeriod},${slowPeriod},${signalPeriod})`,
        type: 'line',
        data: macdResult.map(d => d.MACD || 0),
        color: '#2962ff',
        style: 'solid',
        width: 1
      },
      signal: {
        name: 'Signal',
        type: 'line',
        data: macdResult.map(d => d.signal || 0),
        color: '#ff6b35',
        style: 'solid',
        width: 1
      },
      histogram: {
        name: 'MACD Histogram',
        type: 'histogram',
        data: macdResult.map(d => d.histogram || 0),
        color: '#00d4aa',
        width: 2
      }
    };
  }
}

export const AVAILABLE_INDICATORS = [
  { name: 'SMA', label: 'Simple Moving Average', params: [{ name: 'period', type: 'number', default: 20 }] },
  { name: 'EMA', label: 'Exponential Moving Average', params: [{ name: 'period', type: 'number', default: 20 }] },
  { name: 'RSI', label: 'Relative Strength Index', params: [{ name: 'period', type: 'number', default: 14 }] },
  { name: 'MACD', label: 'MACD', params: [
    { name: 'fastPeriod', type: 'number', default: 12 },
    { name: 'slowPeriod', type: 'number', default: 26 },
    { name: 'signalPeriod', type: 'number', default: 9 }
  ]}
];