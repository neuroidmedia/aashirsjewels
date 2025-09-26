"use client";
import "./globals.css";
import MISDashboard from "../components/MISDashboard";
import Link from "next/link";
import useLastUpdated from "./utils/useLastUpdated";

function LastUpdatedBadge() {
  const last = useLastUpdated();
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border bg-white/70 dark:bg-gray-900/60">
      Last updated: {last ?? "–"}
    </span>
  );
}

export default function Page() {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">MIS Dashboard</h1>
            <LastUpdatedBadge />
          </div>
          <Link
            href="/admin"
            className="text-sm px-3 py-1.5 rounded-lg border bg-white/70 dark:bg-gray-900/60"
          >
            Admin
          </Link>
        </div>

        <MISDashboard />
      </div>
    </div>
  );
}
