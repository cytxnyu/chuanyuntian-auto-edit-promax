import type { Metadata } from "next";
import Link from "next/link";
import { blog } from "@/.source/server";
import { blogDateFormatter, blogSlug } from "@/lib/blog";
import { sortByDateDesc } from "@/lib/changelog";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "Making-of stories behind the videos we build with remocn — the storyboard, the decisions that made each one work, and the prompt that rebuilds it.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: "Remocn",
    title: "Blog · remocn",
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      { url: "/hero.png", width: 1200, height: 675, alt: "Blog · remocn" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · remocn",
    description: DESCRIPTION,
    images: ["/hero.png"],
  },
};

export default function BlogPage() {
  const posts = sortByDateDesc(blog);

  return (
    <>
      <section className="pt-24 pb-10 sm:pt-28">
        <div className="section">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {DESCRIPTION}
          </p>
        </div>
      </section>

      <section className="pb-24">
        <ul className="section flex flex-col">
          {posts.map((post, index) => {
            const slug = blogSlug(post);
            const iso = post.date.toISOString().slice(0, 10);

            return (
              <li key={slug}>
                <article
                  className={cn(
                    "group relative grid gap-4 py-8 md:grid-cols-[7rem_1fr_16rem] md:gap-8",
                    index > 0 && "border-t border-border",
                  )}
                >
                  <time
                    dateTime={iso}
                    className="font-mono text-xs font-medium tabular-nums text-muted-foreground md:pt-1"
                  >
                    {blogDateFormatter.format(post.date)}
                  </time>

                  <div className="flex min-w-0 flex-col gap-2">
                    <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground group-hover:underline sm:text-2xl">
                      <Link
                        href={`/blog/${slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {post.description}
                    </p>
                  </div>

                  <div className="aspect-video overflow-hidden rounded-lg bg-muted outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
                    {post.videoPoster ? (
                      // biome-ignore lint/performance/noImgElement: remote CDN video posters of arbitrary origin
                      <img
                        src={post.videoPoster}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
