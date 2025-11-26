# Viainti Chart

Advanced React OHLC charting library with TradingView-style interface, built by Viainti. Features indicators, drawings, responsive design, and canvas rendering optimized for fintech dashboards and trading applications.

## Installation

```bash
npm install intitrading
```

> The package ships ESM, CommonJS and type definitions. Requires React, React DOM, and Framer Motion as peer dependencies.

## Usage

### React example

```tsx
import React from 'react';
import { TradingViewChart, OHLCData } from 'intitrading';

const data: OHLCData[] = [
  { open: 100, high: 110, low: 95, close: 105, volume: 1200, timestamp: Date.now() - 60000 },
  // ...more candles
];

export default function Demo() {
  return (
    <div style={{ height: '600px' }}>
      <TradingViewChart data={data} symbol="BTC/USDT" />
    </div>
  );
}
```

### Next.js (App Router) example

```tsx
'use client';

import { TradingViewChart, OHLCData } from 'intitrading';

const data: OHLCData[] = [
  { open: 100, high: 110, low: 95, close: 105, volume: 1200, timestamp: Date.now() },
];

export default function ChartBlock() {
  return (
    <section className="h-[520px]">
      <TradingViewChart data={data} symbol="ETH/USDT" />
    </section>
  );
}
```

### Minimal canvas

```tsx
import { Chart, OHLCData } from 'intitrading';

const sample: OHLCData[] = [{ open: 10, high: 12, low: 9, close: 11 }];

export function Spark() {
  return <Chart data={sample} width={320} height={160} />;
}
```

## API

### `<TradingViewChart />`
- `data: OHLCData[]` – candles with `open`, `high`, `low`, `close`, optional `volume` & `timestamp`.
- `symbol?: string` – label displayed in the header (default `VIA/USDT`).

### `<Chart />`
- `data: OHLCData[]`
- `width?: number` (default `800`)
- `height?: number` (default `400`)

### `OHLCData`
```ts
interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp?: number;
}
```

## Features

- 📱 **Fully Responsive** – Optimized for mobile and desktop with adaptive layouts.
- 🧭 **Inline timeframe chips** – horizontal pills with real-time clock and dropdown.
- 🖊️ **Full drawing stack** – cursors, trendlines, channels, Fibonacci, emojis, ruler and more.
- 📈 **Indicator panel** – SMA, EMA, RSI, MACD toggleable with presets.
- 📸 **Instant screenshots** – download-ready PNG capture directly from the toolbar.
- 🌐 **Bilingual UI** – English/Spanish copy baked into every label.
- ⚙️ **Config popover** – switch languages or color schemes without leaving the canvas.
- 🎨 **Theme support** – Dark, blue, and light themes with custom options.

## Building the library

```bash
npm install
npm run build
```

`rollup` emits:
- `dist/index.mjs` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts`

These entry points are referenced in `package.json` exports, so they can be published to npm immediately.

## Development playground

```bash
npm run dev   # launches the Vite example in /example
```

## Credits

Built by [Viainti](https://www.viainti.com) - Advanced fintech solutions and trading tools.

## License

ISC
