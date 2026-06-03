
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CredentialGuard - Credential Stuffing Detector",
  description: "Advanced Real-time Credential Stuffing Detection System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-950 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
