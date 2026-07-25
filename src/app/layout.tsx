import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Royal Prince Resort Pattaya — LINE AI Assistant",
  description: "AI Reservation & Sales Assistant admin console",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
