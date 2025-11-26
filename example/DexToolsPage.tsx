import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BsArrowRepeat, BsCopy, BsLightningCharge, BsLink45Deg } from 'react-icons/bs';
import { TradingViewChart, type OHLCData } from '../src';

const BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';
const BITQUERY_KEY = (import.meta as any)?.env?.VITE_BITQUERY_KEY ?? '';

const DEX_TRADES_QUERY = `
  query ($address: String!, $limit: Int!) {
    solana {
      dexTrades(
        options: {limit: $limit}
        where: {
          OR: [
            {baseCurrency: {address: {is: $address}}},
            {quoteCurrency: {address: {is: $address}}}
          ]
        }
      ) {
        block {
          timestamp {
            unixtime
          }
        }
        baseCurrency {
          address
          symbol
          name
        }
        quoteCurrency {
          address
          symbol
          name
        }
        market {
          name
        }
        tradeAmount(in: USD)
        quoteAmount
        baseAmount
        quotePrice
        transaction {
          signer
        }
      }
    }
  }
`;

const RESOLUTION_MINUTES: Record<string, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1D': 1440
};

interface StatsSnapshot {
  volume24h: number;
  tx24h: number;
  buyers: number;
  sellers: number;
}

interface PairMeta {
  symbol: string;
  quoteSymbol: string;
  market: string;
  price: number;
  change: number;
  liquidity: number;
  fdv: number;
}

const formatCompactNumber = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
  return formatter.format(value || 0);
};

const DexToolsPage: React.FC<{ contract: string }> = ({ contract }) => {
  const normalizedContract = contract.trim().toLowerCase();
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('1m');
  const [data, setData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pairMeta, setPairMeta] = useState<PairMeta>({
    symbol: 'TOKEN',
    quoteSymbol: 'USDC',
    market: 'Unknown DEX',
    price: 0,
    change: 0,
    liquidity: 0,
    fdv: 0
  });
  const [stats, setStats] = useState<StatsSnapshot>({ volume24h: 0, tx24h: 0, buyers: 0, sellers: 0 });
  const [copied, setCopied] = useState(false);

  const fetchBitqueryData = useCallback(async () => {
    if (!normalizedContract) {
      setError('Debes suministrar un contrato válido.');
      setLoading(false);
      return;
    }
    if (!BITQUERY_KEY) {
      setError('Configura VITE_BITQUERY_KEY en tu entorno para leer Bitquery.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(BITQUERY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': BITQUERY_KEY
        },
        body: JSON.stringify({
          query: DEX_TRADES_QUERY,
          variables: { address: normalizedContract, limit: 900 }
        })
      });

      if (!response.ok) {
        throw new Error(`Bitquery respondió con ${response.status}`);
      }

      const json = await response.json();
      const trades = json?.data?.solana?.dexTrades ?? [];
      if (!trades.length) {
        throw new Error('No encontramos operaciones recientes para este contrato en Solana.');
      }

      const resolution = RESOLUTION_MINUTES[timeframe];
      const candles = buildCandles(trades, resolution, normalizedContract);
      if (!candles.length) {
        throw new Error('Sin datos suficientes para construir velas.');
      }
      setData(candles);

      const lastClose = candles[candles.length - 1]?.close ?? 0;
      const firstClose = candles[0]?.close ?? lastClose;
      const priceChange = firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;

      const snapshot = buildStats(trades, normalizedContract);
      setStats(snapshot);

      const firstTrade = trades[0];
      const meta = normalizeMeta(firstTrade, normalizedContract, lastClose, priceChange, snapshot.volume24h);
      setPairMeta(meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos hablar con Bitquery.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [normalizedContract, timeframe]);

  useEffect(() => {
    fetchBitqueryData();
  }, [fetchBitqueryData]);

  const readableContract = useMemo(() => {
    if (!normalizedContract) return '—';
    return `${normalizedContract.slice(0, 6)}...${normalizedContract.slice(-6)}`;
  }, [normalizedContract]);

  const handleCopy = () => {
    if (!normalizedContract) return;
    navigator.clipboard.writeText(normalizedContract).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const tfOptions: Array<{ label: string; value: typeof timeframe }> = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1D', value: '1D' }
  ];

  return (
    <div className="min-h-screen bg-[#04050b] text-white">
      <header className="border-b border-white/10 bg-[#050613]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-lg">
              dx
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">DEXTools mirror</p>
              <p className="text-base font-semibold">Solana pairs dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span className="hidden md:inline">Powered by Bitquery + Viainti charts</span>
            <a
              href="https://www.viainti.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/40"
              rel="noreferrer"
              target="_blank"
            >
              <BsLink45Deg /> viainti.com
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <section className="mb-8 rounded-3xl border border-white/10 bg-[#070a18] p-6 shadow-[0_35px_90px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold uppercase">
                {pairMeta.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-white/60">Solana SPL</p>
                <h1 className="text-3xl font-semibold">
                  {pairMeta.symbol} / {pairMeta.quoteSymbol}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                    {pairMeta.market}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs hover:border-white/40"
                  >
                    <BsCopy /> {copied ? 'Copiado' : readableContract}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-6 text-right sm:grid-cols-2 lg:text-right">
              <div>
                <p className="text-sm text-white/60">Precio</p>
                <p className="text-4xl font-bold">${pairMeta.price.toFixed(6)}</p>
                <p className={`text-sm font-semibold ${pairMeta.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pairMeta.change >= 0 ? '+' : ''}{pairMeta.change.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Liquidez estimada</p>
                <p className="text-2xl font-semibold">${formatCompactNumber(pairMeta.liquidity)}</p>
                <p className="text-xs text-white/50">FDV ~ ${formatCompactNumber(pairMeta.fdv)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-[#070a18] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {tfOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTimeframe(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${timeframe === option.value ? 'bg-white text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchBitqueryData}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/50"
              >
                <BsArrowRepeat /> Refresh
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20">
              {error && (
                <div className="p-4 text-sm text-red-300">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="flex h-[640px] items-center justify-center text-white/60">
                  Cargando velas desde Bitquery…
                </div>
              ) : (
                <div className="h-[640px]">
                  <TradingViewChart data={data} symbol={`${pairMeta.symbol}/${pairMeta.quoteSymbol}`} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#070a18] p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.4em] text-white/50">24h overview</p>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Volumen USD</span>
                  <span className="font-semibold">${formatCompactNumber(stats.volume24h)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Transacciones</span>
                  <span className="font-semibold">{stats.tx24h}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Compradores</span>
                  <span className="font-semibold text-emerald-300">{stats.buyers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Vendedores</span>
                  <span className="font-semibold text-red-300">{stats.sellers}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070a18] p-6">
              <p className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/50">
                <BsLightningCharge /> Velocidad de la pool
              </p>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Dex favorito</span>
                  <span className="font-semibold">{pairMeta.market}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Actualización Bitquery</span>
                  <span className="font-semibold">{loading ? 'Sincronizando' : 'Live'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Clave API</span>
                  <span className={`font-semibold ${BITQUERY_KEY ? 'text-emerald-300' : 'text-red-300'}`}>
                    {BITQUERY_KEY ? 'Conectada' : 'Falta VITE_BITQUERY_KEY'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070a18] p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/50">Notas</p>
              <ul className="space-y-3 text-sm text-white/70">
                <li>• Contratos Solana se leen directamente desde Bitquery GraphQL.</li>
                <li>• Conecta otra wallet o busca contratos copiando los mint address en la URL.</li>
                <li>• Cambia el timeframe para recalcular las velas en el navegador.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

function buildCandles(trades: any[], resolutionMinutes: number, contract: string): OHLCData[] {
  const bucketMs = resolutionMinutes * 60 * 1000;
  const sorted = [...trades].sort((a, b) => {
    const tsA = (a?.block?.timestamp?.unixtime ?? 0) * 1000;
    const tsB = (b?.block?.timestamp?.unixtime ?? 0) * 1000;
    return tsA - tsB;
  });

  const buckets = new Map<number, OHLCData>();
  sorted.forEach(trade => {
    const timestamp = (trade?.block?.timestamp?.unixtime ?? 0) * 1000;
    const bucket = Math.floor(timestamp / bucketMs) * bucketMs;
    const baseAddress = (trade?.baseCurrency?.address ?? '').toLowerCase();
    const quoteAddress = (trade?.quoteCurrency?.address ?? '').toLowerCase();
    const price = normalizePrice(trade?.quotePrice ?? 0, baseAddress === contract, quoteAddress === contract);
    if (!price || Number.isNaN(price)) {
      return;
    }
    const volume = baseAddress === contract ? Number(trade?.baseAmount ?? 0) : Number(trade?.quoteAmount ?? 0);
    const candle = buckets.get(bucket);
    if (!candle) {
      buckets.set(bucket, {
        timestamp: bucket,
        open: price,
        close: price,
        high: price,
        low: price,
        volume: volume
      });
    } else {
      candle.high = Math.max(candle.high ?? price, price);
      candle.low = Math.min(candle.low ?? price, price);
      candle.close = price;
      candle.volume = (candle.volume ?? 0) + volume;
    }
  });

  return Array.from(buckets.values()).sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
}

function normalizePrice(price: number, baseIsToken: boolean, quoteIsToken: boolean) {
  if (baseIsToken) {
    return price;
  }
  if (quoteIsToken && price !== 0) {
    return 1 / price;
  }
  return price;
}

function normalizeMeta(trade: any, contract: string, price: number, change: number, liquidity: number): PairMeta {
  const baseAddress = (trade?.baseCurrency?.address ?? '').toLowerCase();
  const baseIsToken = baseAddress === contract;
  const symbol = baseIsToken ? (trade?.baseCurrency?.symbol ?? 'TOKEN') : (trade?.quoteCurrency?.symbol ?? 'TOKEN');
  const quoteSymbol = baseIsToken ? (trade?.quoteCurrency?.symbol ?? 'USDC') : (trade?.baseCurrency?.symbol ?? 'USDC');
  return {
    symbol,
    quoteSymbol,
    market: trade?.market?.name ?? 'Unknown DEX',
    price,
    change,
    liquidity,
    fdv: price * 1_000_000_000 // suposición simple para ilustrar el clon
  };
}

function buildStats(trades: any[], contract: string): StatsSnapshot {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const buyers = new Set<string>();
  const sellers = new Set<string>();
  let volumeUsd = 0;
  let tx24h = 0;

  trades.forEach(trade => {
    const timestamp = (trade?.block?.timestamp?.unixtime ?? 0) * 1000;
    if (timestamp < dayAgo) return;
    tx24h += 1;
    volumeUsd += Number(trade?.tradeAmount ?? 0);
    const baseAddress = (trade?.baseCurrency?.address ?? '').toLowerCase();
    const signer = trade?.transaction?.signer ?? '';
    if (baseAddress === contract) {
      buyers.add(signer);
    } else {
      sellers.add(signer);
    }
  });

  return {
    volume24h: volumeUsd,
    tx24h,
    buyers: buyers.size,
    sellers: sellers.size
  };
}

export default DexToolsPage;
