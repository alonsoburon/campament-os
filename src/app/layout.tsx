import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import "~/styles/globals.css";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppShellWrapper } from "./components/AppShellWrapper";

export const metadata: Metadata = {
  title: "campamentOS",
  description: "Plataforma integral para campamentos, expediciones y aventuras épicas.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="bg-background font-sans text-foreground antialiased">
        <SessionProvider>
          <ThemeProvider>
            <TRPCReactProvider>
              <AppShellWrapper>{children}</AppShellWrapper>
            </TRPCReactProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
