import type { MetadataRoute } from "next";

/**
 * sitemap.xml
 *
 * Lists ONLY the genuinely public, indexable pages of the demonstration:
 *
 *   /       marketing landing page
 *   /login  sign-in page
 *
 * Deliberately excluded:
 *   - `/api/*`      JSON endpoints, not HTML documents
 *   - `/admin*`     staff-only surface
 *   - `/novapay/*`  authenticated NovaPAY dashboard (307s to /login)
 *   - `/fargo/*`    authenticated Fargo dashboard  (307s to /login)
 *
 * Nothing here should ever list an authenticated route: including one would
 * advertise a session-gated path to crawlers and produce redirect-only entries.
 */

const siteUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
