"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Upload, TrendingUp, TrendingDown } from "lucide-react";

const fmt = new Intl.NumberFormat("en-IN");
const asCurrency = (n) => (n == null ? "–" : `₹${fmt.format(Number(n) || 0)}`);
const asNum = (n) => (n == null ? "–" : fmt.format(Number(n) || 0));
const parseDate = (d) => new Date(d);

// Small KPI card
function KPI({ label, value, hint, positive }) {
  return (
    <div className="rounded-2xl p-4 bg-white/80 dark:bg-gray-900/60 shadow-sm border border-gray-200/60 dark:border-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-xs ${
            positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {hint}
        </div>
      )}
    </div>
  );
}

export default function MISDashboard() {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("overall"); // overall | google | meta

  // --- Load /public/data.json (Vercel/Next serves this from the public folder) ---
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data.json", { cache: "no-cache" });
        if (!res.ok) throw new Error("Failed to fetch data.json");
        const data = await res.json();
        setJsonData(data);
      } catch (e) {
        // Fallback seed so the UI still renders
        console.warn("Using fallback seed. Reason:", e.message);
        const overallDaily = [
          { date: "2025-09-01", spend: 24866.78, revenue: 45500.91, orders: 48 },
          { date: "2025-09-02", spend: 26914.37, revenue: 49374.89, orders: 50 },
          { date: "2025-09-03", spend: 24712.34, revenue: 56352.62, orders: 61 },
          { date: "2025-09-04", spend: 25587.03, revenue: 58113.76, orders: 61 },
          { date: "2025-09-05", spend: 23698.09, revenue: 70936.85, orders: 70 },
          { date: "2025-09-06", spend: 24265.4, revenue: 56981.62, orders: 49 },
          { date: "2025-09-07", spend: 27644.31, revenue: 62755.61, orders: 78 },
          { date: "2025-09-08", spend: 28469.2, revenue: 53964.78, orders: 48 },
          { date: "2025-09-09", spend: 27848.18, revenue: 75152.58, orders: 75 },
          { date: "2025-09-10", spend: 26481.59, revenue: 56311.89, orders: 48 },
          { date: "2025-09-11", spend: 24894.39, revenue: 71585.92, orders: 60 },
          { date: "2025-09-12", spend: 40887.08, revenue: 113877.2, orders: 117 },
          { date: "2025-09-13", spend: 24783.94, revenue: 66414.94, orders: 71 },
          { date: "2025-09-14", spend: 36737.8, revenue: 86295.25, orders: 84 },
          { date: "2025-09-15", spend: 34215.24, revenue: 75762.25, orders: 75 },
          { date: "2025-09-16", spend: 35440.92, revenue: 73840.6, orders: 84 },
          { date: "2025-09-17", spend: 30396.2, revenue: 69430.43, orders: 79 },
          { date: "2025-09-18", spend: 27236.44, revenue: 71125.47, orders: 74 },
          { date: "2025-09-19", spend: 30845.6, revenue: 84225.54, orders: 75 },
          { date: "2025-09-20", spend: 34402.62, revenue: 109933.61, orders: 107 },
          { date: "2025-09-21", spend: 42582.12, revenue: 112016.26, orders: 98 },
          { date: "2025-09-22", spend: 31491.32, revenue: 71733.84, orders: 71 },
          { date: "2025-09-23", spend: 31692.66, revenue: 80364.89, orders: 72 },
          { date: "2025-09-24", spend: 30572.28, revenue: 67892.09, orders: 69 },
        ];
        const metaDaily = [
          { date: "2025-09-01", spend: 19093.92, revenue: 38874.04, orders: 39 },
          { date: "2025-09-02", spend: 20377.96, revenue: 36466.86, orders: 36 },
          { date: "2025-09-03", spend: 18678.41, revenue: 44968.19, orders: 47 },
          { date: "2025-09-04", spend: 18040.03, revenue: 43150.46, orders: 46 },
          { date: "2025-09-05", spend: 19692.0, revenue: 52212.44, orders: 54 },
          { date: "2025-09-06", spend: 17554.51, revenue: 33781.0, orders: 34 },
          { date: "2025-09-07", spend: 21533.7, revenue: 58759.49, orders: 64 },
          { date: "2025-09-08", spend: 19822.3, revenue: 34252.4, orders: 34 },
          { date: "2025-09-09", spend: 19952.17, revenue: 49901.5, orders: 56 },
          { date: "2025-09-10", spend: 20369.32, revenue: 51637.8, orders: 41 },
          { date: "2025-09-11", spend: 20259.55, revenue: 54414.31, orders: 46 },
          { date: "2025-09-12", spend: 33685.81, revenue: 91962.96, orders: 93 },
          { date: "2025-09-13", spend: 19054.58, revenue: 48690.27, orders: 50 },
          { date: "2025-09-14", spend: 29902.41, revenue: 65984.88, orders: 72 },
          { date: "2025-09-15", spend: 27781.87, revenue: 62461.87, orders: 59 },
          { date: "2025-09-16", spend: 29833.06, revenue: 63436.29, orders: 70 },
          { date: "2025-09-17", spend: 23572.74, revenue: 62495.23, orders: 62 },
          { date: "2025-09-18", spend: 21074.18, revenue: 63252.6, orders: 59 },
          { date: "2025-09-19", spend: 23481.19, revenue: 54431.33, orders: 56 },
          { date: "2025-09-20", spend: 25479.36, revenue: 96244.83, orders: 87 },
          { date: "2025-09-21", spend: 34637.25, revenue: 80570.68, orders: 76 },
          { date: "2025-09-22", spend: 25904.35, revenue: 66633.82, orders: 61 },
          { date: "2025-09-23", spend: 25162.17, revenue: 68312.77, orders: 59 },
          { date: "2025-09-24", spend: 25023.1, revenue: 52547.8, orders: 51 },
        ];
        const googleDaily = [
          { date: "2025-09-01", spend: 5772.86, revenue: 16580.13, orders: 9 },
          { date: "2025-09-02", spend: 6536.41, revenue: 17669.78, orders: 14 },
          { date: "2025-09-03", spend: 6033.93, revenue: 17773.23, orders: 14 },
          { date: "2025-09-04", spend: 7547.0, revenue: 21895.36, orders: 15 },
          { date: "2025-09-05", spend: 4006.09, revenue: 18603.41, orders: 16 },
          { date: "2025-09-06", spend: 6710.89, revenue: 21547.71, orders: 15 },
          { date: "2025-09-07", spend: 6110.61, revenue: 13143.5, orders: 14 },
          { date: "2025-09-08", spend: 8646.9, revenue: 17783.72, orders: 14 },
          { date: "2025-09-09", spend: 7896.01, revenue: 24664.56, orders: 19 },
          { date: "2025-09-10", spend: 6112.27, revenue: 5444.5, orders: 7 },
          { date: "2025-09-11", spend: 4634.84, revenue: 17310.1, orders: 14 },
          { date: "2025-09-12", spend: 7201.27, revenue: 31366.01, orders: 24 },
          { date: "2025-09-13", spend: 5729.36, revenue: 24358.94, orders: 21 },
          { date: "2025-09-14", spend: 6835.39, revenue: 16784.88, orders: 12 },
          { date: "2025-09-15", spend: 6433.37, revenue: 20104.63, orders: 16 },
          { date: "2025-09-16", spend: 5607.86, revenue: 13629.34, orders: 14 },
          { date: "2025-09-17", spend: 6823.46, revenue: 23302.06, orders: 17 },
          { date: "2025-09-18", spend: 6162.26, revenue: 19869.56, orders: 15 },
          { date: "2025-09-19", spend: 7364.41, revenue: 20866.34, orders: 19 },
          { date: "2025-09-20", spend: 8923.26, revenue: 32536.87, orders: 20 },
          { date: "2025-09-21", spend: 7944.87, revenue: 30839.27, orders: 22 },
          { date: "2025-09-22", spend: 5586.97, revenue: 11587.9, orders: 10 },
          { date: "2025-09-23", spend: 6530.49, revenue: 15922.31, orders: 13 },
          { date: "2025-09-24", spend: 5549.18, revenue: 18924.44, orders: 18 },
        ];
        setJsonData({
          daily: overallDaily,
          totals: { spend: 716665.91, revenue: 1739943.8, roas: 2.43, orders: 1671, cac: 428.88 },
          channels: {
            google: {
              totals: { spend: 156699.97, revenue: 472508.54, roas: 3.02, orders: 372, cac: 421.24 },
              daily: googleDaily,
            },
            meta: {
              totals: { spend: 559965.94, revenue: 1375443.82, roas: 2.46, orders: 1352, cac: 414.18 },
              daily: metaDaily,
            },
          },
        });
        setError(
          "Note: using fallback seed because /public/data.json could not be fetched. Deploy will read the real file."
        );
      }
    };
    load();
  }, []);

  // Prepare arrays for current view
  const overallSorted = useMemo(() => {
    const rows = jsonData?.daily || [];
    return [...rows].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [jsonData]);

  const channels = jsonData?.channels || {};
  const channelDaily =
    view === "overall" ? overallSorted : (channels?.[view]?.daily || []).slice().sort((a, b) => (a.date > b.date ? 1 : -1));

  const arr = view === "overall" ? overallSorted : channelDaily;

  // Totals (prefer injected totals if present)
  const computedTotals = useMemo(() => {
    return arr.reduce(
      (acc, r) => {
        acc.spend += Number(r.spend) || 0;
        acc.revenue += Number(r.revenue) || 0;
        acc.orders += Number(r.orders) || 0;
        return acc;
      },
      { spend: 0, revenue: 0, orders: 0 }
    );
  }, [arr]);

  const injectedTotals = view === "overall" ? jsonData?.totals : channels?.[view]?.totals;
  const displayTotals = { ...computedTotals, ...(injectedTotals || {}) };

  // Day deltas
  const last = arr[arr.length - 1] || {};
  const prev = arr[arr.length - 2] || {};
  const deltaRev = (Number(last.revenue) || 0) - (Number(prev.revenue) || 0);
  const deltaSpend = (Number(last.spend) || 0) - (Number(prev.spend) || 0);
  const roas = displayTotals.spend ? displayTotals.revenue / displayTotals.spend : 0;

  // Upload JSON (optional override)
  const onUpload = async (file) => {
    setError("");
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setJsonData(json);
      setView("overall");
    } catch (e) {
      console.error(e);
      setError("Could not parse JSON. Make sure it's valid JSON.");
    }
  };

  const Btn = ({ id, children }) => (
    <button
      onClick={() => setView(id)}
      className={`px-3 py-1.5 text-sm rounded-lg border transition ${
        view === id
          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white"
          : "bg-white/70 dark:bg-gray-900/60 border-gray-300 dark:border-gray-800 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Switch tabs to see Overall vs Google vs Meta. Upload a JSON to override.
          </p>
          <div className="mt-3 inline-flex items-center gap-2">
            <Btn id="overall">Overall</Btn>
            <Btn id="google">Google</Btn>
            <Btn id="meta">Meta</Btn>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 px-4 py-2 text-sm shadow-sm hover:bg-white">
          <Upload size={16} /> Upload JSON
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI
          label="Total Spend"
          value={asCurrency(displayTotals.spend)}
          hint={`${deltaSpend >= 0 ? "+" : ""}${asCurrency(deltaSpend)} vs prev day`}
          positive={deltaSpend >= 0}
        />
        <KPI
          label="Total Revenue"
          value={asCurrency(displayTotals.revenue)}
          hint={`${deltaRev >= 0 ? "+" : ""}${asCurrency(deltaRev)} vs prev day`}
          positive={deltaRev >= 0}
        />
        <KPI label="ROAS" value={displayTotals.spend ? roas.toFixed(2) : "–"} />
        <KPI label="CAC" value={displayTotals.cac != null ? asCurrency(displayTotals.cac) : "–"} />
        <KPI label="Orders" value={asNum(displayTotals.orders)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm font-medium mb-3">Revenue &amp; Spend over Time ({view})</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={arr} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm font-medium mb-3">Orders by Day ({view})</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arr} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-sm font-medium">
          Daily Breakdown ({view})
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60">
              <tr className="text-left">
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Ad Spend</th>
                <th className="px-4 py-3 text-left font-medium">Revenue</th>
                <th className="px-4 py-3 text-left font-medium">ROAS</th>
                <th className="px-4 py-3 text-left font-medium">Orders</th>
              </tr>
            </thead>
            <tbody>
              {arr.map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-gray-50/30 dark:bg-gray-900/30" : ""}>
                  <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2">{asCurrency(r.spend)}</td>
                  <td className="px-4 py-2">{asCurrency(r.revenue)}</td>
                  <td className="px-4 py-2">
                    {r?.spend ? (Number(r.revenue || 0) / Number(r.spend || 1)).toFixed(2) : "–"}
                  </td>
                  <td className="px-4 py-2">{asNum(r.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Tip: Your JSON can include <code>channels.google.daily</code> and <code>channels.meta.daily</code> with
        <code> spend</code>, <code>revenue</code>, <code>orders</code>. Totals are used if provided, otherwise computed.
      </div>
    </div>
  );
}
