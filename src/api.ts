import type { CandleResponse } from "./types";

export async function fetchCandles(symbol: string, tf: string, size = 300): Promise<CandleResponse> {
  const res = await fetch(`/api/candles?symbol=${symbol}&tf=${tf}&size=${size}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
