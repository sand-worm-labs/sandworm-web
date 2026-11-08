import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntityScreen } from "@/components/Analysis/Entity/EntityScreen";
import { getEntityPage } from "@/lib/analysis/entity/source";
import { isEntityKind } from "@/lib/analysis/entity/kinds";
import { pageMetadata } from "@/lib/metadata";
import { getSession } from "@/lib/session/source";

type EntityRouteProps = { params: Promise<{ kind: string; slug: string }> };

export async function generateMetadata({
  params,
}: EntityRouteProps): Promise<Metadata> {
  const { kind, slug } = await params;
  if (!isEntityKind(kind)) return {};

  const page = await getEntityPage(kind, slug);
  return page ? pageMetadata(page.name) : {};
}

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
