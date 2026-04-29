/**
 * Deprecated compatibility shim.
 *
 * The actual auth implementation lives in `@/lib/auth/password` and
 * `@/lib/auth/config`. Keep this module only to avoid breaking older imports.
 */
export { hashPassword, verifyPassword } from "@/lib/auth/password"
