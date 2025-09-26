"use client";
import { useEffect, useState } from "react";

export default function useLastUpdated() {
  const [last, setLast] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/data.json", { cache: "no-cache" });
        const data = await res.json();
        const arr = Array.isArray(data?.daily) ? data.daily : [];
        const lastDate = arr.length ? arr[arr.length - 1]?.date : null;
        setLast(lastDate || null);
      } catch {
        setLast(null);
      }
    };
    run();
  }, []);

  return last;
}
