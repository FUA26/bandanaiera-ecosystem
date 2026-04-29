import { readFileSync } from "node:fs"
import { URL } from "node:url"

// Load .env file manually
const envPath = new URL("../.env", import.meta.url)
try {
  const envFile = readFileSync(envPath, "utf8")
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const equalsIndex = trimmed.indexOf("=")
    if (equalsIndex === -1) continue
    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
} catch {
  // Ignore missing env file
}

// Now import PrismaClient and bcrypt
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Create a new client (Prisma 6 compatible)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  console.log("Seeding database...")

  // Create permissions
  const allPermissions = [
    { name: "USER_READ", category: "USER" },
    { name: "USER_CREATE", category: "USER" },
    { name: "USER_UPDATE", category: "USER" },
    { name: "USER_DELETE", category: "USER" },
    { name: "ROLE_READ", category: "ROLE" },
    { name: "ROLE_CREATE", category: "ROLE" },
    { name: "ROLE_UPDATE", category: "ROLE" },
    { name: "ROLE_DELETE", category: "ROLE" },
    { name: "PERMISSION_READ", category: "PERMISSION" },
    { name: "PERMISSION_ASSIGN", category: "PERMISSION" },
    { name: "FILE_UPLOAD", category: "FILE" },
    { name: "FILE_READ", category: "FILE" },
    { name: "FILE_DELETE", category: "FILE" },
    { name: "DASHBOARD_ACCESS", category: "DASHBOARD" },
  ]

  for (const permission of allPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    })
  }

  console.log("Permissions created/updated")

  // Create or update admin role
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
    },
  })

  // Connect all permissions to admin role via junction table
  const dbPermissions = await prisma.permission.findMany()

  // Delete existing RolePermission entries for this role
  await prisma.rolePermission.deleteMany({
    where: { roleId: adminRole.id },
  })

  // Create new RolePermission entries
  await prisma.rolePermission.createMany({
    data: dbPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  })

  console.log("Admin role created/updated")

  // Create or update user role
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
    },
  })

  // Connect DASHBOARD_ACCESS permission to USER role
  const dashboardPermission = await prisma.permission.findUnique({
    where: { name: "DASHBOARD_ACCESS" },
  })

  if (dashboardPermission) {
    await prisma.rolePermission.deleteMany({
      where: { roleId: userRole.id },
    })

    await prisma.rolePermission.create({
      data: {
        roleId: userRole.id,
        permissionId: dashboardPermission.id,
      },
    })
  }

  console.log("User role created/updated")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@pisky.dev" },
    update: {},
    create: {
      email: "admin@pisky.dev",
      name: "Admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  })

  console.log("Seed completed!")
  console.log("Admin user: admin@pisky.dev / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
