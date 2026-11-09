import { EntityScreen } from "@/components/Analysis/Entity/EntityScreen";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Analysis");

type EntityRouteProps = { params: Promise<{ id: string }> };

export default async function EntityRoute({ params }: EntityRouteProps) {
  const { id } = await params;
  return <EntityScreen id={id} />;
}
