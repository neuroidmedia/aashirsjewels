import React, { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, CalendarDays, RefreshCcw } from "lucide-react";
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
  ReferenceLine,
} from "recharts";

// Simple Card replacement
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// Simple Button replacement
const Button = ({ children, variant = "default", className = "", ...props }) => {
  const base = "px-4 py-2 text-sm font-medium rounded-2xl focus:outline-none";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Simple Tabs replacement
const Tabs = ({ value, onValueChange, children }) => {
  return <div>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}</div>;
};
const TabsList = ({ children, className = "", value, onValueChange }) => (
  <div className={`flex gap-2 ${className}`}>
    {React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}
  </div>
);
const TabsTrigger = ({ value: tabValue, children, value, onValueChange }) => {
  const active = value === tabValue;
  return (
    <button
      onClick={() => onValueChange(tabValue)}
      className={`flex-1 rounded-2xl px-3 py-2 text-sm font-medium border ${
        active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
};
const TabsContent = ({ value, children, value: current }) => {
  if (value !== current) return null;
  return <div className="mt-4">{children}</div>;
};

// --- Helper components ---
const KPI = ({ label, value, sublabel }) => (
  <div className="space-y-1">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold tracking-tight">{value}</div>
    {sublabel && (
      <div className="text-xs text-gray-400">{sublabel}</div>
    )}
  </div>
);

const Delta = ({ current, previous, format = (v) => v.toLocaleString(), invert = false }) => {
  const delta = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const isUp = invert ? delta < 0 : delta > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const cls = isUp ? "text-emerald-600" : "text-rose-600";
  const sign = delta > 0 ? "+" : "";
  return (
    <div className={`inline-flex items-center gap-1 text-xs ${cls}`}>
      <Icon className="w-3 h-3" /> {sign}
      {delta.toFixed(2)}%
      <span className="text-gray-400"> vs prev</span>
    </div>
  );
};

// --- Data (from the uploaded MIS PDF) ---
const totals = {
  periodLabel: "01 Sep 2025 – 24 Sep 2025",
  compareLabel: "vs 01 Jul 2025 – 31 Jul 2025",
  overall: {
    spend: 716665.91,
    revenue: 1739943.80,
    roas: 2.43,
    orders: 1671,
    cac: 428.88,
    prev: { spend: 589513.76, revenue: 1533573.19, roas: 2.60, orders: 1495, cac: 394.32 },
  },
  google: {
    spend: 156699.97,
    revenue: 472508.54,
    roas: 3.02,
    orders: 372,
    cac: 421.24,
    prev: { spend: 135882.03, revenue: 391546.70, roas: 2.88, orders: 329.91, cac: 411.88 },
  },
  meta: {
    spend: 559965.94,
    revenue: 1375443.82,
    roas: 2.46,
    orders: 1352,
    cac: 414.18,
    prev: { spend: 453631.73, revenue: 1247171.37, roas: 2.75, orders: 1220, cac: 371.83 },
  },
};

// Daily overall metrics (Spend, Revenue, ROAS)
const daily = [
  { date: "01 Sep", spend: 24866.78, revenue: 45500.91, roas: 1.83 },
  { date: "02 Sep", spend: 26914.37, revenue: 49374.89, roas: 1.83 },
  { date: "03 Sep", spend: 24712.34, revenue: 56352.62, roas: 2.28 },
  { date: "04 Sep", spend: 25587.03, revenue: 58113.76, roas: 2.27 },
  { date: "05 Sep", spend: 23698.09, revenue: 70936.85, roas: 2.99 },
  { date: "06 Sep", spend: 24265.40, revenue: 56981.62, roas: 2.35 },
  { date: "07 Sep", spend: 27644.31, revenue: 62755.61, roas: 2.27 },
  { date: "08 Sep", spend: 28469.20, revenue: 53964.78, roas: 1.90 },
  { date: "09 Sep", spend: 27848.18, revenue: 75152.58, roas: 2.70 },
  { date: "10 Sep", spend: 26481.59, revenue: 56311.89, roas: 2.13 },
  { date: "11 Sep", spend: 24894.39, revenue: 71585.92, roas: 2.88 },
  { date: "12 Sep", spend: 40887.08, revenue: 113877.20, roas: 2.79 },
  { date: "13 Sep", spend: 24783.94, revenue: 66414.94, roas: 2.68 },
  { date: "14 Sep", spend: 36737.80, revenue: 86295.25, roas: 2.35 },
  { date: "15 Sep", spend: 34215.24, revenue: 75762.25, roas: 2.21 },
  { date: "16 Sep", spend: 35440.92, revenue: 73840.60, roas: 2.08 },
  { date: "17 Sep", spend: 30396.20, revenue: 69430.43, roas: 2.28 },
  { date: "18 Sep", spend: 27236.44, revenue: 71125.47, roas: 2.61 },
  { date: "19 Sep", spend: 30845.60, revenue: 84225.54, roas: 2.73 },
  { date: "20 Sep", spend: 34402.62, revenue: 109933.61, roas: 3.20 },
  { date: "21 Sep", spend: 42582.12, revenue: 112016.26, roas: 2.63 },
  { date: "22 Sep", spend: 31491.32, revenue: 71733.84, roas: 2.28 },
  { date: "23 Sep", spend: 31692.66, revenue: 80364.89, roas: 2.54 },
  { date: "24 Sep", spend: 30572.28, revenue: 67892.09, roas: 2.22 },
];

function currencyINR(n) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

function Section({ title, children, right }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export default function Component() {
  const [tab, setTab] = useState("overall");

  const stats = useMemo(() => {
    const t = totals[tab];
    return [
      {
        label: "Ad Spend",
        value: currencyINR(t.spend),
        delta: <Delta current={t.spend} previous={t.prev.spend} />,
      },
      {
        label: "Revenue",
        value: currencyINR(t.revenue),
        delta: <Delta current={t.revenue} previous={t.prev.revenue} />,
      },
      {
        label: "ROAS",
        value: t.roas.toFixed(2),
        delta: <Delta current={t.roas} previous={t.prev.roas} invert format={(v)=>v.toFixed(2)} />,
      },
      {
        label: "Orders",
        value: Number(t.orders).toLocaleString(),
        delta: <Delta current={t.orders} previous={t.prev.orders} />,
      },
      {
        label: "CAC",
        value: currencyINR(t.cac),
        delta: <Delta current={t.cac} previous={t.prev.cac} invert />,
      },
    ];
  }, [tab]);

  const bestDay = useMemo(() => daily.reduce((a,b)=> (b.revenue > a.revenue ? b : a), daily[0]), []);
  const worstROAS = useMemo(() => daily.reduce((a,b)=> (b.roas < a.roas ? b : a), daily[0]), []);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Performance Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4" />
            <span>{totals.periodLabel}</span>
            <span>•</span>
            <span className="text-gray-400">{totals.compareLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">Export CSV</Button>
          <Button variant="default">
            <RefreshCcw className="mr-2 w-4 h-4" />Refresh
          </Button>
        </div>
      </div>

      {/* Channel Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 rounded-2xl">
          <TabsTrigger value="overall" value={tab} onValueChange={setTab}>Overall</TabsTrigger>
          <TabsTrigger value="google" value={tab} onValueChange={setTab}>Google</TabsTrigger>
          <TabsTrigger value="meta" value={tab} onValueChange={setTab}>Meta</TabsTrigger>
        </TabsList>

        {/* KPIs */}
        <TabsContent value={tab} value={tab}>
          <Card>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col justify-between rounded-xl border p-4">
                    <KPI label={s.label} value={s.value} />
                    <div className="pt-3">{s.delta}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trends */}
      <Section
        title="Daily Trends"
        right={<div className="text-sm text-gray-500">Best day by revenue: <span className="font-medium">{bestDay.date}</span> ({currencyINR(bestDay.revenue)}), Lowest ROAS: <span className="font-medium">{worstROAS.date}</span> ({worstROAS.roas.toFixed(2)})</div>}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <div className="mb-3 text-sm text-gray-500">Spend vs Revenue</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily} margin={{ left: 4, right: 16, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickMargin={8} />
                    <YAxis yAxisId="left" tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v, name) => [currencyINR(Number(v)), name]} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="spend" name="Ad Spend" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-3 text-sm text-gray-500">ROAS (Daily)</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={{ left: 4, right: 16, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickMargin={8} />
                    <YAxis tickFormatter={(v)=>v.toFixed(1)} domain={[0, "dataMax+0.5"]} />
                    <Tooltip formatter={(v) => [Number(v).toFixed(2), "ROAS"]} />
                    <Legend />
                    <Bar dataKey="roas" name="ROAS" />
                    <ReferenceLine y={2.5} strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Table */}
      <Section title="Daily Breakdown">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Ad Spend</th>
                    <th className="px-4 py-3 text-left font-medium">Revenue</th>
                    <th className="px-4 py-3 text-left font-medium">RO
