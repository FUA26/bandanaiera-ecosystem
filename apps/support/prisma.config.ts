import { readFileSync } from "node:fs"
import { defineConfig } from "prisma/config"

function loadEnvFile() {
  try {
    const envFile = readFileSync(new URL("./.env", import.meta.url), "utf8")

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }

      const equalsIndex = trimmed.indexOf("=")
      if (equalsIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, equalsIndex).trim()
      let value = trimmed.slice(equalsIndex + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  } catch {
    // Ignore missing local env file.
  }
}

loadEnvFile()

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
})
