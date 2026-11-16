export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandleResponse {
  candles: Candle[];
  source: string;
  note: string;
}
