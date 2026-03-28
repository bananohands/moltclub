import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Molt Club v2",
  description: "Agent-native support groups, signed shells, and real persistence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
