"use client";
import { useEffect, useState } from "react";

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "June", "July",
  "Aug", "Sept", "Oct", "Nov", "Dec"
];

function fmtPretty(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const day = ordinal(d.getDate());
  const mon = MONTHS[d.getMonth()];
  const yr = d.getFullYear();
  return { day, mon, yr, str: `${day} ${mon} ${yr}` };
}

/**
 * Reads /data.json and returns:
 * { startISO, endISO, pretty }  where pretty is "1st Sept – 26th Sept 2025"
 */
export default function useDataPeriod() {
  const [period, setPeriod] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/data.json", { cache: "no-cache" });
        const data = await res.json();
        const daily = Array.isArray(data?.daily) ? data.daily : [];
        if (!daily.length) return setPeriod(null);

        // sort by date just in case
        const dates = daily
          .map(r => r?.date)
          .filter(Boolean)
          .sort((a, b) => (a > b ? 1 : -1));

        const startISO = dates[0];
        const endISO = dates[dates.length - 1];

        const s = fmtPretty(startISO);
        const e = fmtPretty(endISO);

        let pretty = "";
        if (s && e) {
          // If same year, print once at the end
          pretty = s.yr === e.yr
            ? `${s.day} ${s.mon} – ${e.day} ${e.mon} ${e.yr}`
            : `${s.day} ${s.mon} ${s.yr} – ${e.day} ${e.mon} ${e.yr}`;
        }

        setPeriod({ startISO, endISO, pretty });
      } catch {
        setPeriod(null);
      }
    };
    run();
  }, []);

  return period; // null or { startISO, endISO, pretty }
}
