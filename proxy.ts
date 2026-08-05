import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/about", "/login", "/register", "/courses"];
const AUTH_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (session?.user) {
    if (isAuthPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
