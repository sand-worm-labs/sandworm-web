import "server-only";
import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";
import { DataResult } from "@/services/firebase/db";

import { auth } from "../auth/[...nextauth]/auth-options";

// eslint-disable-next-line no-unused-vars
export async function GET(_request: Request) {
  const result = await QueryService.findAll();
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify(result.data));
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify(DataResult.failure("Unauthorized", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

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

  if (session.user?.id !== creator) {
    return new Response(
      JSON.stringify(DataResult.failure("Invalid User", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

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
  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify(DataResult.failure("Unauthorized", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

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
  if (session.user?.id !== creator) {
    return new Response(
      JSON.stringify(DataResult.failure("Invalid User", "UNAUTHORIZED")),
      { status: 401 }
    );
  }
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
  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify(DataResult.failure("Unauthorized", "UNAUTHORIZED")),
      { status: 401 }
    );
  }

  const { id }: { id: string } = await request.json();
  // let user = await QueryService.
  const result = await QueryService.delete(id);
  if (!result.success)
    return new Response(JSON.stringify(result), { status: 500 });
  return new Response(JSON.stringify({ success: true, data: result.data }));
}
