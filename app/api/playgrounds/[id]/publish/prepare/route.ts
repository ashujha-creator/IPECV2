import { NextResponse } from "next/server";
import { PLAYGROUND_CONFIG } from "@/lib/playground/config";
import { publishService } from "@/lib/playground/container";
import { prepareRequestSchema } from "@/lib/playground/dto/publish.dto";
import {
  handle,
  parseJson,
  requireUserId,
  type PublishRouteContext,
} from "@/lib/playground/http";

export const maxDuration = 30;

export const POST = handle(async (request, { params }: PublishRouteContext) => {
  const { id } = await params;
  const userId = await requireUserId(request);
  const dto = await parseJson(
    request,
    prepareRequestSchema,
    PLAYGROUND_CONFIG.prepareBodyLimit,
  );

  return NextResponse.json(await publishService.prepare(userId, id, dto));
});
