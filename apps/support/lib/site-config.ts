/**
 * Centralized site configuration
 * Edit these values to update links across the entire application
 */

export const siteConfig = {
  // Project URLs
  github: {
    url: "https://github.com/yourorg/zilpo",
    repository: "yourorg/zilpo",
  },
  twitter: {
    url: "https://twitter.com/zilpo",
    handle: "@zilpo",
  },
  docs: {
    url: "/docs",
  },
  // Project metadata
  name: "zilpo",
  description:
    "Skip the boilerplate. Ship features faster with production-ready patterns.",
  // Navigation
  nav: {
    features: "#features",
    docs: "#docs",
    changelog: "#changelog",
    guides: "#guides",
    examples: "#examples",
    support: "#support",
  },
  // Auth routes
  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
} as const

export type SiteConfig = typeof siteConfig
