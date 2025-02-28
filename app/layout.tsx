import "../app/globals.css";
import Header from "../components/Header";
import ClientProvider from "../components/ClientProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>
          <Header />
          {children}
        </ClientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}