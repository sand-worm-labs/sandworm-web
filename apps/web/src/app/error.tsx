"use client";

import { EmptyState } from "@/components/EmptyState";

interface ErrorStateProps {
  error: Error & { digest?: string; statusCode?: number; code?: string };
  reset: () => void;
}

const getErrorType = (
  error: Error & { statusCode?: number; code?: string }
) => {
  // Check status code first
  if (error.statusCode) {
    if (error.statusCode >= 500) return "server";
    if (error.statusCode === 404) return "notfound";
    if (error.statusCode === 403 || error.statusCode === 401) return "auth";
  }

  // Check error name/code
  if (error.name === "ServerError" || error.code === "ECONNREFUSED")
    return "server";
  if (error.name === "NetworkError" || error.code === "NETWORK_ERROR")
    return "network";
  if (error.name === "DatabaseError" || error.code?.includes("POSTGRES"))
    return "database";

  // Check message content
  const msg = error.message.toLowerCase();
  if (
    msg.includes("server") ||
    msg.includes("500") ||
    msg.includes("service unavailable")
  )
    return "server";
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("connection")
  )
    return "network";
  if (msg.includes("database") || msg.includes("query")) return "database";
  if (msg.includes("unauthorized") || msg.includes("forbidden")) return "auth";

  return "client";
};

const ErrorPage: React.FC<ErrorStateProps> = ({ error, reset }) => {
  const errorType = getErrorType(error);
  const isDev = process.env.NODE_ENV === "development";

  const errorConfigs = {
    server: {
      title: "Server is Down",
      subtitle: isDev
        ? `Dev: ${error.message}`
        : "We're experiencing technical difficulties. Our team has been notified.",
      imageSrc: "/img/server-error.png",
      showRefresh: true,
      showTwitterUpdates: true,
      showReportBug: false,
      showGoBack: false,
      quickLinks: [
        { label: "Status Page", href: "/status" },
        { label: "Twitter Updates", href: "https://twitter.com/your_handle" },
      ],
    },
    network: {
      title: "Connection Error",
      subtitle: isDev
        ? `Dev: ${error.message}`
        : "Unable to reach our servers. Check your internet connection.",
      imageSrc: "/img/network-error.png",
      showRefresh: true,
      showGoBack: true,
      showTwitterUpdates: false,
      showReportBug: false,
      quickLinks: [],
    },
    database: {
      title: "Database Error",
      subtitle: isDev
        ? `Dev: ${error.message}`
        : "We're having trouble accessing data. Please try again in a moment.",
      imageSrc: "/img/database-error.png",
      showRefresh: true,
      showReportBug: true,
      showGoBack: true,
      showTwitterUpdates: false,
      quickLinks: [],
    },
    auth: {
      title: "Access Denied",
      subtitle: isDev
        ? `Dev: ${error.message}`
        : "You don't have permission to access this resource.",
      imageSrc: "/img/auth-error.png",
      showRefresh: false,
      showReportBug: false,
      showGoBack: true,
      showTwitterUpdates: false,
      quickLinks: [{ label: "Login", href: "/login" }],
    },
    notfound: {
      title: "Not Found",
      subtitle: isDev
        ? `Dev: ${error.message}`
        : "The resource you're looking for doesn't exist.",
      imageSrc: "/img/404.png",
      showRefresh: false,
      showReportBug: false,
      showGoBack: true,
      showTwitterUpdates: false,
      quickLinks: [],
    },
    client: {
      title: "An error has occurred",
      subtitle:
        error.message ||
        "Something unexpected happened while processing your request.",
      imageSrc: "/img/404.png",
      showRefresh: false,
      showReportBug: true,
      showGoBack: true,
      showTwitterUpdates: false,
      quickLinks: [
        { label: "Home", href: "/" },
        { label: "Help Center", href: "/help" },
      ],
    },
  };

  const config = errorConfigs[errorType];

  return (
    <div>
      <EmptyState
        title={config.title}
        subtitle={config.subtitle}
        imageSrc={config.imageSrc}
        showReset={errorType === "client"}
        label="Try again"
        reset={reset}
        showRefresh={config.showRefresh}
        showGoBack={config.showGoBack}
        showReportBug={config.showReportBug}
        showTwitterUpdates={config.showTwitterUpdates}
        quickLinks={config.quickLinks}
        onRefresh={reset}
      />

      {/* Error details for development */}
      {isDev && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-900/90 text-white p-4 rounded-lg max-w-2xl mx-auto font-mono text-xs overflow-auto max-h-40">
          <div className="font-bold mb-2">🐛 Development Error Details:</div>
          <div>
            <strong>Type:</strong> {errorType}
          </div>
          <div>
            <strong>Name:</strong> {error.name}
          </div>
          <div>
            <strong>Message:</strong> {error.message}
          </div>
          {error.statusCode && (
            <div>
              <strong>Status:</strong> {error.statusCode}
            </div>
          )}
          {error.code && (
            <div>
              <strong>Code:</strong> {error.code}
            </div>
          )}
          {error.digest && (
            <div>
              <strong>Digest:</strong> {error.digest}
            </div>
          )}
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer hover:underline">
                Stack trace
              </summary>
              <pre className="mt-2 text-[10px] overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorPage;
