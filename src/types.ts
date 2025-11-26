export interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp?: number;
}

export interface ChartProps {
  data: OHLCData[];
  width?: number;
  height?: number;
}

// Drawing Tools Types
export type DrawingTool =
  | 'cursor'
  | 'trendline'
  | 'ray'
  | 'info-line'
  | 'extended-line'
  | 'trend-angle'
  | 'horizontal'
  | 'horizontal-line'
  | 'horizontal-ray'
  | 'vertical-line'
  | 'cross-line'
  | 'parallel'
  | 'rectangle'
  | 'triangle'
  | 'channel'
  | 'regression-trend'
  | 'flat-top-bottom'
  | 'disjoint-channel'
  | 'pitchfork'
  | 'schiff-pitchfork'
  | 'modified-schiff-pitchfork'
  | 'inside-pitchfork'
  | 'fibonacci'
  | 'text'
  | 'icon'
  | 'ruler'
  | 'freehand'
  | 'eraser';

export type CursorType = 'cross' | 'dot' | 'arrow' | 'eraser';

export interface Point {
  x: number;
  y: number;
  price: number;
  time: number;
}

export interface DrawingMeta {
  label?: string;
  measurement?: {
    distancePx: number;
    priceDelta: number;
    percentDelta: number;
  };
  crossSize?: {
    horizontal: number;
    vertical: number;
  };
}

export interface DrawingObject {
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  locked: boolean;
  visible: boolean;
  text?: string;
  icon?: string;
  fontSize?: number;
  backgroundColor?: string;
  meta?: DrawingMeta;
}

export interface DrawingState {
  activeTool: DrawingTool;
  cursorType: CursorType;
  magnetEnabled: boolean;
  drawings: DrawingObject[];
  selectedDrawing: string | null;
  isDrawing: boolean;
  currentDrawing: Partial<DrawingObject> | null;
}

export interface IndicatorData {
  name: string;
  type: 'line' | 'histogram' | 'area';
  data: number[];
  color: string;
  style?: 'solid' | 'dashed' | 'dotted';
  width?: number;
}

export interface IndicatorConfig {
  name: string;
  params: Record<string, any>;
  color: string;
  visible: boolean;
}