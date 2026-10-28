import React, { useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface LifeGalleryProps {
  heading?: string;
  description?: string;
  images?: GalleryImage[];
  columns?: number;
  speedSeconds?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default demo content                                              */
/* ------------------------------------------------------------------ */

const defaultImages: GalleryImage[] = [
  {
    src: "https://picsum.photos/seed/ipec-fashion/400/460",
    alt: "Students at a college fashion showcase",
  },
  {
    src: "https://picsum.photos/seed/ipec-dance/400/460",
    alt: "Students performing a group dance",
  },
  {
    src: "https://picsum.photos/seed/ipec-alumni/400/460",
    alt: "Alumni networking event group photo",
  },
  {
    src: "https://picsum.photos/seed/ipec-fresher/400/460",
    alt: "Students posing at a fresher's event",
  },
  {
    src: "https://picsum.photos/seed/ipec-award/400/460",
    alt: "Dignitary presenting an award on stage",
  },
  {
    src: "https://picsum.photos/seed/ipec-corridor/400/460",
    alt: "College corridor lit up at night",
  },
  {
    src: "https://picsum.photos/seed/ipec-group/400/460",
    alt: "Group of students smiling together outdoors",
  },
  {
    src: "https://picsum.photos/seed/ipec-classroom/400/460",
    alt: "Students in a lecture hall during a session",
  },
  {
    src: "https://picsum.photos/seed/ipec-cyclothon/400/460",
    alt: "Students participating in a cyclothon event",
  },
  {
    src: "https://picsum.photos/seed/ipec-perform/400/460",
    alt: "Students performing on stage under red lights",
  },
  {
    src: "https://picsum.photos/seed/ipec-podium/400/460",
    alt: "Speaker addressing an audience from a podium",
  },
  {
    src: "https://picsum.photos/seed/ipec-lab/400/460",
    alt: "Students working together in a lab setting",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function distributeIntoColumns(
  images: GalleryImage[],
  columnCount: number,
): GalleryImage[][] {
  const cols: GalleryImage[][] = Array.from({ length: columnCount }, () => []);
  images.forEach((img, i) => {
    cols[i % columnCount].push(img);
  });
  return cols;
}

/* ------------------------------------------------------------------ */
/*  Column                                                            */
/* ------------------------------------------------------------------ */

function GalleryColumn({
  images,
  direction,
  duration,
}: {
  images: GalleryImage[];
  direction: "up" | "down";
  duration: number;
}) {
  // Make sure every column has enough content to animate smoothly.
  const safeImages =
    images.length < 3 ? [...images, ...images, ...images] : images;

  // Two identical sets are required for a seamless infinite loop.
  const items = [...safeImages, ...safeImages];

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-xl">
      <div
        className={`life-gallery-track ${
          direction === "up"
            ? "life-gallery-track-up"
            : "life-gallery-track-down"
        }`}
        style={
          {
            "--duration": `${duration}s`,
          } as React.CSSProperties
        }
      >
        {items.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="w-full shrink-0 overflow-hidden rounded-xl pb-3"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
              <img
                src={img.src}
                alt={img.alt}
                loading={i < safeImages.length ? "eager" : "lazy"}
                draggable={false}
                className="block h-full w-full object-cover object-center"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LifeGallery                                                       */
/* ------------------------------------------------------------------ */

export default function LifeGallery({
  heading = "Life @IPEC",
  description = "Get a sneak peek into the dynamic word of IPEC, where we not only focus on academics, but focus beyond the classroom to give you an enriching and vibrant campus experience. Come together and create memories that will last a lifetime.",
  images = defaultImages,
  columns = 5,
  speedSeconds = 34,
  className = "",
}: LifeGalleryProps) {
  const columnData = useMemo(
    () => distributeIntoColumns(images, columns),
    [images, columns],
  );

  return (
    <section
      aria-labelledby="life-gallery-heading"
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 lg:p-10 w-full py-12 px-4 sm:px-6 lg:px-8 select-none ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #0B1550 0, #0B1550 1.5px, transparent 1.5px, transparent 14px)",
        }}
      />

      <div className="relative mb-6 max-w-4xl lg:mb-8">
        <h2
          id="life-gallery-heading"
          className="text-[1.8rem] font-bold text-slate-900 sm:text-[2.1rem] lg:text-[2.4rem]"
        >
          {heading}
        </h2>
        <p className="mt-2 text-[1.25rem] leading-relaxed text-slate-500 sm:text-[1rem] lg:text-[1.1rem]">
          {description}
        </p>
      </div>

      <div
        className="
    relative grid h-[480px] grid-cols-2 gap-3
    sm:h-[500px] sm:grid-cols-3
    lg:h-[510px] lg:grid-cols-5
  "
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-white to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-white to-transparent"
        />

        {columnData.map((col, i) => (
          <GalleryColumn
            key={i}
            images={col}
            direction={i % 2 === 0 ? "up" : "down"}
            duration={speedSeconds + i * 3}
          />
        ))}
      </div>

      <style>{`
  .life-gallery-track {
    display: flex;
    flex-direction: column;
    will-change: transform;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
  }

  .life-gallery-track-up {
    animation: life-gallery-scroll-up var(--duration, 30s) linear infinite;
  }

  .life-gallery-track-down {
    animation: life-gallery-scroll-down var(--duration, 30s) linear infinite;
  }

  @keyframes life-gallery-scroll-up {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      transform: translate3d(0, -50%, 0);
    }
  }

  @keyframes life-gallery-scroll-down {
    from {
      transform: translate3d(0, -50%, 0);
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  .group:hover .life-gallery-track {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    .life-gallery-track {
      animation: none !important;
      transform: none !important;
    }
  }
`}</style>
    </section>
  );
}
