import { TERMS_URL, PRIVACY_URL } from "@/utils/env";

// =====================================
// ⬢ Onboarding Footer
// =====================================
export function OnboardingFooter() {
  return (
    <footer className="flex flex-col items-center gap-1.5 text-[0.8rem] text-ink-300 dark:text-ink-300 py-4 font-body font-medium">
      <span>© 2026 Sandworm. All rights reserved</span>
      <div className="flex items-center gap-4">
        <a
          href={PRIVACY_URL()}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Privacy
        </a>
        <a
          href={TERMS_URL()}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Terms
        </a>
        <a href="/contact" className="hover:underline">
          Contact Team
        </a>
      </div>
    </footer>
  );
}
