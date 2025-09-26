"use client";
import React, { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import useLastUpdated from "../utils/useLastUpdated";

export default function AdminPage() {
  const [jsonData, setJsonData] = useState(null);
  const [log, setLog] = useState("");

  const download = (filename, text) => {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const parseDate = (s) => {
    if (!s) return null;
    const t = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;          // YYYY-MM-DD
    const m = t.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/); // DD/MM/YYYY or DD-MM-YYYY
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return null;
  };

  const toFloat = (x) => {
    if (x == null) return 0;
    const s = String(x).replace(/[,₹$]/g, "").trim();
    if (!s) return 0;
    return parseFloat(s);
  };

  const toInt = (x) => {
    if (x == null) return 0;
    const s = String(x).trim();
    if (!s) return 0;
    return parseInt(s, 10);
  };

  const normalizeRow = (row) => ({
    date: parseDate(row.date),
    spend: toFloat(row.spend),
    revenue: toFloat(row.revenue),
    orders: isNaN(toInt(row.orders)) ? 0 : toInt(row.orders),
  });

  const accumulate = (rows) => {
    const totals = rows.reduce(
      (a, r) => {
        a.spend += r.spend || 0;
        a.revenue += r.revenue || 0;
        a.orders += r.orders || 0;
        return a;
      },
      { spend: 0, revenue: 0, orders: 0 }
    );
    totals.roas = totals.spend ? +(totals.revenue / totals.spend).toFixed(2) : 0;
    return totals;
  };

  // Supports: LONG (with platform), OVERALL-only, and WIDE (MIS-style) CSVs
  const buildSchema = (rows) => {
    const headers = rows[0] ? Object.keys(rows[0]).map((h) => h.toLowerCase()) : [];
    const hasPlatform = headers.includes("platform");
    const isWide = [
      "total_ad_spend",
      "shopify_revenue",
      "meta_amount_spent",
      "meta_website_purchases_conversion_value",
      "meta_website_purchase_roas",
      "meta_website_purchases",
      "google_cost",
      "google_conv_value",
      "google_conv_value_per_cost",
      "google_conversions",
    ].every((h) => headers.includes(h));

    if (isWide) {
      const overall = [],
        google = [],
        meta = [];
      rows.forEach((r) => {
        const rr = Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]));
        const d = parseDate(rr.date);
        if (!d) return;
        const mSpend = toFloat(rr.meta_amount_spent);
        const mRev = toFloat(rr.meta_website_purchases_conversion_value);
        const mOrders = toInt(rr.meta_website_purchases);
        const gSpend = toFloat(rr.google_cost);
        const gRev = toFloat(rr.google_conv_value);
        const gOrders = toInt(rr.google_conversions);
        const totalSpend = toFloat(rr.total_ad_spend);
        const shopRev = toFloat(rr.shopify_revenue);
        const overallOrders = mOrders + gOrders;

        overall.push({ date: d, spend: totalSpend, revenue: shopRev, orders: overallOrders });
        meta.push({ date: d, spend: mSpend, revenue: mRev, orders: mOrders });
        google.push({ date: d, spend: gSpend, revenue: gRev, orders: gOrders });
      });
      overall.sort((a, b) => a.date.localeCompare(b.date));
      meta.sort((a, b) => a.date.localeCompare(b.date));
      google.sort((a, b) => a.date.localeCompare(b.date));
      const totOverall = accumulate(overall);
      const totGoogle = accumulate(google);
      const totMeta = accumulate(meta);
      return {
        daily: overall,
        totals: totOverall,
        channels: {
          google: { totals: totGoogle, daily: google },
          meta: { totals: totMeta, daily: meta },
        },
      };
    }

    // LONG/OVERALL
    const buckets = { overall: [], google: [], meta: [] };
    rows.forEach((r) => {
      const rr = Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]));
      const plat = hasPlatform ? (rr.platform || "overall").toLowerCase() : "overall";
      const dest = ["overall", "google", "meta"].includes(plat) ? plat : "overall";
      const norm = normalizeRow(rr);
      if (norm.date) buckets[dest].push(norm);
    });
    Object.keys(buckets).forEach((k) => buckets[k].sort((a, b) => a.date.localeCompare(b.date)));
    const totOverall = accumulate(buckets.overall);
    const totGoogle = accumulate(buckets.google);
    const totMeta = accumulate(buckets.meta);
    return {
      daily: buckets.overall,
      totals: totOverall,
      channels: {
        google: { totals: totGoogle, daily: buckets.google },
        meta: { totals: totMeta, daily: buckets.meta },
      },
    };
  };

  const handleCSV = (file) => {
    setLog("Parsing CSV...");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = buildSchema(res.data || []);
        setJsonData(data);
        setLog(`Parsed ${res.data?.length || 0} rows. Ready to download JSON.`);
      },
      error: (e) => setLog(`CSV parse error: ${e.message}`),
    });
  };

  const handleJSON = async (file) => {
    setLog("Reading JSON...");
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      setJsonData(data);
      setLog("Loaded JSON. You can re-download or push to repo.");
    } catch (e) {
      setLog("Invalid JSON: " + e.message);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Admin · Data Update</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full border bg-white/70 dark:bg-gray-900/60">
              Last updated: {useLastUpdated() ?? "–"}
            </span>
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-lg border bg-white/70 dark:bg-gray-900/60"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="rounded-xl border border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-4 space-y-2 cursor-pointer">
            <div className="text-sm font-medium">Upload CSV</div>
            <div className="text-xs text-gray-500">
              With or without <code>platform</code> column, or MIS-wide format
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCSV(e.target.files[0])}
            />
            <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">
              Expected headers: <code>date, spend, revenue, orders[, platform]</code> <br />
              <span className="opacity-80">
                or wide:{" "}
                <code>
                  date,total_ad_spend,shopify_revenue,meta_amount_spent,meta_website_purchases_conversion_value,meta_website_purchases,google_cost,google_conv_value,google_conversions
                </code>
              </span>
            </div>
          </label>

          <label className="rounded-xl border border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-4 space-y-2 cursor-pointer">
            <div className="text-sm font-medium">Upload JSON</div>
            <div className="text-xs text-gray-500">Use existing schema to preview/modify</div>
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleJSON(e.target.files[0])}
            />
          </label>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-4">
          <div className="text-sm font-medium mb-2">Status</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{log || "No file uploaded."}</div>
        </div>

        {jsonData && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => download("data.json", JSON.stringify(jsonData, null, 2))}
                className="px-3 py-1.5 text-sm rounded-lg border bg-white/70 dark:bg-gray-900/60"
              >
                Download data.json
              </button>
              <a
                href="https://github.com"
                target="_blank"
                className="px-3 py-1.5 text-sm rounded-lg border bg-white/70 dark:bg-gray-900/60"
              >
                Open GitHub (commit CSV or JSON)
              </a>
            </div>
            <pre className="text-xs overflow-auto max-h-96 p-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
{JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Tip: Commit your CSV into <code>data/</code> in your repo. The GitHub Action will auto-generate{" "}
          <code>public/data.json</code> and Vercel will redeploy.
        </div>
      </div>
    </div>
  );
}
