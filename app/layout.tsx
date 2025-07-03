import { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import ClientProvider from "../components/ClientProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: "Pathfinder Session Scheduler",
    template: "%s | Pathfinder Scheduler",
  },
  description: "A full-featured web application for scheduling and managing Pathfinder gaming sessions.",
  applicationName: "Pathfinder Scheduler",
  referrer: "origin-when-cross-origin",
  keywords: ["Pathfinder", "RPG", "tabletop", "scheduling", "gaming", "session management"],
  authors: [{ name: "Pathfinder Scheduler Team" }],
  creator: "Pathfinder Scheduler",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProvider>
          <Header />
          {children}
          <SpeedInsights />
        </ClientProvider>
      </body>
    </html>
  );
}