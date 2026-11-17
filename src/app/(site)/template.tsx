/**
 * Page transition for the public site.
 *
 * A template re-mounts on every navigation, so the wrapper can play a short
 * entrance each time without any client JavaScript. The animation is
 * CSS-only, runs immediately on mount, and is disabled for reduced motion —
 * content is never gated behind an observer.
 */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="site-transition">{children}</div>;
}
