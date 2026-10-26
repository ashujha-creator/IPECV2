import type { prisma } from "@/lib/prisma"; // adjust to your Prisma client singleton

type Db = typeof prisma;

export interface PublishedFileRow {
  path: string;
  contentType: string;
  storageKey: string;
}

/** Everything that talks to Prisma for the publish flow lives here. */
export class PlaygroundRepository {
  constructor(private readonly db: Db) {}

  /** "Missing" and "not yours" both come back null, so ids can't be probed. */
  findOwned(id: string, ownerId: string) {
    return this.db.playground.findFirst({
      where: { id, ownerId },
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        slug: true,
      },
    });
  }

  /**
   * Swaps the playground's file rows for the new set and marks it PUBLISHED, atomically.
   * Returns the storage keys of the rows that were replaced so the caller can delete them.
   */
  replacePublishedFiles(
    playgroundId: string,
    input: { files: PublishedFileRow[]; totalBytes: number; publishedAt: Date },
  ): Promise<string[]> {
    return this.db.$transaction(
      async (tx) => {
        // Serialise concurrent publishes of the same playground.
        await tx.$queryRaw`SELECT id FROM "playground" WHERE id = ${playgroundId} FOR UPDATE`;

        const previous = await tx.playgroundFile.findMany({
          where: { playgroundId },
          select: { storageKey: true },
        });

        // Readers see the old set until commit, then the new one.
        await tx.playgroundFile.deleteMany({ where: { playgroundId } });
        await tx.playgroundFile.createMany({
          data: input.files.map((f) => ({ playgroundId, ...f })),
        });

        await tx.playground.update({
          where: { id: playgroundId },
          data: {
            status: "PUBLISHED",
            entryFile: "index.html",
            totalBytes: input.totalBytes,
            publishedAt: input.publishedAt,
          },
        });

        return previous.map((p) => p.storageKey);
      },
      { timeout: 10_000 },
    );
  }
}