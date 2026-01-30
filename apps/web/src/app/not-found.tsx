"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/EmptyState";

interface NotFoundStateProps {
  error: Error;
}

const NotFound: React.FC<NotFoundStateProps> = ({ error }) => {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      heading="404"
      title="Page Not Found"
      subtitle="The page you're looking for doesn't exist."
      showGoBack={false}
      quickLinks={[
        { label: "Home", href: "/" },
        { label: "Explore", href: "/explore" },
        { label: "Docs", href: "/docs" },
        { label: "Help Center", href: "/help" },
        { label: "Twitter Updates", href: "https://twitter.com/your_handle" },
      ]}
    />
  );
};

export default NotFound;
