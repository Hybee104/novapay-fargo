import type { MetadataRoute } from "next";

/**
 * robots.txt
 *
 * The public surface of this project is only the marketing landing page and the
 * sign-in page. Everything else is either an authenticated dashboard or a JSON
 * API, so crawlers are asked to stay out of those areas to avoid indexing
 * session-gated screens or wasting crawl budget on redirects.
 *
 * NOTE: robots.txt is a crawler *courtesy* directive, not an access control.
 * Authentication in `src/lib/auth.ts` remains the actual security boundary.
 */

const siteUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/api/",
        "/admin",
        "/admin/",
        "/novapay/",
        "/fargo/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
