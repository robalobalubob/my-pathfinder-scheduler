import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors duration-200"
          >
            Go Back Home
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/availability"
              className="hover:text-primary transition-colors"
            >
              Manage Availability
            </Link>
            {" • "}
            <Link
              href="/gm/schedule"
              className="hover:text-primary transition-colors"
            >
              Schedule Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}