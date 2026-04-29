export interface CodeExample {
  title: string
  description: string
  code: string
  learnMoreHref?: string
}

import { siteConfig } from "@/lib/site-config"

export const codeWalkthroughExamples: Record<string, CodeExample> = {
  "feature-structure": {
    title: "Feature-Based Architecture",
    description:
      "Every feature is self-contained: UI components live with the feature, server actions are co-located, and boundaries are clear. Teams can work on features in parallel without conflicts.",
    code: `features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── server-actions.ts
│   └── page.tsx
├── dashboard/
└── shared/`,
    learnMoreHref: siteConfig.nav.docs,
  },
  auth: {
    title: "Authentication Flow",
    description:
      "NextAuth.js v5 is configured with credentials provider. The auth config lives in the auth feature, making it easy to extend with additional providers.",
    code: `export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        // Your auth logic here
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
  },
}`,
    learnMoreHref: siteConfig.nav.docs,
  },
  "api-patterns": {
    title: "API Patterns",
    description:
      "Server actions provide type-safe mutations without separate API routes. Form validation happens on the server, keeping the client lean.",
    code: `"use server"

import { authSchema } from "./auth-validation"

export async function loginAction(formData: FormData) {
  const validatedFields = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  // Auth logic here
  return { success: true }
}`,
    learnMoreHref: siteConfig.nav.docs,
  },
  "type-safety": {
    title: "Type Safety",
    description:
      "TypeScript strict mode is enabled throughout. Shared types ensure contracts between server and client are enforced at compile time.",
    code: `// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Shared types used across features
export interface User {
  id: string
  email: string
  name: string
}`,
    learnMoreHref: siteConfig.nav.docs,
  },
}
