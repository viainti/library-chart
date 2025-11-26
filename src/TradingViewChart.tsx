'use client';

import React, { useRef, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsGear, BsCamera, BsArrowsFullscreen, BsGraphUp, BsQuestionCircle, BsInfoCircle, BsCheck2, BsZoomIn, BsZoomOut, BsLock, BsEyeSlash, BsArrowRepeat, BsMagnet, BsBarChartSteps, BsBarChart, BsBoundingBoxCircles, BsCollection, BsGraphDown, BsClockHistory, BsArrowsMove, BsEye, BsPencil } from 'react-icons/bs';
import type { OHLCData, IndicatorData, IndicatorConfig, DrawingObject, Point, DrawingTool, CursorType } from './types';

type SeriesType =
  | 'candles'          // candle bars (default)
  | 'bars'
  | 'hollow'
  | 'line'
  | 'line-markers'
  | 'step'
  | 'area'
  | 'hlc-area'
  | 'baseline'
  | 'columns'
  | 'high-low';

const UI_TEXT = {
  en: {
    symbolLabel: 'Symbol',
    quickTipsTitle: 'Quick start',
    quickTipsButton: 'Got it',
    quickTips: [
      'Drag anywhere on the canvas to pan the chart.',
      'Use your mouse wheel or trackpad to zoom smoothly.',
      'Pick any tool on the left rail and draw on the canvas.'
    ],
    timeframeTitle: 'Quick timeframes',
    axis: {
      price: 'Price',
      time: 'Time'
    },
    buttons: {
      series: 'Change series',
      indicators: 'Indicators',
      config: 'Settings',
      fullscreenEnter: 'Enter fullscreen',
      fullscreenExit: 'Exit fullscreen',
      screenshot: 'Save screenshot',
      help: 'Quick tips'
    },
    ohlcLabels: {
      open: 'Open',
      high: 'High',
      low: 'Low',
      close: 'Close',
      volume: 'Volume'
    },
    priceChangeLabel: 'Change',
    seriesMenuTitle: 'Series type',
    indicatorsPanelTitle: 'Indicators',
    config: {
      title: 'Settings',
      language: 'Language',
      colors: 'Color theme',
      colorOptions: {
        green: 'Green / Red',
        red: 'Red / Green'
      },
      soon: 'More features coming soon...'
    },
    actions: {
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      lock: 'Lock interactions',
      unlock: 'Unlock canvas',
      hide: 'Hide drawings',
      show: 'Show drawings',
      reset: 'Reset view',
      magnetOn: 'Magnet on',
      magnetOff: 'Magnet off',
      capture: 'Screenshot',
      indicators: 'Indicators'
    },
    toasts: {
      screenshot: 'Screenshot saved'
    },
    novice: {
      title: 'Novice mode',
      magnetOn: 'Magnet enabled for snapping.',
      magnetOff: 'Enable the magnet for precise snapping.',
      lockOn: 'Unlock the canvas to interact.',
      lockOff: 'You can lock the canvas from Actions.',
      hidden: 'Your drawings are hidden.',
      visible: 'Use “Hide” if you need a clean canvas.',
      reopen: 'Novice mode',
      checklistTitle: 'Starter checklist',
      legendTitle: 'Action legend',
      legendHint: 'Try every icon and see what it changes.',
      steps: {
        pan: {
          title: 'Move the chart',
          helper: 'Click and drag anywhere until the crosshair follows you.'
        },
        zoom: {
          title: 'Zoom smoothly',
          helper: 'Use the wheel or the zoom buttons to focus a zone.'
        },
        draw: {
          title: 'Place a drawing',
          helper: 'Pick any tool and drop at least one point on the canvas.'
        },
        capture: {
          title: 'Save a capture',
          helper: 'Use the camera icon to export a PNG.'
        }
      },
      labels: {
        magnet: 'Magnet',
        lock: 'Lock',
        drawings: 'Drawings'
      }
    }
  },
  es: {
    symbolLabel: 'Símbolo',
    quickTipsTitle: 'Guía rápida',
    quickTipsButton: 'Entendido',
    quickTips: [
      'Haz clic y arrastra para desplazar el gráfico.',
      'Usa la rueda o el trackpad para hacer zoom suave.',
      'Selecciona una herramienta y dibuja sobre el lienzo.'
    ],
    timeframeTitle: 'Frecuencias rápidas',
    axis: {
      price: 'Precio',
      time: 'Tiempo'
    },
    buttons: {
      series: 'Cambiar serie',
      indicators: 'Indicadores',
      config: 'Configuración',
      fullscreenEnter: 'Pantalla completa',
      fullscreenExit: 'Salir de pantalla completa',
      screenshot: 'Guardar captura',
      help: 'Tips rápidos'
    },
    ohlcLabels: {
      open: 'Apertura',
      high: 'Máximo',
      low: 'Mínimo',
      close: 'Cierre',
      volume: 'Volumen'
    },
    priceChangeLabel: 'Cambio',
    seriesMenuTitle: 'Tipos de series',
    indicatorsPanelTitle: 'Indicadores',
    config: {
      title: 'Configuración',
      language: 'Idioma',
      colors: 'Tema de color',
      colorOptions: {
        green: 'Verde / Rojo',
        red: 'Rojo / Verde'
      },
      soon: 'Más funciones próximamente...'
    },
    actions: {
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      lock: 'Bloquear interacciones',
      unlock: 'Desbloquear',
      hide: 'Ocultar dibujos',
      show: 'Mostrar dibujos',
      reset: 'Restablecer vista',
      magnetOn: 'Imán activado',
      magnetOff: 'Imán desactivado',
      capture: 'Captura',
      indicators: 'Indicadores'
    },
    toasts: {
      screenshot: 'Captura descargada'
    },
    novice: {
      title: 'Modo novato',
      magnetOn: 'Imán activo para ajustar precios.',
      magnetOff: 'Activa el imán para más precisión.',
      lockOn: 'Desbloquea el lienzo para interactuar.',
      lockOff: 'Puedes bloquear el lienzo en Acciones.',
      hidden: 'Tus dibujos están ocultos.',
      visible: 'Usa “Ocultar” si quieres un lienzo limpio.',
      reopen: 'Modo novato',
      checklistTitle: 'Checklist inicial',
      legendTitle: 'Leyenda de acciones',
      legendHint: 'Prueba cada icono y observa el cambio.',
      steps: {
        pan: {
          title: 'Mueve el gráfico',
          helper: 'Haz clic y arrastra hasta que el cursor te siga.'
        },
        zoom: {
          title: 'Zoom suave',
          helper: 'Usa la rueda o los botones de zoom para enfocar una zona.'
        },
        draw: {
          title: 'Dibuja algo',
          helper: 'Elige una herramienta y deja al menos un punto en el lienzo.'
        },
        capture: {
          title: 'Guarda una captura',
          helper: 'Toca la cámara para exportar un PNG.'
        }
      },
      labels: {
        magnet: 'Imán',
        lock: 'Bloqueo',
        drawings: 'Dibujos'
      }
    }
  }
};

const TOOL_COLOR_MAP: Partial<Record<DrawingTool, string>> = {
  trendline: '#8ab4ff',
  ray: '#8ab4ff',
  'info-line': '#a5b4fc',
  'extended-line': '#93c5fd',
  'trend-angle': '#7dd3fc',
  horizontal: '#fbbf24',
  'horizontal-line': '#fbbf24',
  'horizontal-ray': '#facc15',
  'vertical-line': '#fdba74',
  'cross-line': '#fda4af',
  parallel: '#a78bfa',
  rectangle: '#60a5fa',

  triangle: '#f472b6',
  channel: '#34d399',
  'regression-trend': '#4ade80',
  'flat-top-bottom': '#2dd4bf',
  'disjoint-channel': '#22d3ee',
  pitchfork: '#f472b6',
  'schiff-pitchfork': '#f472b6',
  'modified-schiff-pitchfork': '#fb7185',
  'inside-pitchfork': '#fb7185',
  fibonacci: '#c4b5fd',
  text: '#e5e7eb',
  icon: '#fcd34d',
  ruler: '#f87171',
  freehand: '#c084fc'
};

const metricCardStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid #111827',
  borderRadius: '18px',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minHeight: '90px'
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#94a3b8'
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#f8fafc'
};

const metricSubValueStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8b9cc2'
};

const LINE_TOOL_TYPES: DrawingTool[] = [
  'trendline',
  'ray',
  'info-line',
  'extended-line',
  'trend-angle',
  'horizontal',
  'horizontal-line',
  'horizontal-ray',
  'vertical-line',
  'cross-line',
  'parallel',
  'channel',
  'regression-trend',
  'flat-top-bottom',
  'disjoint-channel',
  'pitchfork',
  'schiff-pitchfork',
  'modified-schiff-pitchfork',
  'inside-pitchfork'
];
const LINE_TOOL_SET = new Set<DrawingTool>(LINE_TOOL_TYPES);


type ThemePreset = 'dark' | 'blue' | 'light' | 'custom';

interface ThemeTokens {
  pageBg: string;
  heroFrom: string;
  heroTo: string;
  panelBg: string;
  panelBorder: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  railBg: string;
  railBorder: string;
  plotBg: string;
  plotBorder: string;
  scaleBg: string;
  overlayBg: string;
}

const THEME_PRESETS: Record<Exclude<ThemePreset, 'custom'>, ThemeTokens> = {
  dark: {
    pageBg: '#050910',
    heroFrom: '#111827',
    heroTo: '#0b1120',
    panelBg: 'rgba(15,23,42,0.9)',
    panelBorder: '#1f2937',
    cardBg: 'rgba(15,23,42,0.85)',
    cardBorder: '#111827',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#2563eb',
    accentSoft: 'rgba(37,99,235,0.2)',
    railBg: 'rgba(2,6,23,0.85)',
    railBorder: '#111827',
    plotBg: '#020617',
    plotBorder: '#111827',
    scaleBg: 'rgba(15,23,42,0.9)',
    overlayBg: 'rgba(5,7,15,0.85)'
  },
  blue: {
    pageBg: '#060e1f',
    heroFrom: '#0f172a',
    heroTo: '#1d4ed8',
    panelBg: 'rgba(6,11,25,0.9)',
    panelBorder: '#1e3a8a',
    cardBg: 'rgba(13,23,42,0.92)',
    cardBorder: '#1d4ed8',
    textPrimary: '#e2e8f0',
    textSecondary: '#a5b4fc',
    accent: '#38bdf8',
    accentSoft: 'rgba(56,189,248,0.2)',
    railBg: 'rgba(4,8,20,0.85)',
    railBorder: '#1e3a8a',
    plotBg: '#020b1f',
    plotBorder: '#1d4ed8',
    scaleBg: 'rgba(6,11,25,0.95)',
    overlayBg: 'rgba(4,8,20,0.8)'
  },
  light: {
    pageBg: '#f8fafc',
    heroFrom: '#e3e8ff',
    heroTo: '#fdfdff',
    panelBg: '#ffffff',
    panelBorder: '#d7def1',
    cardBg: '#ffffff',
    cardBorder: '#dde3f7',
    textPrimary: '#0f172a',
    textSecondary: '#5b6473',
    accent: '#2563eb',
    accentSoft: 'rgba(37,99,235,0.18)',
    railBg: '#ffffff',
    railBorder: '#dbe4fb',
    plotBg: '#ffffff',
    plotBorder: '#dbe4fb',
    scaleBg: '#f3f6ff',
    overlayBg: 'rgba(15,23,42,0.18)'
  }
};

const DEFAULT_CUSTOM_THEME: ThemeTokens = { ...THEME_PRESETS.dark };
const CUSTOM_THEME_FIELDS: Array<{ key: keyof ThemeTokens; label: string }> = [
  { key: 'pageBg', label: 'Page background' },
  { key: 'heroFrom', label: 'Header gradient (from)' },
  { key: 'heroTo', label: 'Header gradient (to)' },
  { key: 'accent', label: 'Accent color' },
  { key: 'plotBg', label: 'Plot background' }
];

const MIN_CANDLE_PX = 4;
const MAX_CANDLE_PX = 28;
const BUFFER_FRACTION = 0.18;
const INERTIA_DURATION_MS = 900;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 6;

const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const alignStroke = (value: number): number => Math.round(value) + 0.5;

const createParallelPoints = (start: Point, end: Point, offset: number): Point[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const offsetX = (-dy / length) * offset;
  const offsetY = (dx / length) * offset;

  const start2: Point = { ...start, x: start.x + offsetX, y: start.y + offsetY };
  const end2: Point = { ...end, x: end.x + offsetX, y: end.y + offsetY };

  return [start, end, start2, end2];
};

const getChannelOffset = (tool: DrawingTool): number => {
  switch (tool) {
    case 'channel':
      return 40;
    case 'regression-trend':
      return 36;
    case 'flat-top-bottom':
      return 28;
    case 'disjoint-channel':
      return 48;
    case 'pitchfork':
    case 'schiff-pitchfork':
    case 'modified-schiff-pitchfork':
    case 'inside-pitchfork':
      return 34;
    default:
      return 28;
  }
};

const createTrianglePoints = (start: Point, end: Point): Point[] => {
  const apexDirection = start.y < end.y ? -1 : 1;
  const apexHeight = Math.max(24, Math.abs(end.y - start.y));
  const apex: Point = {
    ...start,
    x: (start.x + end.x) / 2,
    y: start.y + apexDirection * apexHeight,
    time: (start.time + end.time) / 2
  };
  return [start, end, apex];
};

const buildRulerMeta = (start: Point, end: Point) => ({
  distancePx: Math.hypot(end.x - start.x, end.y - start.y),
  priceDelta: end.price - start.price,
  percentDelta: start.price !== 0 ? ((end.price - start.price) / start.price) * 100 : 0
});

import { createCoordinateSystem, getDataBounds, type CoordinateSystem } from './utils';
import { IndicatorCalculator } from './indicators';
import { useChartStore } from './store';
import DrawingToolbar from './DrawingToolbar';
import { DrawingRenderer } from './drawingUtils';

interface TradingViewChartProps {
  data: OHLCData[];
  symbol?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

interface VisibleWindowMeta {
  start: number;
  end: number;
  bufferStart: number;
  bufferEnd: number;
  visibleCount: number;
  buffer: number;
}

const computeViewportCount = (
  chartWidth: number,
  timeframe: string,
  zoomLevel: number,
  getVisibleCountFn: (tf: string) => number
): number => {
  if (chartWidth <= 0) return 0;
  const timeframeHint = getVisibleCountFn(timeframe);
  const pxPerCandle = clamp(12 / Math.max(zoomLevel, 0.1), MIN_CANDLE_PX, MAX_CANDLE_PX);
  const widthBased = Math.max(10, Math.floor(chartWidth / pxPerCandle));
  const blended = (timeframeHint + widthBased) / 2;
  return Math.max(10, Math.round(blended / Math.max(zoomLevel, 0.1)));
};

const computeVisibleWindow = (
  dataset: OHLCData[],
  chartWidth: number,
  timeframe: string,
  zoomLevel: number,
  panOffset: number,
  getVisibleCountFn: (tf: string) => number
): { visibleSlice: OHLCData[]; meta: VisibleWindowMeta } => {
  const datasetLength = dataset.length;
  if (!datasetLength || chartWidth <= 0) {
    return {
      visibleSlice: [],
      meta: {
        start: 0,
        end: 0,
        bufferStart: 0,
        bufferEnd: 0,
        visibleCount: 0,
        buffer: 0
      }
    };
  }

  const visibleCount = Math.min(datasetLength, computeViewportCount(chartWidth, timeframe, zoomLevel, getVisibleCountFn));
  const buffer = Math.min(200, Math.max(10, Math.round(visibleCount * BUFFER_FRACTION)));
  const unclampedStart = datasetLength - visibleCount - panOffset;
  const start = clamp(Math.round(unclampedStart), 0, datasetLength);
  const end = Math.min(datasetLength, start + visibleCount);
  const bufferStart = clamp(start - buffer, 0, datasetLength);
  const bufferEnd = clamp(end + buffer, bufferStart, datasetLength);

  const visibleSlice = dataset.slice(start, end);
  return {
    visibleSlice,
    meta: {
      start,
      end,
      bufferStart,
      bufferEnd,
      visibleCount: visibleSlice.length,
      buffer
    }
  };
};

const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, symbol = 'BTC/USDT', onTimeframeChange }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const volumeRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const drawingsRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const showCrosshairRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const plotAreaRef = useRef<HTMLDivElement>(null);
  const priceWindowRef = useRef({ min: 0, max: 1 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 400, cssWidth: 800, cssHeight: 400 });
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const coordsRef = useRef<CoordinateSystem>(createCoordinateSystem());
  const [calculatedIndicators, setCalculatedIndicators] = useState<IndicatorData[]>([]);
  const visibleWindowRef = useRef<VisibleWindowMeta>({ start: 0, end: 0, bufferStart: 0, bufferEnd: 0, visibleCount: 0, buffer: 0 });
  const visibleDataRef = useRef<OHLCData[]>([]);
  const panOffsetRef = useRef(0);
  const zoomLevelRef = useRef(1);
  const dragSampleRef = useRef({ velocity: 0, lastTs: 0 });
  const inertiaRef = useRef<{ rafId: number | null; startTime: number; lastTime: number; initialVelocity: number }>({
    rafId: null,
    startTime: 0,
    lastTime: 0,
    initialVelocity: 0
  });
  const zoomAnimationRef = useRef<number | null>(null);
  const zoomAnimationStateRef = useRef<{ from: number; to: number; startTime: number; duration: number; anchorRatio: number } | null>(null);

  // Zustand store
  const {
    data: storeData,
    visibleData,
    timeframe,
    zoomLevel,
    panOffset,
    indicators,
    showIndicatorsPanel,
    drawings,
    magnetEnabled,
    currentPrice,
    priceChange,
    priceChangePercent,
    activeTool,
    cursorType,
    strokeColor,
    strokeWidth,
    isDrawing,
    currentDrawing,
    selectedEmoji,
    interactionsLocked,
    drawingsHidden,
    toggleInteractionsLock,
    toggleDrawingsHidden,
    setData,
    setVisibleData,
    setTimeframe,
    setZoomLevel,
    setPanOffset,
    addIndicator,
    removeIndicator,
    toggleIndicatorsPanel,
    toggleMagnet,
    setIsDrawing,
    setCurrentDrawing,
    addDrawing,
    setSelectedEmoji,
    deleteDrawing,
    setCursorType
  } = useChartStore();

  const handleTimeframeChange = useCallback((nextTimeframe: string) => {
    setTimeframe(nextTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(nextTimeframe);
    }
  }, [setTimeframe, onTimeframeChange]);

  const getVisibleCount = useCallback((tf: string) => {
    switch (tf) {
      case '1m': return 200;
      case '3m': return 134;
      case '5m': return 100;
      case '15m': return 50;
      case '30m': return 25;
      case '1h': return 50;
      case '4h': return 25;
      case '12h': return 15;
      case '1D': return 10;
      case '3D': return 8;
      case '1W': return 5;
      case '1M': return 3;
      default: return 25;
    }
  }, []);

  const getTimeframeMs = (tf: string) => {
    switch (tf) {
      case '1m': return 60000;
      case '3m': return 180000;
      case '5m': return 300000;
      case '15m': return 900000;
      case '30m': return 1800000;
      case '1h': return 3600000;
      case '4h': return 14400000;
      case '12h': return 43200000;
      case '1D': return 86400000;
      case '3D': return 259200000;
      case '1W': return 604800000;
      case '1M': return 2592000000;
      default: return 3600000;
    }
  };

  useEffect(() => {
    setData(data);
  }, [data, setData]);


  useEffect(() => {
    const newIndicators: IndicatorData[] = [];
    indicators.forEach(config => {
      if (!config.visible) return;

      try {
        switch (config.name) {
          case 'SMA':
            newIndicators.push(IndicatorCalculator.calculateSMA(storeData, config.params.period));
            break;
          case 'EMA':
            newIndicators.push(IndicatorCalculator.calculateEMA(storeData, config.params.period));
            break;
          case 'RSI':
            newIndicators.push(IndicatorCalculator.calculateRSI(storeData, config.params.period));
            break;
          case 'MACD':
            const macdResult = IndicatorCalculator.calculateMACD(storeData, config.params.fastPeriod, config.params.slowPeriod, config.params.signalPeriod);
            newIndicators.push(macdResult.macd, macdResult.signal, macdResult.histogram);
            break;
        }
      } catch (error) {
        console.error(`Error calculating ${config.name}:`, error);
      }
    });
    setCalculatedIndicators(newIndicators);
  }, [storeData, indicators]);

  useEffect(() => {
    const updateDimensions = () => {
      if (plotAreaRef.current) {
        const rect = plotAreaRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        setDimensions({ width: rect.width * dpr, height: rect.height * dpr, cssWidth: rect.width, cssHeight: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { width, height, cssWidth, cssHeight } = dimensions;
  const priceScaleWidth = 60;
  const timeScaleHeight = 48;
  const volumeHeight = 120;
  const chartWidth = Math.max(1, cssWidth - priceScaleWidth);
  const chartHeight = Math.max(1, cssHeight - timeScaleHeight - volumeHeight);
  const overlayHeight = Math.max(1, cssHeight - timeScaleHeight);

  useEffect(() => {
    const { visibleSlice, meta } = computeVisibleWindow(storeData, chartWidth, timeframe, zoomLevel, panOffset, getVisibleCount);
    setVisibleData(visibleSlice);
    visibleWindowRef.current = meta;
  }, [storeData, chartWidth, timeframe, zoomLevel, panOffset, setVisibleData]);

  useEffect(() => {
    visibleDataRef.current = visibleData;
  }, [visibleData]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const getVisibleCandles = useCallback(() => visibleDataRef.current, []);
  const getVisibleWindow = useCallback(() => visibleWindowRef.current, []);

  const clampPanOffset = useCallback((value: number) => clamp(value, -storeData.length, storeData.length), [storeData.length]);

  const setPanOffsetSafe = useCallback((value: number) => {
    const next = clampPanOffset(value);
    panOffsetRef.current = next;
    setPanOffset(next);
  }, [clampPanOffset, setPanOffset]);

  const clampZoomLevel = useCallback((value: number) => clamp(value, ZOOM_MIN, ZOOM_MAX), []);

  const setZoomLevelSafe = useCallback((value: number) => {
    const next = clampZoomLevel(value);
    zoomLevelRef.current = next;
    setZoomLevel(next);
  }, [clampZoomLevel, setZoomLevel]);

  const handleCustomThemeChange = useCallback((key: keyof ThemeTokens, value: string) => {
    setCustomTheme((prev) => ({ ...prev, [key]: value }));
  }, []);


  const applyPanDelta = useCallback((deltaPx: number) => {
    if (!chartWidth) return;
    const candles = getVisibleCandles();
    const pxPerCandle = chartWidth / Math.max(candles.length || 1, 1);
    if (!isFinite(pxPerCandle) || pxPerCandle === 0) return;
    const deltaOffset = deltaPx / Math.max(pxPerCandle, 1e-3);
    setPanOffsetSafe(panOffsetRef.current + deltaOffset);
  }, [chartWidth, getVisibleCandles, setPanOffsetSafe]);

  const cancelInertia = useCallback(() => {
    if (inertiaRef.current.rafId !== null) {
      cancelAnimationFrame(inertiaRef.current.rafId);
    }
    inertiaRef.current = {
      rafId: null,
      startTime: 0,
      lastTime: 0,
      initialVelocity: 0
    };
  }, []);

  const startInertia = useCallback((initialVelocity: number) => {
    if (Math.abs(initialVelocity) < 0.002) return;
    cancelInertia();
    inertiaRef.current.initialVelocity = initialVelocity;
    inertiaRef.current.startTime = performance.now();
    inertiaRef.current.lastTime = inertiaRef.current.startTime;

    const step = (timestamp: number) => {
      const elapsed = timestamp - inertiaRef.current.startTime;
      const progress = Math.min(1, elapsed / INERTIA_DURATION_MS);
      const eased = 1 - easeOutQuad(progress);
      const currentVelocity = inertiaRef.current.initialVelocity * eased;
      const deltaTime = timestamp - inertiaRef.current.lastTime;
      inertiaRef.current.lastTime = timestamp;

      if (Math.abs(currentVelocity) < 0.001 || progress >= 1) {
        cancelInertia();
        return;
      }

      applyPanDelta(currentVelocity * deltaTime);
      inertiaRef.current.rafId = requestAnimationFrame(step);
    };

    inertiaRef.current.rafId = requestAnimationFrame(step);
  }, [applyPanDelta, cancelInertia]);

  const cancelZoomAnimation = useCallback(() => {
    if (zoomAnimationRef.current) {
      cancelAnimationFrame(zoomAnimationRef.current);
      zoomAnimationRef.current = null;
    }
    zoomAnimationStateRef.current = null;
  }, []);

  const applyZoomAtRatio = useCallback((nextZoom: number, anchorRatio: number) => {
    const datasetLength = storeData.length;
    if (!datasetLength) {
      setZoomLevelSafe(nextZoom);
      return;
    }

    const prevCount = computeViewportCount(chartWidth, timeframe, zoomLevelRef.current, getVisibleCount);
    const nextCount = computeViewportCount(chartWidth, timeframe, nextZoom, getVisibleCount);
    if (!prevCount || !nextCount) {
      setZoomLevelSafe(nextZoom);
      return;
    }

    const startBefore = clamp(
      datasetLength - prevCount - panOffsetRef.current,
      0,
      Math.max(0, datasetLength - prevCount)
    );

    const anchorIndex = startBefore + anchorRatio * prevCount;
    const nextStart = clamp(
      anchorIndex - anchorRatio * nextCount,
      0,
      Math.max(0, datasetLength - nextCount)
    );
    const nextPan = datasetLength - nextCount - nextStart;

    setZoomLevelSafe(nextZoom);
    setPanOffsetSafe(nextPan);
  }, [chartWidth, timeframe, storeData.length, setZoomLevelSafe, setPanOffsetSafe, getVisibleCount]);

  const startZoomAnimation = useCallback((targetZoom: number, anchorRatio: number) => {
    const clampedTarget = clampZoomLevel(targetZoom);
    const currentZoom = zoomLevelRef.current;

    if (Math.abs(clampedTarget - currentZoom) < 0.001) {
      applyZoomAtRatio(clampedTarget, anchorRatio);
      return;
    }

    cancelZoomAnimation();
    zoomAnimationStateRef.current = {
      from: currentZoom,
      to: clampedTarget,
      startTime: performance.now(),
      duration: 220,
      anchorRatio
    };

    const animate = (timestamp: number) => {
      const state = zoomAnimationStateRef.current;
      if (!state) return;
      const progress = Math.min(1, (timestamp - state.startTime) / state.duration);
      const eased = easeInOutCubic(progress);
      const nextZoom = state.from + (state.to - state.from) * eased;
      applyZoomAtRatio(nextZoom, state.anchorRatio);

      if (progress < 1) {
        zoomAnimationRef.current = requestAnimationFrame(animate);
      } else {
        zoomAnimationRef.current = null;
        zoomAnimationStateRef.current = null;
      }
    };

    zoomAnimationRef.current = requestAnimationFrame(animate);
  }, [applyZoomAtRatio, cancelZoomAnimation, clampZoomLevel]);

  useEffect(() => {
    return () => {
      cancelInertia();
      cancelZoomAnimation();
    };
  }, [cancelInertia, cancelZoomAnimation]);

  // Draw drawings
  useEffect(() => {
    const drawingsCtx = drawingsRef.current?.getContext('2d');
    if (drawingsCtx) {
      drawingsCtx.clearRect(0, 0, chartWidth, overlayHeight);
      if (drawingsHidden) {
        return;
      }
      drawings.forEach(drawing => {
        DrawingRenderer.draw(drawing, drawingsCtx);
      });
      if (currentDrawing) {
        DrawingRenderer.draw(currentDrawing as DrawingObject, drawingsCtx);
      }
    }
  }, [drawings, currentDrawing, chartWidth, overlayHeight, drawingsHidden]);

  const [priceLabels, setPriceLabels] = useState<string[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [clickedPrice, setClickedPrice] = useState<{ x: number; y: number; price: number } | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [colorScheme, setColorScheme] = useState('green');
  const [themePreset, setThemePreset] = useState<ThemePreset>('dark');
  const [customTheme, setCustomTheme] = useState<ThemeTokens>(DEFAULT_CUSTOM_THEME);
  const resolvedPreset: Exclude<ThemePreset, 'custom'> = themePreset === 'custom' ? 'dark' : themePreset;
  const activeTheme = themePreset === 'custom' ? customTheme : THEME_PRESETS[resolvedPreset];
  const themeOptions: { key: ThemePreset; label: string }[] = [
    { key: 'dark', label: 'Dark' },
    { key: 'blue', label: 'Blue' },
    { key: 'light', label: 'Light' },
    { key: 'custom', label: 'Custom' }
  ];
  const elevatedShadow = themePreset === 'light' ? '0 15px 30px rgba(15,23,42,0.12)' : '0 15px 40px rgba(0,0,0,0.35)';
  const surfaceShadow = themePreset === 'light' ? '0 30px 50px rgba(15,23,42,0.12)' : '0 30px 60px rgba(0,0,0,0.35)';
  const iconBaseBg = themePreset === 'light' ? '#0f172a' : 'rgba(15,23,42,0.6)';
  const iconBaseColor = '#f8fafc';
  const leftRailBaseBg = themePreset === 'light' ? '#0f172a' : activeTheme.panelBg;
  const strings = useMemo(() => UI_TEXT[language] ?? UI_TEXT.en, [language]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCandleIndex, setSelectedCandleIndex] = useState<number | null>(null);
  const [seriesType, setSeriesType] = useState<SeriesType>('candles');
  const [showSeriesMenu, setShowSeriesMenu] = useState(false);
  const [isSeriesLoading, setIsSeriesLoading] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingNotePoint, setPendingNotePoint] = useState<Point | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    if (!plotAreaRef.current) return;
    const rect = plotAreaRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    setDimensions({ width: rect.width * dpr, height: rect.height * dpr, cssWidth: rect.width, cssHeight: rect.height });
  }, [isFullscreen, showIndicatorsPanel, showConfigPanel, showSeriesMenu]);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!visibleData.length) return;

    setIsSeriesLoading(true);
    const id = window.setTimeout(() => setIsSeriesLoading(false), 250);
    return () => window.clearTimeout(id);
  }, [seriesType, visibleData.length]);

  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const shortNumberFormatter = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }), [locale]);
  const latencyMs = useMemo(() => Math.round(20 + Math.random() * 15), []);
  const derivedStats = useMemo(() => {
    if (!storeData.length) {
      return null;
    }
    const highs = storeData.map((d) => d.high);
    const lows = storeData.map((d) => d.low);
    const closes = storeData.map((d) => d.close);
    const volumes = storeData.map((d) => d.volume ?? 0);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const range = maxHigh - minLow;
    const lastClose = closes[closes.length - 1] ?? 0;
    const rangePct = lastClose ? (range / lastClose) * 100 : 0;
    const avgVolume = volumes.reduce((acc, value) => acc + value, 0) / Math.max(1, volumes.length);
    let volatility = 0;
    if (closes.length > 1) {
      let diffSum = 0;
      for (let i = 1; i < closes.length; i++) {
        const current = closes[i] ?? closes[i - 1] ?? 0;
        const prevValue = closes[i - 1] ?? current;
        if (prevValue !== 0) {
          diffSum += Math.abs(current - prevValue) / prevValue;
        }
      }
      volatility = (diffSum / (closes.length - 1)) * 100;
    }
    const hour = new Date().getUTCHours();
    const session = hour < 7 ? 'Asia' : hour < 14 ? 'Europe' : hour < 21 ? 'New York' : 'Pacific';
    return {
      range,
      rangePct,
      avgVolume,
      volatility,
      session,
      samples: storeData.length
    };
  }, [storeData]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const id = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

  useEffect(() => {
    const candles = getVisibleCandles();
    if (!candles.length) return;

    const bounds = getDataBounds(candles);
    const rawRange = bounds.maxPrice - bounds.minPrice;
    const padding = rawRange === 0 ? Math.max(1, bounds.maxPrice * 0.01 || 1) : rawRange * 0.05;
    const minPrice = Math.max(0, bounds.minPrice - padding);
    const maxPrice = bounds.maxPrice + padding;
    const priceRange = Math.max(1e-6, maxPrice - minPrice);
    const maxVolume = Math.max(bounds.maxVolume, 1);
    priceWindowRef.current = { min: minPrice, max: maxPrice };

    const chartWidth = Math.max(1, cssWidth - priceScaleWidth);
    const chartHeight = Math.max(1, cssHeight - timeScaleHeight - volumeHeight);
    const candleWidth = chartWidth / Math.max(candles.length, 1);

    // Generate price labels
    const priceLabelsArray: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const price = minPrice + (priceRange * i) / 10;
      priceLabelsArray.push(numberFormatter.format(price));
    }
    setPriceLabels(priceLabelsArray);

    // Generate time labels
    const timeLabelsArray: string[] = [];
    const step = Math.max(1, Math.floor(candles.length / 10));
    for (let i = 0; i < candles.length; i += step) {
      const timestamp = candles[i]?.timestamp;
      if (timestamp !== undefined) {
        const date = new Date(timestamp);
        timeLabelsArray.push(timeFormatter.format(date));
      } else {
        timeLabelsArray.push(`Vela ${i} / Candle ${i}`);
      }
    }
    setTimeLabels(timeLabelsArray);

    // Draw grid
    const gridCtx = gridRef.current?.getContext('2d');
    if (gridCtx) {
      gridCtx.clearRect(0, 0, chartWidth, chartHeight);
      gridCtx.strokeStyle = '#363a45';
      gridCtx.lineWidth = 0.5;
      for (let i = 0; i <= 10; i++) {
        const y = alignStroke((i / 10) * chartHeight);
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(chartWidth, y);
        gridCtx.stroke();
      }
      const timeStep = Math.max(1, Math.floor(candles.length / 10));
      for (let i = 0; i <= candles.length; i += timeStep) {
        const x = alignStroke(i * candleWidth);
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, chartHeight);
        gridCtx.stroke();
      }
    }

    const bullishColor = colorScheme === 'green' ? '#089981' : '#f23645';
    const bearishColor = colorScheme === 'green' ? '#f23645' : '#089981';
 
    // Draw price series
    const chartCtx = chartRef.current?.getContext('2d');
    if (chartCtx) {
      chartCtx.clearRect(0, 0, chartWidth, chartHeight);

      const isLineLike =
        seriesType === 'line' ||
        seriesType === 'line-markers' ||
        seriesType === 'step' ||
        seriesType === 'area' ||
        seriesType === 'hlc-area' ||
        seriesType === 'baseline';

      if (isLineLike) {
        // ----- LINE-BASED SERIES -----
        const baselinePrice =
          seriesType === 'baseline'
            ? (candles[0]?.close ?? minPrice)
            : minPrice;

        chartCtx.beginPath();
        candles.forEach((candle, index) => {
          const x = index * candleWidth + candleWidth / 2;
          const yClose = ((maxPrice - candle.close) / priceRange) * chartHeight;

          if (index === 0) {
            chartCtx.moveTo(x, yClose);
          } else if (seriesType === 'step') {
            const prev = candles[index - 1];
            if (prev) {
              const prevX = (index - 1) * candleWidth + candleWidth / 2;
              const prevY = ((maxPrice - prev.close) / priceRange) * chartHeight;
              chartCtx.lineTo(x, prevY);
              chartCtx.lineTo(x, yClose);
            }
          } else {
            chartCtx.lineTo(x, yClose);
          }
        });

        chartCtx.strokeStyle = '#2962ff';
        chartCtx.lineWidth = seriesType === 'baseline' ? 2 : 1;
        chartCtx.setLineDash([]);
        chartCtx.stroke();

        if (seriesType === 'line-markers') {
          candles.forEach((candle, index) => {
            const x = index * candleWidth + candleWidth / 2;
            const yClose = ((maxPrice - candle.close) / priceRange) * chartHeight;
            chartCtx.beginPath();
            chartCtx.arc(x, yClose, 2.5, 0, 2 * Math.PI);
            chartCtx.fillStyle = '#2962ff';
            chartCtx.fill();
          });
        }

        if (seriesType === 'area' || seriesType === 'hlc-area' || seriesType === 'baseline') {
          chartCtx.lineTo(
            (candles.length - 1) * candleWidth + candleWidth / 2,
            ((maxPrice - baselinePrice) / priceRange) * chartHeight
          );
          chartCtx.lineTo(
            0 * candleWidth + candleWidth / 2,
            ((maxPrice - baselinePrice) / priceRange) * chartHeight
          );
          chartCtx.closePath();
          chartCtx.fillStyle =
            seriesType === 'baseline' ? 'rgba(41,98,255,0.25)' : 'rgba(41,98,255,0.15)';
          chartCtx.fill();
        }
      } else {
        // ----- CANDLE / BAR-BASED SERIES -----
        candles.forEach((candle, index) => {
          const xCenter = index * candleWidth + candleWidth / 2;
          const strokeX = alignStroke(xCenter);
          const yHigh = ((maxPrice - candle.high) / priceRange) * chartHeight;
          const yLow = ((maxPrice - candle.low) / priceRange) * chartHeight;
          const yOpen = ((maxPrice - candle.open) / priceRange) * chartHeight;
          const yClose = ((maxPrice - candle.close) / priceRange) * chartHeight;
          const alignedYOpen = alignStroke(yOpen);
          const alignedYClose = alignStroke(yClose);
          const alignedYHigh = alignStroke(yHigh);
          const alignedYLow = alignStroke(yLow);
          const isBullish = candle.close > candle.open;

          const bodyHeight = Math.abs(yClose - yOpen);
          const bodyY = Math.min(yOpen, yClose);

          const colorUp = bullishColor;
          const colorDown = bearishColor;
          const color = isBullish ? colorUp : colorDown;

          // Common wick for styles that use full OHLC
          const usesWick =
            seriesType === 'candles' ||
            seriesType === 'hollow' ||
            seriesType === 'bars' ||
            seriesType === 'columns' ||
            seriesType === 'high-low';

          if (usesWick) {
            chartCtx.strokeStyle = color;
            chartCtx.lineWidth = 1;
            chartCtx.beginPath();
            chartCtx.moveTo(strokeX, alignedYHigh);
            chartCtx.lineTo(strokeX, alignedYLow);
            chartCtx.stroke();
          }

          if (seriesType === 'candles' || seriesType === 'hollow') {
            chartCtx.lineWidth = 1;
            chartCtx.strokeStyle = color;
            if (seriesType === 'hollow' && isBullish) {
              // Hollow candle: sólo borde cuando es alcista
              chartCtx.fillStyle = 'transparent';
            } else {
              chartCtx.fillStyle = color;
            }

            if (bodyHeight > 1) {
              if (seriesType === 'hollow' && isBullish) {
                chartCtx.strokeRect(
                  xCenter - candleWidth * 0.4,
                  bodyY,
                  candleWidth * 0.8,
                  bodyHeight
                );
              } else {
                chartCtx.fillRect(
                  xCenter - candleWidth * 0.4,
                  bodyY,
                  candleWidth * 0.8,
                  bodyHeight
                );
                chartCtx.strokeRect(
                  xCenter - candleWidth * 0.4,
                  bodyY,
                  candleWidth * 0.8,
                  bodyHeight
                );
              }
            } else {
              chartCtx.beginPath();
              const bodyYStroke = alignStroke(yOpen);
              chartCtx.moveTo(xCenter - candleWidth * 0.4, bodyYStroke);
              chartCtx.lineTo(xCenter + candleWidth * 0.4, bodyYStroke);
              chartCtx.stroke();
            }
          } else if (seriesType === 'bars') {
            // OHLC bar style
            chartCtx.strokeStyle = color;
            chartCtx.lineWidth = 1;
            // wick already drawn; add open/close ticks
            chartCtx.beginPath();
            // open tick (left)
            chartCtx.moveTo(xCenter - candleWidth * 0.4, alignedYOpen);
            chartCtx.lineTo(xCenter, alignedYOpen);
            // close tick (right)
            chartCtx.moveTo(xCenter, alignedYClose);
            chartCtx.lineTo(xCenter + candleWidth * 0.4, alignedYClose);
            chartCtx.stroke();
          } else if (seriesType === 'columns') {
            // Column style (vertical bar from low to high)
            chartCtx.fillStyle = color;
            chartCtx.fillRect(
              xCenter - candleWidth * 0.3,
              yLow,
              candleWidth * 0.6,
              yHigh - yLow
            );
          } else if (seriesType === 'high-low') {
            // Ya se dibujó sólo la línea high-low (sin cuerpo)
            // Nada extra que hacer
          }
        });
      }
    }

    // Draw volume
    const volumeCtx = volumeRef.current?.getContext('2d');
    if (volumeCtx) {
      volumeCtx.clearRect(0, 0, chartWidth, volumeHeight);
      candles.forEach((candle, index) => {
        const x = index * candleWidth;
        const barHeight = ((candle.volume || 0) / maxVolume) * volumeHeight;
        const y = volumeHeight - barHeight;
        const isBullish = candle.close > candle.open;
        volumeCtx.fillStyle = isBullish ? bullishColor : bearishColor;
        volumeCtx.fillRect(x + 1, y, candleWidth - 2, barHeight);
      });
    }

    // Draw indicators
    const indicatorCtx = chartRef.current?.getContext('2d');
    if (indicatorCtx) {
      calculatedIndicators.forEach(indicator => {
        if (indicator.type === 'line') {
          indicatorCtx.strokeStyle = indicator.color;
          indicatorCtx.lineWidth = indicator.width || 1;
          indicatorCtx.setLineDash(indicator.style === 'dashed' ? [5, 5] : indicator.style === 'dotted' ? [2, 2] : []);
          indicatorCtx.beginPath();

          indicator.data.forEach((value, index) => {
            if (value !== null && value !== undefined) {
              const x = index * candleWidth + candleWidth / 2;
              const y = ((maxPrice - value) / priceRange) * chartHeight;
              if (index === 0) {
                indicatorCtx.moveTo(x, y);
              } else {
                indicatorCtx.lineTo(x, y);
              }
            }
          });
          indicatorCtx.stroke();
        } else if (indicator.type === 'histogram') {
          indicator.data.forEach((value, index) => {
            if (value !== null && value !== undefined) {
              const x = index * candleWidth;
              const barHeight = Math.abs(value) * chartHeight * 0.1; // Scale histogram
              const y = value >= 0 ? chartHeight / 2 - barHeight : chartHeight / 2;
              indicatorCtx.fillStyle = value >= 0 ? '#089981' : '#f23645';
              indicatorCtx.fillRect(x + 2, y, candleWidth - 4, barHeight);
            }
          });
        }
      });
      indicatorCtx.setLineDash([]); // Reset line dash
    }
  }, [visibleData, cssWidth, cssHeight, colorScheme, calculatedIndicators, seriesType, getVisibleCandles]);

  const drawCrosshair = useCallback(() => {
    const overlayCtx = overlayRef.current?.getContext('2d');
    if (overlayCtx && showCrosshairRef.current) {
      const { x, y } = mousePosRef.current;
      const alignedX = alignStroke(x);
      const alignedY = alignStroke(y);
      overlayCtx.clearRect(0, 0, chartWidth, overlayHeight);
      overlayCtx.strokeStyle = '#9598a1';
      overlayCtx.lineWidth = 1;
      overlayCtx.setLineDash([2, 2]);
      overlayCtx.beginPath();
      overlayCtx.moveTo(alignedX, 0);
      overlayCtx.lineTo(alignedX, chartHeight);
      overlayCtx.stroke();
      overlayCtx.beginPath();
      overlayCtx.moveTo(0, alignedY);
      overlayCtx.lineTo(chartWidth, alignedY);
      overlayCtx.stroke();
      overlayCtx.setLineDash([]);
    }
  }, [chartWidth, chartHeight, overlayHeight]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (interactionsLocked || !visibleData.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickedPrice(null);

    if (cursorType !== 'cross') {
      return;
    }

    if (!isDraggingRef.current) {
      const { min, max } = priceWindowRef.current;
      const snappedX = coordsRef.current.snapToCandle(x, chartWidth, visibleData.length);
      const snappedY = coordsRef.current.snapToPrice(y, chartHeight, min, max);

      mousePosRef.current = {
        x: coordsRef.current.timeToPixel(snappedX, chartWidth, visibleData.length),
        y: coordsRef.current.priceToPixel(snappedY, chartHeight, min, max)
      };
      showCrosshairRef.current = true;
      requestAnimationFrame(drawCrosshair);
    }
  }, [visibleData, cursorType, chartWidth, chartHeight, drawCrosshair, interactionsLocked]);

  const handleMouseLeave = useCallback(() => {
    showCrosshairRef.current = false;
    isDraggingRef.current = false;
    dragSampleRef.current.velocity = 0;
    dragSampleRef.current.lastTs = 0;
    requestAnimationFrame(() => {
      const overlayCtx = overlayRef.current?.getContext('2d');
      if (overlayCtx) {
        overlayCtx.clearRect(0, 0, chartWidth, overlayHeight);
      }
    });
  }, [chartWidth, overlayHeight]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (interactionsLocked) return;
    e.preventDefault();
    applyPanDelta(e.deltaX);
  }, [interactionsLocked, applyPanDelta]);

  const handleQuickZoom = useCallback((direction: 'in' | 'out') => {
    if (interactionsLocked) return;
    const factor = direction === 'in' ? 1.2 : 0.8;
    const targetZoom = clampZoomLevel(zoomLevelRef.current * factor);
    startZoomAnimation(targetZoom, 0.5);
  }, [interactionsLocked, startZoomAnimation, clampZoomLevel]);

  const handleResetView = useCallback(() => {
    if (interactionsLocked) return;
    cancelInertia();
    cancelZoomAnimation();
    setPanOffsetSafe(0);
    startZoomAnimation(1, 0.5);
  }, [interactionsLocked, cancelInertia, cancelZoomAnimation, setPanOffsetSafe, startZoomAnimation]);

  const getPointerPoint = useCallback((event: React.PointerEvent<HTMLDivElement>): Point | null => {
    if (interactionsLocked) return null;
    const targetData = visibleData.length ? visibleData : storeData;
    if (!event.currentTarget || !targetData.length) {
      return null;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    const usingVisible = visibleData.length > 0;
    const bounds = usingVisible
      ? { minPrice: priceWindowRef.current.min, maxPrice: priceWindowRef.current.max }
      : getDataBounds(targetData);
    const dataLength = Math.max(targetData.length, 1);

    if (magnetEnabled && visibleData.length) {
      const snappedIndex = coordsRef.current.snapToCandle(x, chartWidth, dataLength);
      const snappedPrice = coordsRef.current.snapToPrice(y, chartHeight, bounds.minPrice, bounds.maxPrice, 0.5);
      x = coordsRef.current.timeToPixel(snappedIndex, chartWidth, dataLength);
      y = coordsRef.current.priceToPixel(snappedPrice, chartHeight, bounds.minPrice, bounds.maxPrice);
    }

    const price = coordsRef.current.pixelToPrice(y, chartHeight, bounds.minPrice, bounds.maxPrice);
    const time = coordsRef.current.pixelToTime(x, chartWidth, dataLength);
    return { x, y, price, time };
  }, [visibleData, storeData, magnetEnabled, chartWidth, chartHeight, interactionsLocked]);

  const tryEraseDrawing = useCallback((x: number, y: number) => {
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i];
      if (!drawing) continue;
      if (drawing.points.some(point => Math.hypot(point.x - x, point.y - y) < 14)) {
        deleteDrawing(drawing.id);
        showToast('Dibujo eliminado');
        return true;
      }
    }
    return false;
  }, [drawings, deleteDrawing, showToast]);

  const finalizeDrawing = useCallback((draft: DrawingObject): DrawingObject => {
    const normalizedPoints = draft.points.length ? [...draft.points] : [];
    if (
      normalizedPoints.length === 1 &&
      draft.type !== 'text' &&
      draft.type !== 'icon' &&
      draft.type !== 'freehand'
    ) {
      const firstPoint = normalizedPoints[0];
      if (firstPoint) {
        normalizedPoints.push({ ...firstPoint });
      }
    }

    let normalized: DrawingObject = {
      ...draft,
      points: normalizedPoints
    };

    const start = normalized.points[0];
    const end = normalized.points[1] ?? normalized.points[0];

    if (!start) {
      return normalized;
    }

    switch (draft.type) {
      case 'horizontal':
      case 'horizontal-line':
      case 'horizontal-ray': {
        if (end) {
          normalized.points = [start, { ...end, y: start.y, price: start.price }];
        }
        break;
      }
      case 'vertical-line': {
        if (end) {
          normalized.points = [start, { ...end, x: start.x, time: start.time }];
        }
        break;
      }
      case 'rectangle': {
        normalized.backgroundColor = draft.backgroundColor ?? 'rgba(96,165,250,0.15)';
        break;
      }
      case 'triangle': {
        if (end) {
          normalized.points = createTrianglePoints(start, end);
        }
        normalized.backgroundColor = draft.backgroundColor ?? 'rgba(244,114,182,0.12)';
        break;
      }
      case 'channel':
      case 'parallel':
      case 'regression-trend':
      case 'flat-top-bottom':
      case 'disjoint-channel':
      case 'pitchfork':
      case 'schiff-pitchfork':
      case 'modified-schiff-pitchfork':
      case 'inside-pitchfork': {
        if (end) {
          const offset = getChannelOffset(draft.type);
          normalized.points = createParallelPoints(start, end, offset);
        }
        if (['channel', 'regression-trend', 'flat-top-bottom', 'disjoint-channel'].includes(draft.type)) {
          normalized.backgroundColor = draft.backgroundColor ?? 'rgba(52,211,153,0.08)';
        }
        if (['pitchfork', 'schiff-pitchfork', 'modified-schiff-pitchfork', 'inside-pitchfork'].includes(draft.type)) {
          normalized.backgroundColor = draft.backgroundColor ?? 'rgba(244,114,182,0.08)';
        }
        break;
      }
      case 'cross-line': {
        if (end) {
          const horizontal = Math.max(20, Math.abs(end.x - start.x));
          const vertical = Math.max(20, Math.abs(end.y - start.y));
          normalized.meta = {
            ...normalized.meta,
            crossSize: { horizontal, vertical }
          };
        }
        break;
      }
      case 'ruler': {
        if (end) {
          normalized.meta = {
            ...normalized.meta,
            measurement: buildRulerMeta(start, end)
          };
        }
        break;
      }
      case 'icon': {
        normalized.icon = draft.icon ?? selectedEmoji ?? '⭐';
        normalized.fontSize = draft.fontSize ?? 22;
        normalized.color = draft.color ?? '#fcd34d';
        break;
      }
      case 'text': {
        normalized.fontSize = draft.fontSize ?? 14;
        normalized.backgroundColor = draft.backgroundColor ?? 'rgba(15,23,42,0.65)';
        normalized.color = draft.color ?? '#e5e7eb';
        break;
      }
    }

    return normalized;
  }, [selectedEmoji]);

  const handleSaveNote = useCallback(() => {
    if (!pendingNotePoint || !noteDraft.trim()) {
      setShowNoteModal(false);
      setPendingNotePoint(null);
      setNoteDraft('');
      return;
    }

    const textDrawing: DrawingObject = {
      id: `drawing-${Date.now()}`,
      type: 'text',
      points: [pendingNotePoint],
      color: '#e5e7eb',
      width: 1.2,
      style: 'solid',
      locked: false,
      visible: true,
      text: noteDraft.trim(),
      backgroundColor: 'rgba(15,23,42,0.65)'
    };
    addDrawing(finalizeDrawing(textDrawing));
    setShowNoteModal(false);
    setPendingNotePoint(null);
    setNoteDraft('');
    showToast('Note added');
  }, [pendingNotePoint, noteDraft, addDrawing, finalizeDrawing, showToast]);

  const handleCancelNote = useCallback(() => {
    setShowNoteModal(false);
    setPendingNotePoint(null);
    setNoteDraft('');
  }, []);


  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (interactionsLocked) return;
    cancelInertia();
    cancelZoomAnimation();
    dragSampleRef.current.velocity = 0;
    dragSampleRef.current.lastTs = performance.now();

    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    if (activeTool !== 'cursor') {
      const point = getPointerPoint(e);
      if (!point) return;

      if (activeTool === 'text') {
        if (!point) return;
        setPendingNotePoint(point);
        setNoteDraft('');
        setShowNoteModal(true);
        return;
      }

      if (activeTool === 'icon') {
        const emoji = selectedEmoji ?? '⭐';
        if (!selectedEmoji) {
          setSelectedEmoji(emoji);
        }
        const iconDrawing: DrawingObject = {
          id: `drawing-${Date.now()}`,
          type: 'icon',
          points: [point],
          color: '#fcd34d',
          width: 1,
          style: 'solid',
          locked: false,
          visible: true,
          icon: emoji
        };
        addDrawing(finalizeDrawing(iconDrawing));
        showToast('Icono añadido');
        return;
      }


      const isLineTool = LINE_TOOL_SET.has(activeTool);
      const baseColor = isLineTool ? strokeColor : (TOOL_COLOR_MAP[activeTool] ?? strokeColor);
      const baseWidth = isLineTool ? strokeWidth : (activeTool === 'freehand' ? 2.2 : 1.5);

      setIsDrawing(true);
      setCurrentDrawing({
        id: `drawing-${Date.now()}`,
        type: activeTool,
        points: [point],
        color: baseColor,
        width: baseWidth,
        style: 'solid',
        locked: false,
        visible: true,
        backgroundColor: activeTool === 'rectangle' ? 'rgba(96,165,250,0.15)' : undefined
      } as DrawingObject);
      return;
    }

    if (cursorType === 'eraser' && tryEraseDrawing(rawX, rawY)) {
      return;
    }

    if (visibleData.length) {
      const { min, max } = priceWindowRef.current;
      const snappedIndex = coordsRef.current.snapToCandle(rawX, chartWidth, visibleData.length);
      setSelectedCandleIndex(snappedIndex);

      const price = coordsRef.current.pixelToPrice(
        rawY,
        chartHeight,
        min,
        max
      );
      setClickedPrice({ x: rawX, y: rawY, price });
    }
    isDraggingRef.current = true;
    dragSampleRef.current.lastTs = performance.now();
    lastMouseXRef.current = e.clientX;
  }, [activeTool, cursorType, getPointerPoint, visibleData, chartWidth, chartHeight, addDrawing, finalizeDrawing, showToast, selectedEmoji, setSelectedEmoji, setIsDrawing, setCurrentDrawing, tryEraseDrawing, interactionsLocked, strokeColor, strokeWidth, cancelInertia, cancelZoomAnimation]);

  const handlePointerUp = useCallback(() => {
    if (isDrawing && currentDrawing) {
      const normalized = finalizeDrawing(currentDrawing as DrawingObject);
      addDrawing(normalized);
      setIsDrawing(false);
      setCurrentDrawing(null);
    }
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;
    if (!isDrawing && !currentDrawing && wasDragging) {
      startInertia(dragSampleRef.current.velocity);
    }
  }, [isDrawing, currentDrawing, finalizeDrawing, addDrawing, setIsDrawing, setCurrentDrawing, startInertia]);

  const takeScreenshot = useCallback(() => {
    const priceCanvas = chartRef.current;
    if (!priceCanvas) {
      return;
    }

    const gridCanvas = gridRef.current;
    const volumeCanvas = volumeRef.current;
    const drawingsCanvas = drawingsRef.current;
    const overlayCanvas = overlayRef.current;

    const priceHeight = priceCanvas.height || 0;
    const volumeHeightPx = volumeCanvas?.height ?? 0;
    const overlayHeightPx = overlayCanvas?.height ?? priceHeight + volumeHeightPx;
    const exportWidth = priceCanvas.width || gridCanvas?.width || 0;
    const exportHeight = Math.max(priceHeight + volumeHeightPx, overlayHeightPx);

    if (!exportWidth || !exportHeight) {
      return;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    if (gridCanvas) {
      ctx.drawImage(gridCanvas, 0, 0, gridCanvas.width, gridCanvas.height);
    }

    ctx.drawImage(priceCanvas, 0, 0, priceCanvas.width, priceCanvas.height);

    if (volumeCanvas) {
      ctx.drawImage(volumeCanvas, 0, priceHeight, volumeCanvas.width, volumeCanvas.height);
    }

    if (drawingsCanvas) {
      ctx.drawImage(drawingsCanvas, 0, 0, drawingsCanvas.width, drawingsCanvas.height);
    }

    if (overlayCanvas) {
      ctx.drawImage(overlayCanvas, 0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    const link = document.createElement('a');
    const normalizedSymbol = symbol.replace(/[^a-z0-9]+/gi, '-');
    link.download = `${normalizedSymbol}-${timeframe}-viainti.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast(strings.toasts.screenshot);
  }, [showToast, strings.toasts.screenshot, symbol, timeframe]);

  const handlePointerMoveDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (interactionsLocked) return;
    if (isDrawing && currentDrawing) {
      const point = getPointerPoint(e);
      if (!point) return;

      if (!currentDrawing.points) return;
      const updatedPoints = [...currentDrawing.points];
      const isFreehand = (currentDrawing as DrawingObject).type === 'freehand';
      if (isFreehand) {
        updatedPoints.push(point);
      } else {
        updatedPoints[1] = point;
      }
      setCurrentDrawing({ ...currentDrawing, points: updatedPoints });
      return;
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMouseXRef.current;
      const now = performance.now();
      const lastTs = dragSampleRef.current.lastTs || now;
      const deltaTime = Math.max(1, now - lastTs);
      dragSampleRef.current.velocity = deltaX / deltaTime;
      dragSampleRef.current.lastTs = now;
      applyPanDelta(deltaX);
      lastMouseXRef.current = e.clientX;
    }
  }, [isDrawing, currentDrawing, getPointerPoint, setCurrentDrawing, interactionsLocked, applyPanDelta]);
  
  const referenceCandle =
    selectedCandleIndex !== null && visibleData[selectedCandleIndex]
      ? visibleData[selectedCandleIndex]
      : visibleData[visibleData.length - 1];

  const referenceTimestamp = referenceCandle?.timestamp ?? null;

  const currentTimeLabel = useMemo(() => {
    const source = referenceTimestamp ?? Date.now();
    return timeFormatter.format(new Date(source));
  }, [referenceTimestamp, timeFormatter]);


  const leftRailActions = useMemo(() => ([
    { key: 'zoomIn', icon: <BsZoomIn />, onClick: () => handleQuickZoom('in'), active: false, label: strings.actions.zoomIn },
    { key: 'zoomOut', icon: <BsZoomOut />, onClick: () => handleQuickZoom('out'), active: false, label: strings.actions.zoomOut },
    { key: 'lock', icon: <BsLock />, onClick: toggleInteractionsLock, active: interactionsLocked, label: interactionsLocked ? strings.actions.unlock : strings.actions.lock },
    { key: 'hide', icon: <BsEyeSlash />, onClick: toggleDrawingsHidden, active: drawingsHidden, label: drawingsHidden ? strings.actions.show : strings.actions.hide },
    { key: 'reset', icon: <BsArrowRepeat />, onClick: handleResetView, active: false, label: strings.actions.reset },
    { key: 'magnet', icon: <BsMagnet />, onClick: toggleMagnet, active: magnetEnabled, label: magnetEnabled ? strings.actions.magnetOn : strings.actions.magnetOff },
    { key: 'snapshot', icon: <BsCamera />, onClick: takeScreenshot, active: false, label: strings.actions.capture },
    { key: 'indicators', icon: <BsBarChartSteps />, onClick: toggleIndicatorsPanel, active: showIndicatorsPanel, label: strings.actions.indicators }
  ]), [handleQuickZoom, handleResetView, toggleInteractionsLock, toggleDrawingsHidden, toggleMagnet, toggleIndicatorsPanel, interactionsLocked, drawingsHidden, magnetEnabled, showIndicatorsPanel, takeScreenshot, strings.actions]);

  const seriesIconMap: Record<SeriesType, React.ReactNode> = {
    candles: <BsBarChart />,
    bars: <BsBarChartSteps />,
    hollow: <BsBoundingBoxCircles />,
    line: <BsGraphUp />,
    'line-markers': <BsGraphUp />,
    step: <BsBarChartSteps />,
    area: <BsCollection />,
    'hlc-area': <BsCollection />,
    baseline: <BsGraphDown />,
    columns: <BsBarChartSteps />,
    'high-low': <BsGraphDown />
  };

  const seriesTypeOptions = [
    { value: 'candles', label: 'Velas', icon: seriesIconMap.candles },
    { value: 'bars', label: 'Barras', icon: seriesIconMap.bars },
    { value: 'hollow', label: 'Hollow', icon: seriesIconMap.hollow },
    { value: 'line', label: 'Línea', icon: seriesIconMap.line },
    { value: 'line-markers', label: 'Línea + puntos', icon: seriesIconMap['line-markers'] },
    { value: 'step', label: 'Step', icon: seriesIconMap.step },
    { value: 'area', label: 'Área', icon: seriesIconMap.area },
    { value: 'hlc-area', label: 'HLC Área', icon: seriesIconMap['hlc-area'] },
    { value: 'baseline', label: 'Baseline', icon: seriesIconMap.baseline },
    { value: 'columns', label: 'Columnas', icon: seriesIconMap.columns },
    { value: 'high-low', label: 'High/Low', icon: seriesIconMap['high-low'] }
  ];

  const cursorCss =
    isDraggingRef.current
      ? 'grabbing'
      : cursorType === 'cross'
        ? 'crosshair'
        : cursorType === 'dot'
          ? 'crosshair'
          : cursorType === 'arrow'
            ? 'default'
            : cursorType === 'eraser'
              ? 'crosshair'
              : 'default';

  return (
    <div
      ref={containerRef}
      style={{
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        minHeight: isFullscreen ? '100vh' : '640px',
        background: activeTheme.pageBg,
        color: activeTheme.textPrimary,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : 'auto'
      }}
    >
      <motion.div
        style={{
          background: `linear-gradient(120deg, ${activeTheme.heroFrom} 0%, ${activeTheme.heroTo} 100%)`,
          borderBottom: `1px solid ${activeTheme.panelBorder}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? '12px' : '16px',
          alignItems: 'center',
          padding: isMobile ? '12px 16px' : '16px 20px',
          boxShadow: elevatedShadow
        }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', minWidth: 0 }}>
          <div style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.cardBorder}`, borderRadius: '14px', padding: '10px 16px', minWidth: '160px', color: activeTheme.textPrimary }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: activeTheme.textSecondary, marginBottom: '4px' }}>{strings.symbolLabel}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: activeTheme.textPrimary, fontWeight: 600, gap: '10px' }}>
              <span style={{ fontSize: '15px' }}>{symbol}</span>
              <span style={{ fontSize: '12px', background: activeTheme.accent, color: '#fff', padding: '2px 10px', borderRadius: '999px' }}>{timeframe}</span>
            </div>
          </div>
          <motion.div
            key={currentPrice}
            style={{ background: activeTheme.cardBg, border: `1px solid ${priceChange >= 0 ? '#16a34a' : '#f43f5e'}`, borderRadius: '14px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '210px', color: activeTheme.textPrimary }}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontSize: '20px', fontWeight: 700, color: activeTheme.textPrimary }}>{numberFormatter.format(currentPrice)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: activeTheme.textSecondary }}>{strings.priceChangeLabel}</span>
              <motion.span
                key={priceChange}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: priceChange >= 0 ? '#16a34a' : '#f43f5e',
                  background: themePreset === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(15,23,42,0.5)',
                  padding: '4px 10px',
                  borderRadius: '999px'
                }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {priceChange >= 0 ? '+' : ''}{numberFormatter.format(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{shortNumberFormatter.format(priceChangePercent)}%)
              </motion.span>
            </div>
          </motion.div>
          {referenceCandle && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', padding: '10px 14px', border: '1px solid #1f2937', color: '#94a3b8', fontSize: '12px' }}>
              {[
                { label: 'O', value: referenceCandle.open },
                { label: 'H', value: referenceCandle.high },
                { label: 'L', value: referenceCandle.low },
                { label: 'C', value: referenceCandle.close },
                { label: 'V', value: referenceCandle.volume ?? 0 }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', minWidth: '50px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            background: activeTheme.panelBg,
            borderRadius: '16px',
            border: `1px solid ${activeTheme.panelBorder}`,
            overflowX: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{strings.timeframeTitle}</span>
            <span style={{ fontSize: '11px', color: '#f8fafc', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.6)' }}>{timeframe}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: 0, overflowX: 'auto', paddingBottom: '4px' }}>
            {['1m', '3m', '5m', '15m', '30m', '1h', '4h'].map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                style={{
                  background: timeframe === tf ? activeTheme.accent : activeTheme.panelBg,
                  color: timeframe === tf ? '#f8fafc' : activeTheme.textSecondary,
                  border: `1px solid ${timeframe === tf ? activeTheme.accent : activeTheme.panelBorder}`,
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: '0 0 auto',
                  whiteSpace: 'nowrap'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5f5', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <BsClockHistory />
            <span>{strings.axis.time}: {currentTimeLabel}</span>
          </div>
          <select
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            style={{
              background: 'rgba(15,23,42,0.8)',
              color: '#e2e8f0',
              border: '1px solid #1f2937',
              padding: '10px 36px 10px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 10px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '14px',
              minWidth: '120px',
              flexShrink: 0
            }}
          >
            <option value="1m">1m</option>
            <option value="3m">3m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="30m">30m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="12h">12h</option>
            <option value="1D">1D</option>
            <option value="3D">3D</option>
            <option value="1W">1W</option>
            <option value="1M">1M</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowSeriesMenu(!showSeriesMenu)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: `1px solid ${showSeriesMenu ? activeTheme.accent : iconBaseBg}`,
              background: showSeriesMenu ? activeTheme.accent : iconBaseBg,
              color: iconBaseColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={strings.buttons.series}
            aria-label={strings.buttons.series}
          >
            {seriesIconMap[seriesType] ?? <BsGraphUp />}
          </button>
          <button
            onClick={toggleIndicatorsPanel}
            style={{
              background: showIndicatorsPanel ? '#2563eb' : 'rgba(15,23,42,0.6)',
              color: '#e2e8f0',
              border: '1px solid #1f2937',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {strings.buttons.indicators}
          </button>
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: `1px solid ${showConfigPanel ? activeTheme.accent : iconBaseBg}`,
              background: showConfigPanel ? activeTheme.accent : iconBaseBg,
              color: iconBaseColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={strings.buttons.config}
            aria-label={strings.buttons.config}
          >
            <BsGear />
          </button>
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: `1px solid ${isFullscreen ? activeTheme.accent : iconBaseBg}`,
              background: isFullscreen ? activeTheme.accent : iconBaseBg,
              color: iconBaseColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isFullscreen ? strings.buttons.fullscreenExit : strings.buttons.fullscreenEnter}
            aria-label={isFullscreen ? strings.buttons.fullscreenExit : strings.buttons.fullscreenEnter}
          >
            <BsArrowsFullscreen />
          </button>
          <button
            onClick={takeScreenshot}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: `1px solid ${iconBaseBg}`,
              background: iconBaseBg,
              color: iconBaseColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={strings.buttons.screenshot}
            aria-label={strings.buttons.screenshot}
          >
            <BsCamera />
          </button>
          <button
            onClick={() => setShowQuickTips(prev => !prev)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: `1px solid ${showQuickTips ? activeTheme.accent : iconBaseBg}`,
              background: showQuickTips ? activeTheme.accent : iconBaseBg,
              color: iconBaseColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={strings.buttons.help}
            aria-label={strings.buttons.help}
          >
            <BsQuestionCircle />
          </button>
        </div>
      </motion.div>
      {derivedStats && (
        <div style={{ padding: '16px 20px 0', background: activeTheme.panelBg, borderBottom: `1px solid ${activeTheme.panelBorder}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ ...metricCardStyle, background: activeTheme.cardBg, border: `1px solid ${activeTheme.cardBorder}` }}>
              <span style={{ ...metricLabelStyle, color: activeTheme.textSecondary }}>Trading range</span>
              <span style={{ ...metricValueStyle, color: activeTheme.textPrimary }}>{numberFormatter.format(derivedStats.range)}</span>
              <span style={{ ...metricSubValueStyle, color: activeTheme.textSecondary }}>{derivedStats.rangePct.toFixed(2)}%</span>
            </div>
            <div style={{ ...metricCardStyle, background: activeTheme.cardBg, border: `1px solid ${activeTheme.cardBorder}` }}>
              <span style={{ ...metricLabelStyle, color: activeTheme.textSecondary }}>Avg volume</span>
              <span style={{ ...metricValueStyle, color: activeTheme.textPrimary }}>{shortNumberFormatter.format(derivedStats.avgVolume)}</span>
              <span style={{ ...metricSubValueStyle, color: activeTheme.textSecondary }}>Last {derivedStats.samples} samples</span>
            </div>
            <div style={{ ...metricCardStyle, background: activeTheme.cardBg, border: `1px solid ${activeTheme.cardBorder}` }}>
              <span style={{ ...metricLabelStyle, color: activeTheme.textSecondary }}>Volatility</span>
              <span style={{ ...metricValueStyle, color: activeTheme.textPrimary }}>{derivedStats.volatility.toFixed(2)}%</span>
              <span style={{ ...metricSubValueStyle, color: activeTheme.textSecondary }}>Abs move mean</span>
            </div>
            <div style={{ ...metricCardStyle, background: activeTheme.cardBg, border: `1px solid ${activeTheme.cardBorder}` }}>
              <span style={{ ...metricLabelStyle, color: activeTheme.textSecondary }}>Session</span>
              <span style={{ ...metricValueStyle, color: activeTheme.textPrimary }}>{derivedStats.session}</span>
              <span style={{ ...metricSubValueStyle, color: activeTheme.textSecondary }}>Latency ~{latencyMs}ms</span>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {showQuickTips && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: (isFullscreen ? 'fixed' : 'absolute') as 'fixed' | 'absolute',
              top: isFullscreen ? 80 : 140,
              left: isFullscreen ? 80 : 140,
              maxWidth: '300px',
              background: activeTheme.overlayBg,
              borderRadius: '16px',
              padding: '16px',
              border: `1px solid ${activeTheme.accent}`,
              boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
              zIndex: 1200
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: activeTheme.textPrimary, fontWeight: 600 }}>
              <BsInfoCircle />
              {strings.quickTipsTitle}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: activeTheme.textSecondary, fontSize: '13px' }}>
              {strings.quickTips.map(tip => (
                <li key={tip} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BsCheck2 style={{ color: activeTheme.accent }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowQuickTips(false)}
              style={{
                marginTop: '12px',
                width: '100%',
                background: activeTheme.accent,
                color: '#f8fafc',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {strings.quickTipsButton}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {showNoteModal && (
        <div
          style={{
            position: (isFullscreen ? 'fixed' : 'absolute') as 'fixed' | 'absolute',
            inset: isFullscreen ? 0 : undefined,
            top: isFullscreen ? 0 : 0,
            left: isFullscreen ? 0 : 0,
            right: 0,
            bottom: 0,
            background: activeTheme.overlayBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1600,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: 'min(420px, 90vw)',
              background: activeTheme.panelBg,
              borderRadius: '20px',
              border: `1px solid ${activeTheme.panelBorder}`,
              padding: '24px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: activeTheme.textSecondary }}>Quick note</p>
              <h3 style={{ margin: '4px 0 0', color: activeTheme.textPrimary, fontSize: '18px' }}>Write a quick note in English</h3>
            </div>
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Describe your idea..."
              rows={4}
              style={{
                width: '100%',
                background: activeTheme.plotBg,
                border: `1px solid ${activeTheme.panelBorder}`,
                borderRadius: '12px',
                padding: '12px',
                color: activeTheme.textPrimary,
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleCancelNote}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${activeTheme.panelBorder}`,
                  background: 'transparent',
                  color: activeTheme.textPrimary,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteDraft.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: noteDraft.trim() ? activeTheme.accent : activeTheme.accentSoft,
                  color: '#f8fafc',
                  cursor: noteDraft.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}



      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: isMobile ? '12px' : '16px',
          padding: isFullscreen ? '16px' : isMobile ? '12px 16px 20px' : '16px 20px 24px',
          minHeight: 0,
          alignItems: 'stretch'

        }}
      >
        <div style={{ width: isMobile ? '60px' : '88px', flexShrink: 0, height: '100%' }}>
          <div style={{
            height: '100%',
            borderRadius: '24px',
            border: `1px solid ${themePreset === 'light' ? '#0f172a' : activeTheme.railBorder}`,
            background: themePreset === 'light' ? '#0f172a' : activeTheme.railBg,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '12px 0' : '16px 0'
          }}>
            <DrawingToolbar />
          </div>
        </div>
        <div
          ref={plotAreaRef}
          style={{
            flex: 1,
            position: 'relative',
            background: activeTheme.plotBg,
            cursor: cursorCss,
            borderRadius: '24px',
            border: `1px solid ${activeTheme.plotBorder}`,
            overflow: 'hidden',
            minHeight: isMobile ? '400px' : '520px',
            boxShadow: surfaceShadow
          }}
          onPointerMove={(e) => { handlePointerMove(e); handlePointerMoveDrag(e); }}
          onPointerLeave={handleMouseLeave}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div style={{ position: 'absolute', left: 20, bottom: 90, display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 35 }}>
            {leftRailActions.map(action => {
              const isDisabled = interactionsLocked && ['zoomIn', 'zoomOut', 'reset'].includes(action.key);
              return (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  style={{
                    width: isMobile ? '36px' : '42px',
                    height: isMobile ? '36px' : '42px',
                    borderRadius: '12px',
                    border: `1px solid ${action.active ? activeTheme.accent : leftRailBaseBg}`,
                    background: action.active ? activeTheme.accent : leftRailBaseBg,
                    color: action.active ? '#f8fafc' : (themePreset === 'light' ? '#f8fafc' : activeTheme.textPrimary),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '16px' : '18px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.4 : 1,
                    transition: 'all 0.2s'
                  }}
                  title={action.label}
                  disabled={isDisabled}
                >
                  {action.icon}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, width: `${priceScaleWidth}px`, height: '100%', background: activeTheme.scaleBg, borderLeft: `1px solid ${activeTheme.plotBorder}`, fontSize: '11px', color: activeTheme.textSecondary, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 0' }}>
            <div style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.08em', paddingLeft: '5px', marginBottom: '6px' }}>{strings.axis.price}</div>
            {priceLabels.map((label, i) => (
              <div key={i} style={{ textAlign: 'left', paddingLeft: '5px', color: activeTheme.textPrimary }}>{label}</div>
            ))}
          </div>
          <canvas ref={gridRef} width={chartWidth} height={chartHeight} style={{ position: 'absolute', left: 0, top: 0, width: chartWidth, height: chartHeight }} />
          <canvas ref={chartRef} width={chartWidth} height={chartHeight} style={{ position: 'absolute', left: 0, top: 0, width: chartWidth, height: chartHeight }} />
          <canvas ref={volumeRef} width={chartWidth} height={volumeHeight} style={{ position: 'absolute', left: 0, top: chartHeight, width: chartWidth, height: volumeHeight }} />
          <canvas ref={drawingsRef} width={chartWidth} height={overlayHeight} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', width: chartWidth, height: overlayHeight }} />
          <canvas ref={overlayRef} width={chartWidth} height={overlayHeight} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', width: chartWidth, height: overlayHeight }} />
          <div
            style={{ position: 'absolute', bottom: 0, left: 0, right: priceScaleWidth, height: `${timeScaleHeight}px`, background: activeTheme.scaleBg, borderTop: `1px solid ${activeTheme.plotBorder}`, fontSize: '11px', color: activeTheme.textSecondary, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', padding: '4px 10px' }}
          >
            <span style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.08em' }}>{strings.axis.time}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: activeTheme.textPrimary }}>
              {timeLabels.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>
          </div>
          {clickedPrice && (
            <div style={{
              position: 'absolute',
              background: '#1e222d',
              color: '#d1d4dc',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              pointerEvents: 'none',
              zIndex: 10,
              left: clickedPrice.x + 10,
              top: clickedPrice.y - 10,
              border: '1px solid #2a2e39',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}>
              ${clickedPrice.price.toFixed(2)}
            </div>
          )}
          {isSeriesLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)',
                zIndex: 50
              }}
            >
              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: '999px',
                  background: '#111827',
                  border: '1px solid #2962ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '999px',
                    background: '#2962ff',
                    boxShadow: '0 0 12px #2962ff'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#e5e7eb', fontWeight: 500 }}>
                  Updating series...
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key={toastMessage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            style={{
              position: (isFullscreen ? 'fixed' : 'absolute') as 'fixed' | 'absolute',
              bottom: isFullscreen ? 24 : 16,
              right: isFullscreen ? 24 : 16,
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid #1d4ed8',
              borderRadius: '999px',
              padding: '10px 18px',
              color: '#e2e8f0',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 1200
            }}
          >
            <BsInfoCircle style={{ color: '#60a5fa' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {showSeriesMenu && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '140px',
          background: activeTheme.panelBg,
          border: `1px solid ${activeTheme.panelBorder}`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '240px',
          maxHeight: '60vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#d1d4dc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BsGraphUp />
            Series Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            {seriesTypeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => {
                  setSeriesType(value as SeriesType);
                  setShowSeriesMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '10px',
                  border: seriesType === value ? '1px solid #2563eb' : '1px solid #2a2e39',
                  background: seriesType === value ? 'rgba(37,99,235,0.15)' : 'rgba(2,6,23,0.5)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {showIndicatorsPanel && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          background: activeTheme.panelBg,
          border: `1px solid ${activeTheme.panelBorder}`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '250px',
          maxHeight: '60vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#d1d4dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Indicators
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowConfigPanel(!showConfigPanel)} style={{ background: 'transparent', border: 'none', color: '#b2b5be', cursor: 'pointer', fontSize: '16px' }}>
                <BsGear />
              </button>
              <button onClick={takeScreenshot} style={{ background: 'transparent', border: 'none', color: '#b2b5be', cursor: 'pointer', fontSize: '16px' }}>
                <BsCamera />
              </button>
            </div>
          </div>
          {['SMA', 'EMA', 'RSI', 'MACD'].map(indicatorName => {
            const isActive = indicators.some(config => config.name === indicatorName && config.visible);
            return (
              <div key={indicatorName} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newConfig: IndicatorConfig = {
                        name: indicatorName,
                        params: indicatorName === 'SMA' ? { period: 20 } :
                               indicatorName === 'EMA' ? { period: 20 } :
                               indicatorName === 'RSI' ? { period: 14 } :
                               { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
                        color: '#2962ff',
                        visible: true
                      };
                      addIndicator(newConfig);
                    } else {
                      removeIndicator(indicatorName);
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '12px', color: '#b2b5be' }}>{indicatorName}</span>
              </div>
            );
          })}
        </div>
      )}
      {showConfigPanel && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '280px',
          background: activeTheme.panelBg,
          border: `1px solid ${activeTheme.panelBorder}`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '240px',
          maxHeight: '60vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: activeTheme.textPrimary }}>{strings.config.title}</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: activeTheme.textSecondary, display: 'block', marginBottom: '4px' }}>{strings.config.language}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'es')} style={{ width: '100%', background: activeTheme.plotBg, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.panelBorder}`, padding: '6px', borderRadius: '8px' }}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: activeTheme.textSecondary, display: 'block', marginBottom: '4px' }}>{strings.config.colors}</label>
            <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)} style={{ width: '100%', background: activeTheme.plotBg, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.panelBorder}`, padding: '6px', borderRadius: '8px' }}>
              <option value="green">{strings.config.colorOptions.green}</option>
              <option value="red">{strings.config.colorOptions.red}</option>
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: activeTheme.textSecondary, display: 'block', marginBottom: '6px' }}>Theme preset</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {themeOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => setThemePreset(option.key)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${themePreset === option.key ? activeTheme.accent : activeTheme.panelBorder}`,
                    background: themePreset === option.key ? activeTheme.accentSoft : 'transparent',
                    color: activeTheme.textPrimary,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {themePreset === 'custom' && (
            <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              {CUSTOM_THEME_FIELDS.map(field => (
                <label key={field.key} style={{ fontSize: '11px', color: activeTheme.textSecondary, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>{field.label}</span>
                  <input
                    type="color"
                    value={customTheme[field.key]}
                    onChange={(event) => handleCustomThemeChange(field.key, event.target.value)}
                    style={{ width: '100%', height: '34px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: 'transparent' }}
                  />
                </label>
              ))}
            </div>
          )}
          <div style={{ fontSize: '12px', color: activeTheme.textSecondary }}>{strings.config.soon}</div>
        </div>
      )}
      <div style={{ padding: isMobile ? '8px 16px' : '10px 20px', background: activeTheme.panelBg, borderTop: `1px solid ${activeTheme.panelBorder}`, display: 'flex', flexWrap: 'wrap', gap: isMobile ? '12px' : '18px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: activeTheme.textSecondary }}>
        <span>Latency {latencyMs}ms</span>
        <span>Session {derivedStats?.session ?? 'Global'}</span>
        <span>Feed Binance Composite</span>
        <span>Security AES-256</span>
      </div>
    </div>
  );
};

export default memo(TradingViewChart);