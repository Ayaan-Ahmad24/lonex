import Link from "next/link";
import type { PublicBlogCard } from "@/lib/public/dto";
import { ContentImage } from "./content-image";

export function BlogCard({
  post,
  size = "default",
}: {
  post: PublicBlogCard;
  size?: "default" | "large";
}) {
  const large = size === "large";

  return (
    <article className="group lux-card flex h-full flex-col">
      <Link
        href={post.path}
        className={`lux-media relative block overflow-hidden bg-[#F5EDED] ${
          large ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
        aria-label={post.title}
      >
        <ContentImage
          image={post.cover}
          fallbackLabel="Article image pending"
          sizes={large ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
        />
      </Link>

      <div className={`flex flex-1 flex-col ${large ? "pt-6" : "pt-5"}`}>
        <p className="type-eyebrow text-[#CF0A0A]">
          {post.publishedLabel || "Journal"}
        </p>
        <h3
          className={`mt-3 font-semibold leading-tight tracking-tight text-black ${
            large ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          <Link href={post.path} className="transition-colors hover:text-[#CF0A0A]">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? (
          <p
            className={`mt-3 text-black/55 ${
              large ? "line-clamp-3 text-base leading-7" : "line-clamp-3 text-sm leading-6"
            }`}
          >
            {post.excerpt}
          </p>
        ) : null}
        <span className="type-eyebrow mt-auto flex items-center gap-2 pt-6 text-black/55 transition-colors group-hover:text-[#CF0A0A]">
          Read article
          <span aria-hidden="true" className="arrow-slide">
            →
          </span>
        </span>
      </div>
    </article>
  );
}
