import {
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { ShowcaseIndex } from "@/components/Showcase/ShowcaseIndex";

export const metadata = {
  title: "Showcase – Sandworm",
  description:
    "Teams that use Sandworm, and teams we care about: what the chain shows about each, with the notebook behind every number.",
};

// Page 1 of the Showcase: an app page that only links to other pages.
export default async function ShowcasePage() {
  const [config, notebooks] = await Promise.all([
    fetchShowcaseConfig(),
    fetchShowcaseNotebooks(),
  ]);
  return <ShowcaseIndex config={config} notebooks={notebooks} />;
}
