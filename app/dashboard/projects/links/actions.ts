// app/dashboard/projects/links/actions.ts
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { NAV_MENU_KEY } from "@/lib/nav-menu/constants";
import { parseNavContent } from "@/lib/nav-menu/schema";
import type {
  NavActionErrorCode,
  NavActionResult,
  NavMenuContent,
  NavMenuSnapshot,
} from "@/lib/nav-menu/types";

type Failure = Extract<NavActionResult, { ok: false }>;

/* -------------------------------------------------------------------------- */
/* Authorization                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The single place that decides who may edit the global menu.
 * MVP: any signed-in user. When roles are added, change only this function,
 * e.g. `return session?.user.role === "admin"`.
 */
async function canEditNav(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  return Boolean(session?.user);
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Saves the menu.
 *
 * `expectedVersion` is the version the editor loaded (null = the editor
 * believes no menu exists yet and wants to create it). If the stored version
 * differs, someone else saved in between and we refuse instead of silently
 * overwriting their work.
 */
export async function saveNavMenuAction(input: {
  content: unknown;
  expectedVersion: number | null;
}): Promise<NavActionResult<NavMenuSnapshot>> {
  if (!(await canEditNav())) return unauthorized();

  const expectedVersion = input?.expectedVersion;
  if (expectedVersion !== null && !isValidVersion(expectedVersion)) {
    return failure(
      "VALIDATION",
      "The menu version is invalid. Reload the page.",
    );
  }

  const parsed = parseNavContent(input.content, "strict");
  if (!parsed.success) {
    return failure(
      "VALIDATION",
      "The menu has problems and was not saved.",
      parsed.errors,
    );
  }

  try {
    const row =
      expectedVersion === null
        ? await prisma.navMenu.create({
            data: { key: NAV_MENU_KEY, content: toJson(parsed.data) },
          })
        : await prisma.navMenu.update({
            where: { key: NAV_MENU_KEY, version: expectedVersion },
            data: {
              content: toJson(parsed.data),
              version: { increment: 1 },
            },
          });

    // ==========================================
    // ADD CACHE INVALIDATION HERE
    // ==========================================
    revalidatePath("/", "layout");

    return {
      ok: true,
      data: {
        content: parsed.data,
        version: row.version,
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return handleWriteError(error, expectedVersion === null);
  }
}

/** Deletes the saved menu so the builder returns to the template picker. */
export async function deleteNavMenuAction(input: {
  expectedVersion: number;
}): Promise<NavActionResult> {
  if (!(await canEditNav())) return unauthorized();

  const expectedVersion = input?.expectedVersion;
  if (!isValidVersion(expectedVersion)) {
    return failure(
      "VALIDATION",
      "The menu version is invalid. Reload the page.",
    );
  }

  try {
    const { count } = await prisma.navMenu.deleteMany({
      where: { key: NAV_MENU_KEY, version: expectedVersion },
    });

    if (count > 0) {
      // ==========================================
      // ADD CACHE INVALIDATION HERE
      // ==========================================
      // Revalidate as layout
      revalidatePath("/", "layout");

      return { ok: true, data: undefined };
    }

    // Nothing matched: either it changed since we loaded it, or it's already gone.
    return (await menuExists()) ? conflict() : { ok: true, data: undefined };
  } catch (error) {
    console.error("[nav-menu] delete failed", error);
    return failure("UNKNOWN", "Something went wrong while deleting the menu.");
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers (not exported: "use server" files may only export actions)         */
/* -------------------------------------------------------------------------- */

function failure(
  code: NavActionErrorCode,
  message: string,
  details?: string[],
): Failure {
  return { ok: false, code, message, details };
}

function unauthorized(): Failure {
  return failure("UNAUTHORIZED", "You need to be signed in to edit the menu.");
}

function conflict(): Failure {
  return failure(
    "CONFLICT",
    "The menu was changed in another tab or session. Reload the page to get the latest version, then reapply your changes.",
  );
}

function isValidVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

async function menuExists(): Promise<boolean> {
  const row = await prisma.navMenu.findUnique({
    where: { key: NAV_MENU_KEY },
    select: { id: true },
  });
  return row !== null;
}

/** Prisma error code (e.g. "P2002"), read structurally so no generated-client import is needed. */
function errorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return null;
}

async function handleWriteError(
  error: unknown,
  wasCreating: boolean,
): Promise<Failure> {
  const code = errorCode(error);

  // create() hit the unique key: someone else created the menu first.
  if (wasCreating && code === "P2002") return conflict();

  // update() matched nothing: version changed, or the row was deleted.
  if (!wasCreating && code === "P2025") {
    if (await menuExists()) return conflict();
    return failure(
      "NOT_FOUND",
      "The menu no longer exists. Reload the page to start again.",
    );
  }

  console.error("[nav-menu] save failed", error);
  return failure("UNKNOWN", "Something went wrong while saving the menu.");
}

/**
 * Prisma's Json input type rejects TypeScript interfaces. The content is
 * already validated plain data, so a JSON round-trip is a cheap, safe way to
 * hand it over.
 */
function toJson(content: NavMenuContent) {
  return JSON.parse(JSON.stringify(content));
}
