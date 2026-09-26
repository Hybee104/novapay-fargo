import type { NextConfig } from "next";

/**
 * Content-Security-Policy
 *
 * A nonce-based policy is intentionally NOT used here: nonces force every page
 * to be dynamically rendered and disable static optimisation. The project ships
 * a static marketing page plus force-dynamic dashboards, so a nonce policy
 * would needlessly convert the whole app to SSR.
 *
 * This policy is therefore a static, allowlist-based CSP that keeps all content
 * same-origin while blocking the classic Safe Browsing / injection vectors:
 *   - object-src 'none'      no plugins, no <object>/<embed> payloads
 *   - base-uri 'self'        blocks <base> hijacking
 *   - form-action 'self'     credentials can only ever POST to this origin
 *   - frame-ancestors 'none' clickjacking protection
 *   - default-src 'self'     no third-party script/style/font/image origins
 *   - upgrade-insecure-requests  no mixed content
 *
 * 'unsafe-inline' is required for script-src/style-src because Next.js streams
 * inline bootstrap + RSC payload scripts. The origin allowlist is what prevents
 * third-party script injection; 'unsafe-inline' only permits inline execution.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is required by React in development for readable stack traces.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  // Live chat and all data fetching stay on this origin.
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Legacy clickjacking defence. DENY matches the CSP `frame-ancestors 'none'`
  // above, so old and modern browsers enforce the same rule.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
