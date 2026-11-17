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
    <article
      className={`site-card site-blog-card ${
        large ? "site-blog-card--large" : ""
      }`}
    >
      <Link
        href={post.path}
        className={`site-card__media site-blog-card__media ${
          large ? "site-blog-card__media--large" : ""
        }`}
        aria-label={post.title}
      >
        <ContentImage
          image={post.cover}
          fallbackLabel="Article image pending"
          sizes={
            large
              ? "(max-width: 1024px) 100vw, 60vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
        />
      </Link>

      <div className={`site-card__body ${large ? "pt-6" : ""}`}>
        <span className="site-blog-card__date">
          {post.publishedLabel || "Journal"}
        </span>
        <h3 className="site-card__title">
          <Link href={post.path}>{post.title}</Link>
        </h3>
        {post.excerpt ? (
          <p className={`site-card__copy ${large ? "line-clamp-3" : "line-clamp-2"}`}>
            {post.excerpt}
          </p>
        ) : null}
        <div className="site-card__foot">
          <Link href={post.path} className="site-underline">
            Read article
          </Link>
        </div>
      </div>
    </article>
  );
}
