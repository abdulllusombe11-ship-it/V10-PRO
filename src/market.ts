import type { Candle } from "./types";

export const INSTRUMENTS = ["XAUUSD", "EURUSD", "AUDUSD", "BTCUSD"];
export const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

export function ema(candles: Candle[], period: number) {
  const k = 2 / (period + 1);
  const out: { time: number; value: number }[] = [];
  let prev = 0;
  candles.forEach((c, i) => {
    if (i < period - 1) return;
    if (i === period - 1) {
      prev = candles.slice(0, period).reduce((s, x) => s + x.close, 0) / period;
    } else {
      prev = c.close * k + prev * (1 - k);
    }
    out.push({ time: c.time, value: prev });
  });
  return out;
}

export function rsi(candles: Candle[], period = 14) {
  const out: { time: number; value: number }[] = [];
  let gain = 0, loss = 0;
  for (let i = 1; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close;
    const g = Math.max(d, 0), l = Math.max(-d, 0);
    if (i <= period) {
      gain += g; loss += l;
      if (i < period) continue;
      gain /= period; loss /= period;
    } else {
      gain = (gain * (period - 1) + g) / period;
      loss = (loss * (period - 1) + l) / period;
    }
    out.push({ time: candles[i].time, value: loss === 0 ? 100 : 100 - 100 / (1 + gain / loss) });
  }
  return out;
}
