import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const role = token.role as string
    const companyName = (token.companyName as string) || ""

    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/holdings", request.url))
    }

    if (["RESELLER", "DISTRIBUTOR", "TERRITORY_PARTNER"].includes(role)) {
      return NextResponse.redirect(new URL("/marketing", request.url))
    }

    if (companyName.includes("Marketing")) {
      return NextResponse.redirect(new URL("/marketing", request.url))
    } else if (companyName.includes("Manufacturing")) {
      return NextResponse.redirect(new URL("/manufacturing/ceo", request.url))
    } else if (companyName.includes("Supply")) {
      return NextResponse.redirect(new URL("/supply/ceo", request.url))
    } else {
      return NextResponse.redirect(new URL("/holdings", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/"],
}
