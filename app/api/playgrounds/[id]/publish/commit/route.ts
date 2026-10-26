import { after, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { playgroundTag } from "@/lib/playground-cache";
import { PLAYGROUND_CONFIG } from "@/lib/playground/config";
import { publishService } from "@/lib/playground/container";
import {
  commitRequestSchema,
  type CommitResponseDto,
} from "@/lib/playground/dto/publish.dto";
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
    commitRequestSchema,
    PLAYGROUND_CONFIG.commitBodyLimit,
  );

  const result = await publishService.commit(userId, id, dto);

  revalidateTag(playgroundTag(result.slug), { expire: 0 });
  // Runs after the response is sent, so cleanup never slows the user down.
  after(() => publishService.deleteObjects(result.staleKeys));

  const body: CommitResponseDto = {
    success: "Playground published successfully.",
    files: result.files,
    totalBytes: result.totalBytes,
  };
  return NextResponse.json(body);
});
