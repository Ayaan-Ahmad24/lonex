/**
 * Social profiles shown in the public shell.
 *
 * The CMS can override any network through the settings record. When it does
 * not, a platform landing page is used so the footer remains complete and the
 * icons never point at a profile that has not been confirmed.
 *
 * These defaults are platform URLs, not verified LONEX profiles. Replace the
 * values here (or the matching setting in the CMS) once the real profiles are
 * confirmed.
 */
export const SOCIAL_NETWORKS = [
  {
    key: "instagram",
    label: "Instagram",
    defaultUrl: "https://www.instagram.com/",
  },
  {
    key: "facebook",
    label: "Facebook",
    defaultUrl: "https://www.facebook.com/",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    defaultUrl: "https://www.linkedin.com/",
  },
  {
    key: "youtube",
    label: "YouTube",
    defaultUrl: "https://www.youtube.com/",
  },
] as const;

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]["key"];

export type ResolvedSocialLink = {
  key: SocialNetwork;
  label: string;
  url: string;
  /** True when the URL is the platform default, not a confirmed profile. */
  isPlatformDefault: boolean;
};

export function resolveSocialLinks(
  social: Record<string, string> | null | undefined,
): ResolvedSocialLink[] {
  return SOCIAL_NETWORKS.map((network) => {
    const configured = social?.[network.key]?.trim();

    return {
      key: network.key,
      label: network.label,
      url: configured && configured.length > 0 ? configured : network.defaultUrl,
      isPlatformDefault: !configured,
    };
  });
}
