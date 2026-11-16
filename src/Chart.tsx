import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import type { Candle } from "./types";
import { ema, rsi } from "./market";

const UP = "#22c55e";
const DOWN = "#ef4444";

export default function Chart({ candles }: { candles: Candle[] }) {
  const mainRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const s = useRef<{
    main?: IChartApi; rsi?: IChartApi;
    candle?: ISeriesApi<"Candlestick">;
    ema?: ISeriesApi<"Line">;
    rsi?: ISeriesApi<"Line">;
  }>({});

  useEffect(() => {
    const opts = {
      autoSize: true,
      layout: { background: { color: "#0b0f17" }, textColor: "#94a3b8" },
      grid: { vertLines: { color: "#161b26" }, horzLines: { color: "#161b26" } },
      timeScale: { timeVisible: true },
    };
    const main = createChart(mainRef.current!, opts);
    const r = createChart(rsiRef.current!, opts);
    s.current = {
      main, rsi: r,
      candle: main.addCandlestickSeries({
        upColor: UP, downColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, borderVisible: false,
      }),
      ema: main.addLineSeries({ color: "#3b82f6", lineWidth: 2, priceLineVisible: false }),
    };
    s.current.rsi = undefined;
    const rsiSeries = r.addLineSeries({ color: "#a78bfa", lineWidth: 2 });
    rsiSeries.createPriceLine({ price: 70, color: "#475569", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
    rsiSeries.createPriceLine({ price: 30, color: "#475569", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
    s.current.rsi = rsiSeries;

    main.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) r.timeScale().setVisibleLogicalRange(range);
    });
    return () => { main.remove(); r.remove(); };
  }, []);

  useEffect(() => {
    const t = (x: number) => x as UTCTimestamp;
    s.current.candle?.setData(candles.map((c) => ({ ...c, time: t(c.time) })));
    s.current.ema?.setData(ema(candles, 200).map((p) => ({ ...p, time: t(p.time) })));
    s.current.rsi?.setData(rsi(candles).map((p) => ({ ...p, time: t(p.time) })));
  }, [candles]);

  return (
    <>
      <div ref={mainRef} className="chart-main" />
      <div ref={rsiRef} className="chart-rsi" />
    </>
  );
}
