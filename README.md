# Viainti Chart

Advanced React OHLC charting library with TradingView-style interface, built by Viainti. Features indicators, drawings, responsive design, and canvas rendering optimized for fintech dashboards and trading applications.

## Installation

```bash
npm install viainti-chart
```

> The package ships ESM, CommonJS and type definitions. Requires React, React DOM, and Framer Motion as peer dependencies.
>
> If npm reports `ERR! 404 Not Found`, run `npm view viainti-chart version` to confirm the package exists, check your registry with `npm config get registry`, and clear any stale cache via `npm cache verify` (or `npm cache clean --force`) before retrying the install.

## Usage

### React example

```tsx
import React from 'react';
import { TradingViewChart, OHLCData } from 'viainti-chart';

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

import { TradingViewChart, OHLCData } from 'viainti-chart';

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
import { Chart, OHLCData } from 'viainti-chart';

const sample: OHLCData[] = [{ open: 10, high: 12, low: 9, close: 11 }];

export function Spark() {
  return <Chart data={sample} width={320} height={160} />;
}
```

### Compact chart (sin métricas)

```tsx
import { TradingViewChart, OHLCData } from 'viainti-chart';

const cached: OHLCData[] = [...];

export function InlineCard() {
  return (
    <TradingViewChart
      data={cached}
      symbol="BTC/USDT"
      showStats={false}
      showHeaderStats={false}
    />
  );
}
```

`showStats={false}` elimina las tarjetas de “Trading range / Avg volume / Volatility” y `showHeaderStats={false}` oculta la banda superior (símbolo + O/H/L/C/V) y el footer “Feed Binance Composite”. Para verlo en vivo ejecuta `npm run dev` y abre `http://localhost:5173?mode=simple`; cambia a `?mode=advanced` para volver al layout completo.

## API

### `<TradingViewChart />`
- `data: OHLCData[]` – candles with `open`, `high`, `low`, `close`, optional `volume` & `timestamp`.
- `symbol?: string` – label displayed in the header (default `VIA/USDT`).
- `showStats?: boolean` – toggle the lower metric cards (defaults to `true`).
- `showHeaderStats?: boolean` – hides the hero ribbon/footer for an ultra-compact mode when set to `false`.

### `<Chart />`
- `data: OHLCData[]`
- `width?: number` (default `800`)
- `height?: number` (default `400`)
- Available through both `Chart` and the alias `OHLCChart` for backwards compatibility.

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

## Publishing a new version

```bash
npm run build          # ensure dist/ is up to date
npm version patch      # or minor/major as needed
npm publish --access public
```

> If `npm publish` returns `Access token expired or revoked`, run `npm logout`, then authenticate again with `npm login` (or `npm adduser`) before retrying. Use `npm whoami` to confirm the session is active and `npm config get registry` to ensure you're pushing to `https://registry.npmjs.org/`.
>
> Para etiquetar la build compacta, publica normalmente (tag `latest`) y luego añade un dist-tag separado, por ejemplo: `npm dist-tag add viainti-chart@1.0.3 simple`. Así podrás instalarla con `npm install viainti-chart@simple` en proyectos que necesiten el modo reducido por defecto.

## Credits

Built by [Viainti](https://www.viainti.com) - Advanced fintech solutions and trading tools.

## License

ISC
