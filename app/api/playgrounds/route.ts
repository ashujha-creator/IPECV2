import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // ⚠️ adjust to your actual better-auth export
import { prisma } from "@/lib/prisma"; // ⚠️ adjust to your actual Prisma client singleton
import { validateSlugFormat } from "@/lib/slug";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = (typeof body?.slug === "string" ? body.slug : "")
    .trim()
    .toLowerCase();

  const formatCheck = validateSlugFormat(slug);
  if (!formatCheck.valid) {
    return NextResponse.json({ error: formatCheck.reason }, { status: 400 });
  }

  const existing = await prisma.playground.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "That slug is already taken." },
      { status: 409 },
    );
  }

  const playground = await prisma.playground.create({
    data: {
      slug,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ playground }, { status: 201 });
}
