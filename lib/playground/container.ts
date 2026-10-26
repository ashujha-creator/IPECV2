// Composition root: the only place that knows how the pieces are wired together.
import { prisma } from "@/lib/prisma"; // adjust to your Prisma client singleton
import { supabase } from "@/lib/supabase-browser";
import { PLAYGROUND_CONFIG } from "@/lib/playground/config";
import { PlaygroundRepository } from "@/lib/playground/repositories/playground.repository";
import { StorageRepository } from "@/lib/playground/repositories/storage.repository";
import { PublishService } from "@/lib/playground/services/publish.service";
import { supabaseAdmin } from "../supabaseAdmin";

export const publishService = new PublishService(
  new PlaygroundRepository(prisma),
  new StorageRepository(supabaseAdmin, PLAYGROUND_CONFIG.bucket),
);
