/* global process */
import prismaClientPkg from "@prisma/client"
import bcryptPkg from "bcryptjs"

const { PrismaClient } = prismaClientPkg
const bcrypt = bcryptPkg

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
  console.log("Seeding database...")

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

  const adminPermissions = await prisma.permission.findMany()
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      permissions: {
        connect: adminPermissions.map((p) => ({ id: p.id })),
      },
    },
    include: { permissions: true },
  })

  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        set: [],
        connect: adminPermissions.map((p) => ({ id: p.id })),
      },
    },
  })

  console.log("Admin role created/updated")

  const dashboardPermission = await prisma.permission.findUnique({
    where: { name: "DASHBOARD_ACCESS" },
  })

  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      permissions: dashboardPermission
        ? {
            connect: { id: dashboardPermission.id },
          }
        : undefined,
    },
  })

  console.log("User role created/updated")

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
