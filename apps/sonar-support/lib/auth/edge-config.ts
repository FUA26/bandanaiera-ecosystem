/**
 * Edge-safe NextAuth configuration.
 *
 * This file intentionally excludes Node-only dependencies like Prisma and bcrypt.
 * It is used by middleware so the Edge runtime only loads JWT/session logic.
 */

import type { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"

const config: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roleId = user.roleId
        token.role = user.role
        if (user.role) {
          token.permissions = user.role.permissions.map(
            (rp) => rp.permission.name
          )
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        session.user.roleId = token.roleId as string
      }
      if (token.role) {
        session.user.role = token.role as {
          id: string
          name: string
          permissions: Array<{
            permission: {
              name: string
            }
          }>
        }
      }
      if (token.permissions) {
        session.user.permissions = token.permissions as string[]
      }
      return session
    },
  },
}

export const { auth } = NextAuth(config)
