const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:8003";

// A protocol's logo, on this origin so an <img> never depends on the API's address. The
// API answers with the studio's upload, or a redirect to DefiLlama's icon for the same
// slug; the redirect is passed on, so the browser fetches that icon itself.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let upstream: Response;
  try {
    upstream = await fetch(
      `${INTERNAL_API_URL}/api/showcase/logos/${encodeURIComponent(slug)}`,
      {
        redirect: "manual",
        headers: {
          "if-none-match": request.headers.get("if-none-match") ?? "",
        },
        cache: "no-store",
      }
    );
  } catch {
    return new Response(null, { status: 502 });
  }

  // What the browser needs to show it and to cache it.
  const headers = new Headers(
    ["content-type", "etag", "cache-control", "location"].flatMap(name => {
      const value = upstream.headers.get(name);
      return value ? [[name, value] as [string, string]] : [];
    })
  );

  // 200 with the image, 304, a 302 to DefiLlama, or 404.
  return new Response(upstream.status === 200 ? upstream.body : null, {
    status: upstream.status,
    headers,
  });
}
