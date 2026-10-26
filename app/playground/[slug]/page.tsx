import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { playgroundTag } from "@/lib/playground-cache";
import { RENDER_SANDBOX } from "@/lib/render-sandbox";
export const instant = false;
type Props = { params: Promise<{ slug: string }> };

// Cached per slug (Cache Components requires uncached DB reads to be cached or
// streamed). The publish route invalidates this tag, so changes show up immediately.
async function getPublished(slug: string) {
  "use cache";
  cacheTag(playgroundTag(slug));
  cacheLife("hours");

  return prisma.playground.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { slug: true, title: true, entryFile: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const playground = await getPublished(slug);
  if (!playground) return {};
  return { title: playground.title ?? playground.slug };
}

export default async function PlaygroundPublicPage({ params }: Props) {
  const { slug } = await params;
  const playground = await getPublished(slug);

  if (!playground) notFound();

  return (
    <iframe
      title={playground.title ?? playground.slug}
      // The render route serves each file separately, so the browser resolves
      // style.css, script.js and assets/* itself. Nothing is stitched together here.
      src={`/render/${playground.slug}/${playground.entryFile}`}
      // No allow-same-origin: user code must never share this app's origin.
      sandbox={RENDER_SANDBOX}
      referrerPolicy="no-referrer"
      style={{ border: 0, width: "100%", height: "100dvh", display: "block" }}
    />
  );
}
