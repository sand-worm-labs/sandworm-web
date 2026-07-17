import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that authenticated users should NOT be able to visit
const AUTH_ROUTES = [
  "/signin",
  "/signup",
  "/password-change",
  "/reset",
  "/check-mail",
];

// Routes that require authentication
const PROTECTED_ROUTES = ["/workspace"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Optimistic auth check — cookie presence only
  // Real validation happens in useSession → currentUser query
  const accessToken = req.cookies.get("access_token");
  const isAuthenticated = !!accessToken;

  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  console.log(
    `[middleware] ${pathname} | cookie:${isAuthenticated} | authRoute:${isAuthRoute} | protectedRoute:${isProtectedRoute}`
  );

  // Authenticated user hitting /signin, /signup etc → send to workspace
  if (isAuthenticated && isAuthRoute) {
    console.warn(
      `[middleware] LOOP RISK — cookie present but user hitting ${pathname}, bouncing to /workspace`
    );
    return NextResponse.redirect(new URL("/workspace", req.nextUrl));
  }

  // Unauthenticated user hitting protected route → send to signin
  if (!isAuthenticated && isProtectedRoute) {
    const callback = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/signin?callback=${callback}`, req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
