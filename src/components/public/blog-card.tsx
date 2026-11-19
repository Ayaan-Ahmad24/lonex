import Image from "next/image";
import Link from "next/link";
import type { PublicBlogCard } from "@/lib/public/dto";

/**
 * The journal card.
 *
 * One shape for every article: a 16:9 photograph, the subject, the publication
 * date, the title, a two-line excerpt and the read link. Height is driven by
 * the tallest card in the row, so the read links sit on one baseline.
 *
 * The subject is passed in rather than read from the post: the blog table has
 * no category column, so the archive derives one from the slug and title and
 * the same label is handed to this card. Nothing here invents a taxonomy.
 */
export function BlogCard({
  post,
  category,
}: {
  post: PublicBlogCard;
  category: string;
}) {
  const excerpt = post.excerpt?.trim();

  return (
    <article className="lxh-journal-card" data-lxh-journal-card>
      <Link href={post.path} className="lxh-journal-card__link">
        <figure className="lxh-journal__media">
          {post.cover ? (
            <Image
              src={post.cover.url}
              alt={post.cover.alt}
              fill
              sizes="(max-width: 820px) 100vw, (max-width: 1100px) 50vw, 33vw"
              className="lxh-journal__image"
            />
          ) : null}
        </figure>

        <div className="lxh-journal-card__body">
          <p className="lxh-journal-card__meta">
            <span className="lxh-journal-card__topic">{category}</span>
            {post.publishedLabel ? (
              <time
                className="lxh-journal-card__date"
                dateTime={post.publishedAt}
              >
                {post.publishedLabel}
              </time>
            ) : null}
          </p>

          <h3 className="lxh-journal-card__title">{post.title}</h3>

          {excerpt ? (
            <p className="lxh-journal-card__excerpt">{excerpt}</p>
          ) : null}

          <span className="lxh-journal-card__read">
            Read article
            <span aria-hidden="true"> →</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
