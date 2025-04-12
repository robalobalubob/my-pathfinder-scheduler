import "./globals.css";
import Header from "../components/Header";
import ClientProvider from "../components/ClientProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ToastProvider } from "../components/ui/ToastProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProvider>
          <ThemeProvider>
            <ToastProvider />
            <Header />
            <ErrorBoundary fallback={<div className="p-4 text-red-500">Something went wrong. Please try refreshing the page.</div>}>
              {children}
            </ErrorBoundary>
            <SpeedInsights />
          </ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  );
}