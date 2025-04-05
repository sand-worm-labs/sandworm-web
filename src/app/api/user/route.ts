import "server-only";
import "@/services/firebase";

// eslint-disable-next-line no-unused-vars
export async function GET(_request: Request) {
  return new Response("Hello, Next.js!");
}
