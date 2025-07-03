import { Metadata, Viewport } from "next";
import HomeClient from "../components/HomeClient";

export const metadata: Metadata = {
  title: "Pathfinder Session Scheduler",
  description: "A full-featured web application for scheduling and managing Pathfinder gaming sessions. Coordinate schedules between Game Masters and players.",
  keywords: ["Pathfinder", "RPG", "tabletop", "scheduling", "gaming", "session management"],
  authors: [{ name: "Pathfinder Scheduler Team" }],
  creator: "Pathfinder Scheduler",
  openGraph: {
    title: "Pathfinder Session Scheduler",
    description: "Schedule and manage your Pathfinder gaming sessions with ease",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Pathfinder Session Scheduler",
    description: "Schedule and manage your Pathfinder gaming sessions with ease",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function HomePage() {
  return <HomeClient />;
}