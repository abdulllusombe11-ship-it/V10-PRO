import { useEffect, useState } from "react";
import Chart from "./Chart";
import { fetchCandles } from "./api";
import { INSTRUMENTS, TIMEFRAMES } from "./market";
import type { Candle } from "./types";

const TABS = ["DASHBOARD", "SESSION", "NEWS", "SETTINGS", "PROFILE"];

export default function App() {
  const [tab, setTab] = useState("DASHBOARD");
  const [symbol, setSymbol] = useState("XAUUSD");
  const [tf, setTf] = useState("M15");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [info, setInfo] = useState({ source: "", note: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetchCandles(symbol, tf, 300)
      .then((r) => { if (alive) { setCandles(r.candles); setInfo(r); } })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));

    const id = setInterval(() => {
      fetchCandles(symbol, tf, 3)
        .then((r) => {
          if (!alive) return;
          setCandles((prev) => {
            const map = new Map(prev.map((c) => [c.time, c]));
            r.candles.forEach((c) => map.set(c.time, c));
            return [...map.values()].sort((a, b) => a.time - b.time);
          });
          setError("");
        })
        .catch((e) => alive && setError(`Reconnecting... ${e.message}`));
    }, 60000);

    return () => { alive = false; clearInterval(id); };
  }, [symbol, tf]);

  const last = candles[candles.length - 1];

  return (
    <div className="app">
      <header>
        <b>V10 PRO</b>
        {last && (
          <span className={last.close >= last.open ? "up" : "down"}>
            {symbol} {last.close}
          </span>
        )}
      </header>

      {tab === "DASHBOARD" ? (
        <main>
          <div className="row">
            {INSTRUMENTS.map((i) => (
              <button key={i} className={i === symbol ? "on" : ""} onClick={() => setSymbol(i)}>{i}</button>
            ))}
          </div>
          <div className="row">
            {TIMEFRAMES.map((t) => (
              <button key={t} className={t === tf ? "on" : ""} onClick={() => setTf(t)}>{t}</button>
            ))}
          </div>
          {loading && <p className="muted">Loading real market data...</p>}
          {error && <p className="err">{error}</p>}
          <Chart candles={candles} />
          <p className="muted">Source: {info.source || "-"} | {info.note}</p>
        </main>
      ) : (
        <main><p className="muted">{tab} - coming in a later stage.</p></main>
      )}

      <nav>
        {TABS.map((t) => (
          <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>
    </div>
  );
}
