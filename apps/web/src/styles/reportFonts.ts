import { Newsreader, Bricolage_Grotesque } from "next/font/google";

// Experimental typography for the public/report view only — see
// PublicEditor.tsx (`report-typography` wrapper) and NotebookHero.tsx.
export const reportProseFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-report-prose",
  display: "swap",
});

export const reportHeadingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-report-heading",
  display: "swap",
});
