import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { auth } from "@/lib/auth"; // adjust to your better-auth export
import { HttpError } from "@/lib/playground/error";

export type PublishRouteContext = { params: Promise<{ id: string }> };

/** Wraps a route handler so thrown HttpErrors become JSON responses. */
export function handle<Ctx>(
  fn: (request: NextRequest, ctx: Ctx) => Promise<Response>,
) {
  return async (request: NextRequest, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(request, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      console.error("[playground] unexpected failure", error);
      return NextResponse.json(
        { error: "Failed to publish playground." },
        { status: 500 },
      );
    }
  };
}

export async function requireUserId(request: NextRequest): Promise<string> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new HttpError(401, "Unauthorized");
  return session.user.id;
}

export async function parseJson<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
  maxBytes: number,
): Promise<T> {
  // Advisory only (chunked bodies have no length); Vercel enforces its own 4.5 MB cap.
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) {
    throw new HttpError(413, "Request body is too large.");
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "Expected a JSON body.");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new HttpError(
      400,
      `Invalid "${issue.path.join(".") || "body"}": ${issue.message}`,
    );
  }
  return parsed.data;
}
