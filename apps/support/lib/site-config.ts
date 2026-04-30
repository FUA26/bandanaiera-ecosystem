/**
 * Centralized site configuration
 * Edit these values to update links across the entire application
 */

export const siteConfig = {
  // Project URLs
  github: {
    url: "https://github.com/yourorg/bandanaiera",
    repository: "yourorg/bandanaiera",
  },
  twitter: {
    url: "https://twitter.com/bandanaiera",
    handle: "@bandanaiera",
  },
  docs: {
    url: "/docs",
  },
  // Project metadata
  name: "bandanaiera",
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
