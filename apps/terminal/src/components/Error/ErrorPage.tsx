"use client";

import { useEffect } from "react";
import { Button } from "@sandworm/ui/kit/button";

import { errorKindOf, type ErrorKind } from "@/lib/errors/classify";

import errorImage from "../../../public/img/error.png";
import genericErrorImage from "../../../public/img/error.svg";
import serverErrorImage from "../../../public/img/server-error.png";

import { ErrorScreen } from "./ErrorScreen";

const COPY: Record<
  ErrorKind,
  {
    heading: string;
    title: string;
    subtitle: string;
    image: typeof errorImage;
    canRetry: boolean;
  }
> = {
  server: {
    heading: "?",
    title: "Something went wrong on our side",
    subtitle:
      "We hit a problem loading this page. Your data is safe. Try again in a moment.",
    image: serverErrorImage,
    canRetry: true,
  },
  network: {
    heading: "?",
    title: "Can't reach the server",
    subtitle: "Check your connection, then try again.",
    image: errorImage,
    canRetry: true,
  },
  database: {
    heading: "?",
    title: "We can't get to the data right now",
    subtitle: "Your numbers are safe. Try again in a moment.",
    image: errorImage,
    canRetry: true,
  },
  auth: {
    heading: "?",
    title: "You don't have access to this",
    subtitle: "If you think you should, ask your admin or contact support.",
    image: errorImage,
    canRetry: false,
  },
  client: {
    heading: "?",
    title: "We couldn't load this page",
    subtitle:
      "Your numbers are safe. Try again, and if it keeps happening, contact support.",
    image: genericErrorImage,
    canRetry: true,
  },
};

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
  isFullPage?: boolean;
};

// An error boundary's page. It never prints the error itself, which can name
// internals; the digest is there for support to look the failure up.
export function ErrorPage({ error, reset, isFullPage }: ErrorPageProps) {
  const copy = COPY[errorKindOf(error)];

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      heading={copy.heading}
      title={copy.title}
      subtitle={copy.subtitle}
      image={copy.image}
      actions={
        copy.canRetry ? <Button onClick={reset}>Try again</Button> : null
      }
      links={[{ href: "/", label: "Go to Overview" }]}
      reference={error.digest}
      isFullPage={isFullPage}
    />
  );
}
