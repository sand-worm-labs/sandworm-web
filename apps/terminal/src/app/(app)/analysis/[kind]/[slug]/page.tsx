import { notFound } from "next/navigation";

import { EntityScreen } from "@/components/Analysis/Entity/EntityScreen";
import { getEntityPage } from "@/features/analysis/entity/source";
import { isEntityKind } from "@/features/analysis/entity/types";
import { getSession } from "@/features/session/source";

type EntityRouteProps = { params: Promise<{ kind: string; slug: string }> };

export default async function EntityRoute({ params }: EntityRouteProps) {
  const { kind, slug } = await params;
  if (!isEntityKind(kind)) notFound();

  const [page, session] = await Promise.all([
    getEntityPage(kind, slug),
    getSession(),
  ]);
  if (!page) notFound();

  return <EntityScreen page={page} clientName={session.client.name} />;
}
