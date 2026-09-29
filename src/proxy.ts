import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_REALM, getAdminPassword, isAuthorizedAdmin } from "@/lib/admin/auth";

export function proxy(request: NextRequest) {
  if (!getAdminPassword()) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!isAuthorizedAdmin(request.headers.get("authorization"))) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"` },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
