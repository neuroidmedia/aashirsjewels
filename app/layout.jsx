// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "D2C Performance Dashboard (By Neuroid)",
  description: "Interactive D2C performance analytics dashboard by Neuroid.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
