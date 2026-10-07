import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blog } from "@/.source/server";
import { GuideVideo } from "@/components/docs/guide-video";
import { blogDateFormatter, blogSlug } from "@/lib/blog";
import { sortByDateDesc } from "@/lib/changelog";
import { getMDXComponents } from "@/mdx-components";

type PageProps = { params: Promise<{ slug: string }> };

function getPost(slug: string) {
  return blog.find((post) => blogSlug(post) === slug);
}

export function generateStaticParams() {
  return blog.map((post) => ({ slug: blogSlug(post) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `/blog/${slug}`;
  const title = `${post.title} · remocn`;
  const shareImage = post.videoPoster ?? "/hero.png";

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      publishedTime: post.date.toISOString(),
      url,
      siteName: "Remocn",
      title,
      description: post.description,
      locale: "en_US",
      images: [{ url: shareImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
      images: [shareImage],
    },
  };
}

const postComponents = { ...getMDXComponents(), GuideVideo };

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const iso = post.date.toISOString().slice(0, 10);
  const MDX = post.body;
  const sorted = sortByDateDesc(blog);
  const index = sorted.findIndex((p) => blogSlug(p) === slug);
  const next = index === -1 ? undefined : sorted[index + 1];

  return (
    <section className="pt-10 pb-24 sm:pt-14">
      <div className="section flex flex-col gap-8">
        <Link
          href="/blog"
          className="group relative inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] hover:text-foreground"
        >
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Blog
        </Link>

        {post.video ? (
          <GuideVideo
            src={post.video}
            poster={post.videoPoster}
            label={post.title}
          />
        ) : null}

        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <time
            dateTime={iso}
            className="font-mono text-xs font-medium text-muted-foreground"
          >
            {blogDateFormatter.format(post.date)}
          </time>
        </div>

        <div className="typeset typeset-docs max-w-2xl">
          <MDX components={postComponents} />
        </div>

        <div className="max-w-2xl border-t border-border pt-8">
          {next ? (
            <>
              <p className="font-mono text-xs font-medium text-muted-foreground">
                Read next
              </p>
              <Link
                href={`/blog/${blogSlug(next)}`}
                className="group mt-3 flex flex-col gap-1"
              >
                <span className="text-balance text-lg font-semibold tracking-tight text-foreground group-hover:underline">
                  {next.title}
                </span>
                <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {next.description}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/blog"
              className="group relative inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] hover:text-foreground"
            >
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              All posts
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
