"use client";
import "./globals.css";
import MISDashboard from "../components/MISDashboard";
import useLastUpdated from "./utils/useLastUpdated";
import useDataPeriod from "./utils/useDataPeriod";

function LastUpdatedBadge() {
  const last = useLastUpdated();
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border bg-white/70 dark:bg-gray-900/60">
      Last updated: {last ?? "–"}
    </span>
  );
}

function DataPeriodBadge() {
  const period = useDataPeriod();
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border bg-white/70 dark:bg-gray-900/60">
      {period?.pretty ? `Period: ${period.pretty}` : "Period: –"}
    </span>
  );
}

export default function Page() {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">MIS Dashboard</h1>
          <LastUpdatedBadge />
          <DataPeriodBadge />
        </div>
        <MISDashboard />
      </div>
    </div>
  );
}
