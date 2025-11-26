import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TradingViewChart, OHLCData } from '../src/index.ts';
import DexToolsPage from './DexToolsPage';

const INTERVAL_LIMITS: Record<string, number> = {
  '1m': 1000,
  '3m': 1000,
  '5m': 1000,
  '15m': 1000,
  '30m': 1000,
  '1h': 1000,
  '4h': 750,
  '12h': 600,
  '1D': 500,
  '3D': 450,
  '1W': 350,
  '1M': 240
};

const getLimitForInterval = (interval: string) => INTERVAL_LIMITS[interval] ?? 500;

const LandingPage: React.FC = () => {
  const [data, setData] = useState<OHLCData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchMarketData = useCallback(async (targetInterval: string, options: { endTime?: number; append?: boolean } = {}) => {
    const { endTime, append = false } = options;
    const params = new URLSearchParams({
      symbol: 'BTCUSDT',
      interval: targetInterval,
      limit: String(getLimitForInterval(targetInterval))
    });

    if (endTime) {
      params.append('endTime', String(endTime));
    }

    try {
      setError(null);
      if (append) {
        setHistoricalLoading(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`https://api.binance.com/api/v3/klines?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Binance respondió con ${response.status}`);
      }

      const rawData = await response.json();
      const formattedData: OHLCData[] = rawData
        .map((kline: any) => ({
          timestamp: parseInt(kline[0]),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setData(prev => {
        if (append) {
          const merged = [...formattedData, ...prev];
          const unique = new Map<number, OHLCData>();
          merged.forEach(candle => {
            const key = candle.timestamp ?? 0;
            unique.set(key, candle);
          });
          return Array.from(unique.values()).sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
        }
        return formattedData;
      });
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar datos de Binance');
      if (!append) {
        setData([]);
      }
    } finally {
      if (append) {
        setHistoricalLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMarketData(selectedInterval);
  }, [selectedInterval, fetchMarketData]);

  const handleChartTimeframeChange = useCallback((nextInterval: string) => {
    setSelectedInterval(prev => (prev === nextInterval ? prev : nextInterval));
  }, []);

  const handleLoadMoreHistory = useCallback(() => {
    if (!data.length || historicalLoading) {
      return;
    }
    const oldest = data[0]?.timestamp;
    if (!oldest) return;
    fetchMarketData(selectedInterval, { endTime: oldest - 1, append: true });
  }, [data, fetchMarketData, historicalLoading, selectedInterval]);

  const dateFormatter = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };
    if (!/(1D|3D|1W|1M)/.test(selectedInterval)) {
      options.timeStyle = 'short';
    }
    return new Intl.DateTimeFormat('es-ES', options);
  }, [selectedInterval]);

  const rangeLabel = useMemo(() => {
    if (!data.length) {
      return 'Rango no disponible todavía';
    }
    const first = data[0]?.timestamp;
    const last = data[data.length - 1]?.timestamp;
    if (!first || !last) {
      return 'Rango no disponible todavía';
    }
    return `${dateFormatter.format(new Date(first))} → ${dateFormatter.format(new Date(last))}`;
  }, [data, dateFormatter]);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-semibold text-white">intitrading</h1>
          <p className="text-gray-400">Cargando velas de BTC…</p>
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-white animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const lastUpdatedLabel = lastUpdated ? new Date(lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <header className="text-center py-12 px-4">
        <div className="flex flex-col items-center gap-6">
          <img
            src="https://www.viainti.com/images/design-mode/logo-v.png"
            alt="Viainti mark"
            className="h-16 w-auto"
            loading="lazy"
          />
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Viainti Charting Suite
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
            Open-source market infrastructure para escritorios DeFi, DEX dashboards y terminales internos. Integra el widget sin dependencias extra y con datos que respetan el intervalo que seleccione cada trader.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#chart" className="px-6 py-3 rounded-full bg-white text-black font-semibold transition-colors">Lanzar chart vivo</a>
            <a href="#comparison" className="px-6 py-3 rounded-full border border-white/40 text-gray-200 font-semibold hover:border-white transition-colors">Comparar con TradingView</a>
          </div>
        </div>
      </header>

      <section id="chart" className="px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-900/20 px-6 py-4 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="bg-neutral-950 rounded-3xl p-8 shadow-2xl border border-gray-800 overflow-hidden">
            <h2 className="text-2xl font-semibold text-white mb-2 text-center">BTC/USDT · Intervalo dinámico</h2>
            <p className="text-center text-gray-400 mb-6">Selecciona 1h, 4h, diario o minutos desde la barra superior del chart; recargamos Binance con ese intervalo y mantenemos historial extra cuando retrocedes.</p>
            {loading && data.length > 0 && (
              <div className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-gray-300">
                Actualizando {selectedInterval} …
              </div>
            )}
            <div className="h-[900px] w-full rounded-2xl overflow-hidden border border-gray-800/70">
              <TradingViewChart
                data={data}
                symbol="BTC/USDT"
                onTimeframeChange={handleChartTimeframeChange}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
              <div>
                <span className="text-white font-semibold">Intervalo actual:</span> {selectedInterval} · {rangeLabel}
                <span className="ml-3 text-white/60">Última sincronización {lastUpdatedLabel}</span>
              </div>
              <button
                onClick={handleLoadMoreHistory}
                disabled={historicalLoading || !data.length}
                className={`px-5 py-2 rounded-full border text-sm font-semibold transition-colors ${historicalLoading ? 'border-white/20 text-white/40 cursor-wait' : 'border-white/50 text-white hover:border-white'}`}
              >
                {historicalLoading ? 'Cargando velas previas…' : 'Cargar más historial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Core benefits built for modern desks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-neutral-900 rounded-2xl p-6 border border-gray-800 hover:border-white/20 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro-grade indicators</h3>
              <p className="text-gray-300">SMA, EMA, RSI, MACD y presets listos replican los colores nativos del chart para un onboarding inmediato.</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 border border-gray-800 hover:border-white/20 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Creative drawing stack</h3>
              <p className="text-gray-300">Trendlines, canales, Fibonacci, figuras y emojis comparten la misma barra lateral que usamos en producción.</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 border border-gray-800 hover:border-white/20 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Frictionless navigation</h3>
              <p className="text-gray-300">Scroll momentum, zoom fino y chips de timeframe mantienen orientados a traders novatos y seniors.</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 border border-gray-800 hover:border-white/20 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant snapshots</h3>
              <p className="text-gray-300">Capturas listas para Telegram o Notion sin salir del widget ni depender de TradingView.</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 border border-gray-800 hover:border-white/20 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Personal workspace</h3>
              <p className="text-gray-300">Paletas, idiomas, locks y ocultar dibujos mantienen sincronizada a la escuadra.</p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 border border-gray-800 hover:border-white/20 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Live market data</h3>
              <p className="text-gray-300">Feed directo de Binance, ajuste automático por timeframe y carga incremental cuando retrocedes.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="comparison" className="px-4 pb-16">
        <div className="max-w-6xl mx-auto bg-gray-900/50 border border-gray-800 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-white mb-10">Built differently from TradingView</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-4">Viainti advantages</h3>
              <ul className="space-y-3 text-gray-300 text-sm md:text-base text-left">
                <li>• Novice Coach guía cada paso con mensajes contextuales.</li>
                <li>• Bilingüe, chips de tiempo y locks replican la sala donde trabajas.</li>
                <li>• Toolbar idéntica a producción, con emojis, reglas y magnet snaps.</li>
                <li>• Botones de share y captura integrados para no salir del canvas.</li>
              </ul>
            </div>
            <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-2xl font-semibold text-white mb-4">Typical TradingView gaps</h3>
              <ul className="space-y-3 text-gray-400 text-sm md:text-base text-left">
                <li>• Onboarding genérico: los juniors se pierden entre menús.</li>
                <li>• Idioma/colores requieren cuentas pagas y afectan todos los charts.</li>
                <li>• Toolbars cambian entre web, desktop y embeds.</li>
                <li>• Compartir implica exportar y limpiar marcas ajenas.</li>
              </ul>
            </div>
          </div>
          <p className="text-center text-gray-400 mt-8">Viainti permite embebido white-label, sincronización de datos propia y colaboración sin scripts externos.</p>
        </div>
      </section>

      <section id="research" className="px-4 pb-20">
        <div className="max-w-6xl mx-auto bg-neutral-950 border border-gray-800 rounded-3xl p-10 space-y-8">
          <div className="md:flex md:items-start md:justify-between gap-10">
            <div className="md:w-1/2 space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Research notes</p>
              <h2 className="text-3xl font-bold text-white">Por qué intitrading funciona para builders DEX & DeFi</h2>
              <p className="text-gray-300">Exportamos componentes React puros, sin stores externos y con bundle compatible con Rollup/Vite. Eso hace que puedas colocarlo en wallets, dashboards analíticos o terminales internos sin añadir peso ni dependencias.</p>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4">
                <p className="text-sm text-gray-400">Footprint</p>
                <p className="text-2xl font-semibold text-white">~58 kB</p>
                <p className="text-xs text-gray-500">Bundle ESM tree-shakeable</p>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4">
                <p className="text-sm text-gray-400">Plataformas</p>
                <p className="text-2xl font-semibold text-white">Web · Mobile · Desktop</p>
                <p className="text-xs text-gray-500">Next.js, Expo Router, Tauri/Electron</p>
              </div>
            </div>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
            <li className="bg-black/30 border border-gray-800 rounded-2xl p-4">• Store headless para conectar Wagmi, RainbowKit o tu propio data bus.</li>
            <li className="bg-black/30 border border-gray-800 rounded-2xl p-4">• Canvas optimizado mantiene FPS alto aunque dibujes depth maps on-chain.</li>
            <li className="bg-black/30 border border-gray-800 rounded-2xl p-4">• Licencia ISC: forkea, auto-hospeda y audita antes de tocar tesorerías.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};


const getDexToolsContract = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const match = window.location.pathname.match(/^\/dextools\/pair\/(.+)$/i);
  return match ? decodeURIComponent(match[1]) : null;
};

const App: React.FC = () => {
  const [dexContract] = useState(() => getDexToolsContract());
  if (dexContract) {
    return <DexToolsPage contract={dexContract} />;
  }
  return <LandingPage />;


};

export default App;
