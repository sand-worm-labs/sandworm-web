import { ROUTES } from "@/config/routes";

import notFoundImage from "../../../public/img/404.png";

import { ErrorScreen } from "./ErrorScreen";

const SECTIONS = [
  ROUTES.overview,
  ROUTES.briefing,
  ROUTES.analysis,
  ROUTES.signals,
  ROUTES.requests,
] as const;

// The terminal's 404, with a way back into each section
export function NotFoundPage({ isFullPage }: { isFullPage?: boolean }) {
  return (
    <ErrorScreen
      heading="404"
      title="Page not found"
      subtitle="The page you're looking for doesn't exist, or has moved."
      image={notFoundImage}
      links={SECTIONS.map(({ path, label }) => ({ href: path, label }))}
      isFullPage={isFullPage}
    />
  );
}
