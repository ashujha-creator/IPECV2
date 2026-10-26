import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // ⚠️ adjust to your actual better-auth export
import { prisma } from "@/lib/prisma"; // ⚠️ adjust to your actual Prisma client singleton
import { validateSlugFormat } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = (request.nextUrl.searchParams.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const formatCheck = validateSlugFormat(slug);

  if (!formatCheck.valid) {
    return NextResponse.json({ available: false, reason: formatCheck.reason });
  }

  const existing = await prisma.playground.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({
      available: false,
      reason: "That slug is already taken.",
    });
  }

  return NextResponse.json({ available: true });
}
