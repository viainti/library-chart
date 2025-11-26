import type { OHLCData, IndicatorConfig, DrawingTool, CursorType, DrawingObject } from './types';
import { createStore } from './simpleStore';

interface ChartState {
  data: OHLCData[];
  visibleData: OHLCData[];
  timeframe: string;
  zoomLevel: number;
  panOffset: number;
  indicators: IndicatorConfig[];
  showIndicatorsPanel: boolean;
  activeTool: DrawingTool;
  cursorType: CursorType;
  strokeColor: string;
  strokeWidth: number;
  magnetEnabled: boolean;
  drawings: DrawingObject[];
  selectedDrawing: string | null;
  isDrawing: boolean;
  currentDrawing: Partial<DrawingObject> | null;
  selectedEmoji: string | null;
  interactionsLocked: boolean;
  drawingsHidden: boolean;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  isLoading: boolean;
  setData: (data: OHLCData[]) => void;
  setVisibleData: (visibleData: OHLCData[]) => void;
  setTimeframe: (timeframe: string) => void;
  setZoomLevel: (zoom: number) => void;
  setPanOffset: (offset: number) => void;
  addIndicator: (indicator: IndicatorConfig) => void;
  removeIndicator: (name: string) => void;
  toggleIndicatorsPanel: () => void;
  updateCurrentPrice: (price: number) => void;
  setLoading: (loading: boolean) => void;
  setActiveTool: (tool: DrawingTool) => void;
  setCursorType: (type: CursorType) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  toggleMagnet: () => void;
  addDrawing: (drawing: DrawingObject) => void;
  updateDrawing: (id: string, updates: Partial<DrawingObject>) => void;
  deleteDrawing: (id: string) => void;
  clearDrawings: () => void;
  selectDrawing: (id: string | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setCurrentDrawing: (drawing: Partial<DrawingObject> | null) => void;
  setSelectedEmoji: (emoji: string | null) => void;
  toggleInteractionsLock: () => void;
  toggleDrawingsHidden: () => void;
}

export const useChartStore = createStore<ChartState>((set) => ({
  data: [],
  visibleData: [],
  timeframe: '1h',
  zoomLevel: 1,
  panOffset: 0,
  indicators: [],
  showIndicatorsPanel: false,
  activeTool: 'cursor',
  cursorType: 'cross',
  strokeColor: '#8ab4ff',
  strokeWidth: 1.5,
  magnetEnabled: true,
  drawings: [],
  selectedDrawing: null,
  isDrawing: false,
  currentDrawing: null,
  selectedEmoji: null,
  interactionsLocked: false,
  drawingsHidden: false,
  currentPrice: 0,
  priceChange: 0,
  priceChangePercent: 0,
  isLoading: false,
  setData: (data: OHLCData[]) => {
    const lastPrice = data[data.length - 1]?.close || 0;
    const firstPrice = data[0]?.close || 0;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

    set({
      data,
      currentPrice: lastPrice,
      priceChange,
      priceChangePercent
    });
  },
  setVisibleData: (visibleData: OHLCData[]) => set({ visibleData }),
  setTimeframe: (timeframe: string) => set({ timeframe }),
  setZoomLevel: (zoomLevel: number) => set({ zoomLevel }),
  setPanOffset: (panOffset: number) => set({ panOffset }),
  addIndicator: (indicator: IndicatorConfig) => set((state: ChartState) => ({
    indicators: [...state.indicators, indicator]
  })),
  removeIndicator: (name: string) => set((state: ChartState) => ({
    indicators: state.indicators.filter((ind) => ind.name !== name)
  })),
  toggleIndicatorsPanel: () => set((state: ChartState) => ({
    showIndicatorsPanel: !state.showIndicatorsPanel
  })),
  updateCurrentPrice: (currentPrice: number) => set({ currentPrice }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setActiveTool: (activeTool: DrawingTool) => set({ activeTool }),
  setCursorType: (cursorType: CursorType) => set({ cursorType }),
  setStrokeColor: (strokeColor: string) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth: number) => set({ strokeWidth }),
  toggleMagnet: () => set((state: ChartState) => ({ magnetEnabled: !state.magnetEnabled })),
  addDrawing: (drawing: DrawingObject) => set((state: ChartState) => ({
    drawings: [...state.drawings, drawing]
  })),
  updateDrawing: (id: string, updates: Partial<DrawingObject>) => set((state: ChartState) => ({
    drawings: state.drawings.map((d) => (d.id === id ? { ...d, ...updates } : d))
  })),
  deleteDrawing: (id: string) => set((state: ChartState) => ({
    drawings: state.drawings.filter((d) => d.id !== id),
    selectedDrawing: state.selectedDrawing === id ? null : state.selectedDrawing
  })),
  clearDrawings: () => set({ drawings: [], selectedDrawing: null }),
  selectDrawing: (selectedDrawing: string | null) => set({ selectedDrawing }),
  setIsDrawing: (isDrawing: boolean) => set({ isDrawing }),
  setCurrentDrawing: (currentDrawing: Partial<DrawingObject> | null) => set({ currentDrawing }),
  setSelectedEmoji: (selectedEmoji: string | null) => set({ selectedEmoji }),
  toggleInteractionsLock: () => set((state: ChartState) => {
    const nextLocked = !state.interactionsLocked;
    return {
      interactionsLocked: nextLocked,
      activeTool: nextLocked ? 'cursor' : state.activeTool,
      isDrawing: nextLocked ? false : state.isDrawing
    };
  }),
  toggleDrawingsHidden: () => set((state: ChartState) => ({ drawingsHidden: !state.drawingsHidden }))
}));
