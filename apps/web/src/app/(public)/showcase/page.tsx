import {
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { ShowcaseIndex } from "@/components/Showcase/ShowcaseIndex";

export const metadata = {
  title: "Showcase – Sandworm",
  description:
    "Onchain analysis by category: off-ramps, stablecoins, DEXes, lending and more. Every number opens the notebook behind it.",
};

// Page 1 of the Showcase: an app page that only links to other pages.
export default async function ShowcasePage() {
  const [config, notebooks] = await Promise.all([
    fetchShowcaseConfig(),
    fetchShowcaseNotebooks(),
  ]);
  return <ShowcaseIndex config={config} notebooks={notebooks} />;
}
