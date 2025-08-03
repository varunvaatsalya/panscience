import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export function middleware(request) {
  const token = request.cookies.get("sessionToken")?.value;

  const publicPaths = ["/login", "/favicon.ico"];

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const decoded = jwtVerify(token, secret);
    request.headers.set("x-user-role", decoded.role);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/loginn", request.url));
  }
}


export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
