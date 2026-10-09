import {
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { ShowcaseIndex } from "@/components/Showcase/ShowcaseIndex";

export const metadata = {
  title: "Showcase – Sandworm",
};

// The Showcase index inside a workspace. Same page as /showcase, without its
// own header: the workspace already has one.
export default async function WorkspaceShowcasePage() {
  const [config, notebooks] = await Promise.all([
    fetchShowcaseConfig(),
    fetchShowcaseNotebooks(),
  ]);
  return <ShowcaseIndex config={config} notebooks={notebooks} embedded />;
}
