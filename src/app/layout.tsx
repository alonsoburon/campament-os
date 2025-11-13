import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import "~/styles/globals.css";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "./providers/ThemeProvider";

export const metadata: Metadata = {
  title: "campamentOS",
  description: "Orquesta campamentos, personas, logística y presupuesto desde un solo lugar.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased">
        <SessionProvider>
          <ThemeProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
