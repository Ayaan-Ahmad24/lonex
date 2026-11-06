import type { AdminIconName } from "../registry/types";

const PATHS: Record<AdminIconName, string> = {
  dashboard:
    "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.9-1.1L14.6 3h-5.2l-.4 2.8a7.6 7.6 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.9 1.1l.4 2.8h5.2l.4-2.8a7.6 7.6 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6c.1-.4.1-.7.1-1.1Z",
  media:
    "M3 5h18v14H3V5Zm3 10 4-4 3 3 2-2 4 4M8.5 9.5h.01",
  pages:
    "M6 3h9l4 4v14H6V3Zm9 0v5h5M9 13h7M9 17h5",
  audit:
    "M9 3h6l4 4v14H5V3h4Zm-1 7h8M8 14h8M8 18h5",
  shield: "M12 3 5 6v5c0 4.2 2.7 7.5 7 10 4.3-2.5 7-5.8 7-10V6l-7-3Z",
  categories:
    "M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 13h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  products:
    "M3 7.5 12 3l9 4.5-9 4.5-9-4.5ZM3 7.5V16l9 5 9-5V7.5M12 12v9",
  sellers:
    "M3 9.5 5 4h14l2 5.5M3 9.5h18M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v9h14v-9M10 21v-5h4v5",
  verification:
    "M12 3 5 6v5c0 4.2 2.7 7.5 7 10 4.3-2.5 7-5.8 7-10V6l-7-3Zm-3 9 2 2 4-4",
  blog: "M5 4h14v16H5V4Zm3 4h8M8 12h8M8 16h5",
};

export function AdminIcon({
  name,
  className = "h-4 w-4",
}: {
  name: AdminIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
