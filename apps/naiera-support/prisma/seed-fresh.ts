/**
 * Fresh Database Setup Script
 *
 * This script sets up a fresh database with:
 * - RBAC (permissions, roles, admin user)
 * - System settings
 * - Ticketing structure (app + channels) - NO dummy tickets
 * - NO dummy tasks
 *
 * Usage:
 *   pnpm --filter naiera-support db:seed:fresh
 *
 * Or directly:
 *   pnpm --filter naiera-support exec tsx prisma/seed-fresh.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function seedFreshDatabase() {
  console.log("🌱 Starting fresh database setup...\n")

  try {
    // ============================================
    // 1. SEED PERMISSIONS
    // ============================================
    console.log("📋 Step 1/5: Seeding permissions...")

    const permissions = [
      // User Management
      {
        name: "USER_READ_OWN",
        category: "USER",
        description: "Read own user profile",
      },
      {
        name: "USER_READ_ANY",
        category: "USER",
        description: "Read any user profile",
      },
      {
        name: "USER_UPDATE_OWN",
        category: "USER",
        description: "Update own user profile",
      },
      {
        name: "USER_UPDATE_ANY",
        category: "USER",
        description: "Update any user profile",
      },
      {
        name: "USER_DELETE_OWN",
        category: "USER",
        description: "Delete own account",
      },
      {
        name: "USER_DELETE_ANY",
        category: "USER",
        description: "Delete any user account",
      },
      {
        name: "USER_CREATE",
        category: "USER",
        description: "Create new user accounts",
      },

      // Content Management
      {
        name: "CONTENT_READ_OWN",
        category: "CONTENT",
        description: "Read own content",
      },
      {
        name: "CONTENT_READ_ANY",
        category: "CONTENT",
        description: "Read any content",
      },
      {
        name: "CONTENT_CREATE",
        category: "CONTENT",
        description: "Create content",
      },
      {
        name: "CONTENT_UPDATE_OWN",
        category: "CONTENT",
        description: "Update own content",
      },
      {
        name: "CONTENT_UPDATE_ANY",
        category: "CONTENT",
        description: "Update any content",
      },
      {
        name: "CONTENT_DELETE_OWN",
        category: "CONTENT",
        description: "Delete own content",
      },
      {
        name: "CONTENT_DELETE_ANY",
        category: "CONTENT",
        description: "Delete any content",
      },
      {
        name: "CONTENT_PUBLISH",
        category: "CONTENT",
        description: "Publish content",
      },

      // File Management
      {
        name: "FILE_UPLOAD_OWN",
        category: "FILE",
        description: "Upload files for own account",
      },
      {
        name: "FILE_UPLOAD_ANY",
        category: "FILE",
        description: "Upload files for any account",
      },
      {
        name: "FILE_READ_OWN",
        category: "FILE",
        description: "Read own files",
      },
      {
        name: "FILE_READ_ANY",
        category: "FILE",
        description: "Read any files",
      },
      {
        name: "FILE_DELETE_OWN",
        category: "FILE",
        description: "Delete own files",
      },
      {
        name: "FILE_DELETE_ANY",
        category: "FILE",
        description: "Delete any files",
      },
      {
        name: "FILE_MANAGE_ORPHANS",
        category: "FILE",
        description: "Manage orphaned files",
      },
      {
        name: "FILE_ADMIN",
        category: "FILE",
        description: "Full file administration access",
      },

      // Settings
      {
        name: "SETTINGS_READ",
        category: "SETTINGS",
        description: "Read system settings",
      },
      {
        name: "SETTINGS_UPDATE",
        category: "SETTINGS",
        description: "Update system settings",
      },

      // Analytics
      {
        name: "ANALYTICS_VIEW",
        category: "ANALYTICS",
        description: "View analytics",
      },
      {
        name: "ANALYTICS_EXPORT",
        category: "ANALYTICS",
        description: "Export analytics data",
      },

      // Admin
      {
        name: "ADMIN_PANEL_ACCESS",
        category: "ADMIN",
        description: "Access admin panel",
      },
      {
        name: "ADMIN_USERS_MANAGE",
        category: "ADMIN",
        description: "Manage users in admin panel",
      },
      {
        name: "ADMIN_ROLES_MANAGE",
        category: "ADMIN",
        description: "Manage roles in admin panel",
      },
      {
        name: "ADMIN_PERMISSIONS_MANAGE",
        category: "ADMIN",
        description: "Manage permissions in admin panel",
      },
      {
        name: "ADMIN_SYSTEM_SETTINGS_MANAGE",
        category: "ADMIN",
        description: "Manage system settings",
      },

      // Services
      {
        name: "SERVICES_VIEW",
        category: "SERVICES",
        description: "View services",
      },
      {
        name: "SERVICES_CREATE",
        category: "SERVICES",
        description: "Create services",
      },
      {
        name: "SERVICES_EDIT",
        category: "SERVICES",
        description: "Edit services",
      },
      {
        name: "SERVICES_PUBLISH",
        category: "SERVICES",
        description: "Publish services",
      },
      {
        name: "SERVICES_DELETE",
        category: "SERVICES",
        description: "Delete services",
      },
      {
        name: "SERVICES_REORDER",
        category: "SERVICES",
        description: "Reorder services",
      },
      {
        name: "CATEGORIES_MANAGE",
        category: "SERVICES",
        description: "Manage service categories",
      },

      // News
      { name: "NEWS_VIEW", category: "NEWS", description: "View news" },
      { name: "NEWS_CREATE", category: "NEWS", description: "Create news" },
      { name: "NEWS_EDIT", category: "NEWS", description: "Edit news" },
      { name: "NEWS_PUBLISH", category: "NEWS", description: "Publish news" },
      { name: "NEWS_DELETE", category: "NEWS", description: "Delete news" },
      { name: "NEWS_REORDER", category: "NEWS", description: "Reorder news" },
      {
        name: "NEWS_CATEGORIES_MANAGE",
        category: "NEWS",
        description: "Manage news categories",
      },

      // Events
      { name: "EVENTS_VIEW", category: "EVENTS", description: "View events" },
      {
        name: "EVENTS_CREATE",
        category: "EVENTS",
        description: "Create events",
      },
      { name: "EVENTS_EDIT", category: "EVENTS", description: "Edit events" },
      {
        name: "EVENTS_DELETE",
        category: "EVENTS",
        description: "Delete events",
      },
      {
        name: "EVENTS_REORDER",
        category: "EVENTS",
        description: "Reorder events",
      },
      {
        name: "EVENT_CATEGORIES_MANAGE",
        category: "EVENTS",
        description: "Manage event categories",
      },

      // Ticket Management
      {
        name: "TICKET_VIEW_OWN",
        category: "TICKET",
        description: "View own assigned tickets",
      },
      {
        name: "TICKET_VIEW_ALL",
        category: "TICKET",
        description: "View all tickets",
      },
      {
        name: "TICKET_CREATE",
        category: "TICKET",
        description: "Create new tickets",
      },
      {
        name: "TICKET_UPDATE_OWN",
        category: "TICKET",
        description: "Update own assigned tickets",
      },
      {
        name: "TICKET_UPDATE_ALL",
        category: "TICKET",
        description: "Update any ticket",
      },
      {
        name: "TICKET_DELETE",
        category: "TICKET",
        description: "Delete tickets",
      },
      {
        name: "TICKET_ASSIGN",
        category: "TICKET",
        description: "Assign tickets to agents",
      },
      {
        name: "TICKET_CLOSE",
        category: "TICKET",
        description: "Close tickets",
      },
      {
        name: "TICKET_REOPEN",
        category: "TICKET",
        description: "Reopen closed tickets",
      },
      {
        name: "TICKET_MESSAGE_VIEW",
        category: "TICKET",
        description: "View ticket messages",
      },
      {
        name: "TICKET_MESSAGE_SEND",
        category: "TICKET",
        description: "Send messages to tickets",
      },
      {
        name: "TICKET_MESSAGE_INTERNAL",
        category: "TICKET",
        description: "Add internal notes",
      },
      {
        name: "TICKET_APP_VIEW",
        category: "TICKET",
        description: "View apps and channels",
      },
      {
        name: "TICKET_APP_MANAGE",
        category: "TICKET",
        description: "Create and manage apps/channels",
      },
      {
        name: "TICKET_APP_ASSIGN",
        category: "TICKETING",
        description: "Assign/remove apps to users",
      },
      {
        name: "TICKET_APP_REQUEST",
        category: "TICKETING",
        description: "Request access to apps",
      },
      {
        name: "TICKET_APP_APPROVE",
        category: "TICKETING",
        description: "Approve or reject app access requests",
      },
      {
        name: "TICKET_REPORT_VIEW",
        category: "TICKET",
        description: "View ticket reports/analytics",
      },
      {
        name: "TICKET_EXPORT",
        category: "TICKET",
        description: "Export ticket data",
      },
    ]

    let createdPermissions = 0
    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: { category: perm.category, description: perm.description },
        create: perm,
      })
      createdPermissions++
    }
    console.log(`   ✅ Created ${createdPermissions} permissions\n`)

    // ============================================
    // 2. SEED ROLES
    // ============================================
    console.log("👥 Step 2/5: Seeding roles...")

    const roles = [
      {
        name: "VIEWER",
        description: "Read-only access to own data",
        permissionNames: ["USER_READ_OWN", "CONTENT_READ_OWN", "SETTINGS_READ"],
      },
      {
        name: "USER",
        description: "Default role for regular users",
        permissionNames: [
          "USER_READ_OWN",
          "USER_UPDATE_OWN",
          "USER_DELETE_OWN",
          "CONTENT_READ_OWN",
          "CONTENT_CREATE",
          "CONTENT_UPDATE_OWN",
          "CONTENT_DELETE_OWN",
          "FILE_UPLOAD_OWN",
          "FILE_READ_OWN",
          "FILE_DELETE_OWN",
          "SETTINGS_READ",
        ],
      },
      {
        name: "EDITOR",
        description: "Can manage content and access analytics",
        permissionNames: [
          "USER_READ_OWN",
          "USER_UPDATE_OWN",
          "CONTENT_READ_ANY",
          "CONTENT_CREATE",
          "CONTENT_UPDATE_ANY",
          "CONTENT_DELETE_OWN",
          "CONTENT_PUBLISH",
          "SETTINGS_READ",
          "ANALYTICS_VIEW",
        ],
      },
      {
        name: "OPERATOR",
        description: "Support operator - tickets and tasks access only",
        permissionNames: [
          "USER_READ_OWN",
          "USER_UPDATE_OWN",
          "TICKET_VIEW_ALL",
          "TICKET_CREATE",
          "TICKET_UPDATE_ALL",
          "TICKET_ASSIGN",
          "TICKET_CLOSE",
          "TICKET_REOPEN",
          "TICKET_MESSAGE_VIEW",
          "TICKET_MESSAGE_SEND",
          "TICKET_MESSAGE_INTERNAL",
          "TICKET_REPORT_VIEW",
          "SETTINGS_READ",
        ],
      },
      {
        name: "ADMIN",
        description: "Full system access",
        permissionNames: permissions.map((p) => p.name), // All permissions
      },
    ]

    const createdRoles: string[] = []
    for (const roleData of roles) {
      // Get permission IDs
      const perms = await prisma.permission.findMany({
        where: { name: { in: roleData.permissionNames } },
        select: { id: true },
      })

      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {
          permissions: {
            deleteMany: {},
            create: perms.map((p) => ({ permissionId: p.id })),
          },
        },
        create: {
          name: roleData.name,
          permissions: {
            create: perms.map((p) => ({ permissionId: p.id })),
          },
        },
      })
      createdRoles.push(role.name)
    }
    console.log(`   ✅ Created roles: ${createdRoles.join(", ")}\n`)

    // ============================================
    // 3. SEED SYSTEM SETTINGS
    // ============================================
    console.log("⚙️  Step 3/5: Seeding system settings...")

    const userRole = await prisma.role.findUnique({ where: { name: "USER" } })

    const systemSettings = await prisma.systemSettings.upsert({
      where: { id: "default" }, // Use a predictable ID
      create: {
        id: "default",
        allowRegistration: true,
        requireEmailVerification: true,
        defaultUserRoleId: userRole!.id,
        emailVerificationExpiryHours: 24,
        siteName: "Bandanaiera Admin",
        siteDescription: "Platform Manajemen Konten Modern",
        siteSubtitle: "Platform Manajemen Konten Modern",
        citizenName: "Warga",
        versionNumber: "1.0.0",
        copyrightText: `© ${new Date().getFullYear()} Bandanaiera Admin. All rights reserved.`,
        minPasswordLength: 8,
        requireStrongPassword: false,
      },
      update: {},
    })
    console.log(`   ✅ System settings configured\n`)

    // ============================================
    // 4. SEED ADMIN USER
    // ============================================
    console.log("👤 Step 4/5: Seeding admin user...")

    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } })
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: { password: hashedPassword },
      create: {
        id: "admin-user-123",
        email: "admin@example.com",
        name: "Super Admin",
        password: hashedPassword,
        roleId: adminRole!.id,
        emailVerified: new Date(),
      },
    })
    console.log(`   ✅ Admin user created/updated:`)
    console.log(`      Email: ${admin.email}`)
    console.log(`      Password: admin123\n`)

    // ============================================
    // 5. SEED TICKETING STRUCTURE (no dummy data)
    // ============================================
    console.log("🎫 Step 5/5: Seeding ticketing structure (no dummy data)...")

    // Create default Support app
    const supportApp = await prisma.app.upsert({
      where: { slug: "support" },
      update: {},
      create: {
        name: "Support",
        slug: "support",
        description: "General support tickets",
        isActive: true,
      },
    })

    // Check existing channels
    const existingChannels = await prisma.channel.findMany({
      where: { appId: supportApp.id },
    })

    // Create channels if they don't exist
    const channelConfigs = [
      {
        type: "WEB_FORM" as const,
        name: "Website Form",
        slug: "website-form",
        config: { welcomeMessage: "How can we help you today?" },
        isActive: true,
      },
      {
        type: "INTEGRATED_APP" as const,
        name: "In-App Support",
        slug: "inapp-support",
        config: {},
        isActive: true,
      },
    ]

    let createdChannels = 0
    for (const config of channelConfigs) {
      const exists = existingChannels.some(
        (c) => c.type === config.type && c.name === config.name
      )

      if (!exists) {
        const apiKey =
          config.type === "INTEGRATED_APP"
            ? Array.from(
                { length: 64 },
                () => Math.random().toString(36)[2]
              ).join("")
            : undefined

        await prisma.channel.create({
          data: {
            ...config,
            appId: supportApp.id,
            apiKey,
          },
        })
        createdChannels++
        if (apiKey) {
          console.log(
            `   ✅ Created channel: ${config.name} (API Key: ${apiKey.slice(0, 16)}...)`
          )
        } else {
          console.log(`   ✅ Created channel: ${config.name}`)
        }
      }
    }

    if (createdChannels === 0) {
      console.log(`   ℹ️  Channels already exist, skipping creation\n`)
    } else {
      console.log(`   ✅ Created ${createdChannels} channels\n`)
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎉 Fresh database setup completed successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    console.log("📝 Summary:")
    console.log(`   • Permissions: ${createdPermissions}`)
    console.log(`   • Roles: ${createdRoles.length}`)
    console.log(`   • Admin User: admin@example.com (password: admin123)`)
    console.log(`   • Ticketing App: ${supportApp.name} (${supportApp.slug})`)
    console.log(`   • Channels: ${existingChannels.length + createdChannels}`)
    console.log("\n⚠️  NO dummy tickets or tasks created.")
    console.log("   Database is ready for production use!\n")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedFreshDatabase()
