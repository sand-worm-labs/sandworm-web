import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";

// eslint-disable-next-line no-unused-vars
export async function GET(_request: Request) {
  const result = await QueryService.findAll();
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}

export async function POST(request: Request) {
  const {
    title,
    description,
    creator,
    privateQuery,
    query,
    tags,
  }: {
    title: string;
    description: string;
    creator: string;
    privateQuery: boolean;
    query: string;
    tags: string[];
  } = await request.json();

  const result = await QueryService.create(
    title,
    description,
    creator,
    privateQuery,
    query,
    tags
  );
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });

  return new Response(JSON.stringify(result.data));
}

export async function PATCH(request: Request) {
  const {
    id,
    title,
    description,
    creator,
    privateQuery,
    query,
    tags,
  }: {
    id: string;
    title: string;
    description: string;
    creator: string;
    privateQuery: boolean;
    query: string;
    tags: string[];
  } = await request.json();
  const result = await QueryService.update(
    id,
    title,
    description,
    creator,
    privateQuery,
    query,
    tags
  );
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}

export async function DELETE(request: Request) {
  const { id }: { id: string } = await request.json();
  const result = await QueryService.delete(id);
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify({ success: true, data: result.data }));
}
