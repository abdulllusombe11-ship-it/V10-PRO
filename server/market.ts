const BASE = "https://api.twelvedata.com";

export const SYMBOLS: Record<string, string> = {
  XAUUSD: "XAU/USD",
  EURUSD: "EUR/USD",
  AUDUSD: "AUD/USD",
  BTCUSD: "BTC/USD",
};

export const INTERVALS: Record<string, string> = {
  M1: "1min", M5: "5min", M15: "15min", M30: "30min",
  H1: "1h", H4: "4h", D1: "1day", W1: "1week",
};

export async function getCandles(symbol: string, tf: string, size: number) {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) throw new Error("TWELVE_DATA_API_KEY is not set on the server");
  const sym = SYMBOLS[symbol];
  const interval = INTERVALS[tf];
  if (!sym || !interval) throw new Error("Unsupported symbol or timeframe");

  const url =
    `${BASE}/time_series?symbol=${encodeURIComponent(sym)}` +
    `&interval=${interval}&outputsize=${size}&timezone=UTC&apikey=${key}`;
  const res = await fetch(url);
  const data: any = await res.json();
  if (data.status === "error" || !Array.isArray(data.values)) {
    throw new Error(data.message || "Provider returned no data");
  }

  const candles = data.values
    .map((v: any) => {
      const s = v.datetime.length === 10 ? `${v.datetime}T00:00:00Z` : `${v.datetime.replace(" ", "T")}Z`;
      return {
        time: Math.floor(new Date(s).getTime() / 1000),
        open: +v.open, high: +v.high, low: +v.low, close: +v.close,
      };
    })
    .reverse();

  return { candles, source: "Twelve Data", note: "REST polling every 60s; free plans can be delayed" };
}
