import NextAuth, { type NextAuthConfig, type NextAuthResult } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "./password"
import type { Permission } from "@workspace/types"

const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        const permissions = user.role.permissions
          .map((rp) => rp.permission?.name as Permission)
          .filter((p): p is Permission => p !== undefined)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: {
            id: user.role.id,
            name: user.role.name,
            permissions,
          },
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const authUser = user as typeof user & {
          role: {
            id: string
            name: string
            permissions: Permission[]
          }
        }

        token.role = authUser.role
        token.id = authUser.id
        token.name = authUser.name
        token.email = authUser.email
        token.picture = authUser.image
      }

      if (trigger === "update" && session) {
        const updatedUser =
          (
            session as {
              user?: {
                name?: string | null
                email?: string | null
                image?: string | null
              }
            }
          )?.user ??
          (session as {
            name?: string | null
            email?: string | null
            image?: string | null
          })

        token.name = updatedUser?.name ?? token.name
        token.email = updatedUser?.email ?? token.email
        token.picture = updatedUser?.image ?? token.picture
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email
        session.user.image = token.picture ?? session.user.image
        session.user.role = (
          token as {
            role?: {
              id: string
              name: string
              permissions: Permission[]
            }
          }
        ).role as {
          id: string
          name: string
          permissions: Permission[]
        }
        session.user.permissions = ((
          token as { role?: { permissions?: Permission[] } }
        ).role?.permissions ?? []) as Permission[]
      }
      return session
    },
  },
} satisfies NextAuthConfig

const authResult: NextAuthResult = NextAuth(authConfig)

export const handlers: NextAuthResult["handlers"] = authResult.handlers
export const signIn: NextAuthResult["signIn"] = authResult.signIn
export const signOut: NextAuthResult["signOut"] = authResult.signOut
export const auth: NextAuthResult["auth"] = authResult.auth
