import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // ⚠️ adjust to your actual better-auth export
import { prisma } from "@/lib/prisma"; // ⚠️ adjust to your actual Prisma client singleton
import PlaygroundGrid from "@/components/playground/PlaygroundGrid"; // ⚠️ adjust to your actual PlaygroundGrid component path



export default async function PlaygroundListPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const playgrounds = await prisma.playground.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      ownerId: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Published playgrounds</h1>

      <PlaygroundGrid
        playgrounds={playgrounds.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
        currentUserId={session?.user?.id ?? null}
      />
    </div>
  );
}
