export const metadata = {
  title: "MIS Performance Dashboard",
  description: "Next.js + Tailwind + Recharts",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
