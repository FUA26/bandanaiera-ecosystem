import { prisma } from "@/lib/prisma"
import { invalidatePermissionCache } from "@/lib/rbac/permissions"

export interface CreateRoleInput {
  name: string
  permissions: string[]
}

export class InvalidRolePermissionsError extends Error {
  missingPermissions: string[]

  constructor(missingPermissions: string[]) {
    super(
      `Unknown permission(s): ${missingPermissions.join(", ")}. Make sure the permissions exist before assigning them to a role.`
    )
    this.name = "InvalidRolePermissionsError"
    this.missingPermissions = missingPermissions
  }
}

export interface RoleRecord {
  id: string
  name: string
  _count: {
    users: number
  }
  permissions: string[]
}

function normalizeRole(role: {
  id: string
  name: string
  _count?: { users: number }
  permissions?: Array<{
    permission?: { name: string | null } | null
  }>
}): RoleRecord {
  return {
    id: role.id,
    name: role.name,
    _count: {
      users: role._count?.users ?? 0,
    },
    permissions:
      role.permissions
        ?.map((rp) => rp.permission?.name)
        .filter((name): name is string => !!name) ?? [],
  }
}

async function ensurePermissionsExist(permissionNames: string[]) {
  const uniqueNames = [...new Set(permissionNames)]
  const existingPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: uniqueNames,
      },
    },
    select: {
      name: true,
    },
  })

  const existingNames = new Set(
    existingPermissions.map((permission) => permission.name)
  )
  const missingPermissions = uniqueNames.filter(
    (permissionName) => !existingNames.has(permissionName)
  )

  if (missingPermissions.length > 0) {
    throw new InvalidRolePermissionsError(missingPermissions)
  }
}

export const roleService = {
  async listRoles() {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return roles.map(normalizeRole)
  },

  async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return role ? normalizeRole(role) : null
  },

  async createRole(data: CreateRoleInput) {
    await ensurePermissionsExist(data.permissions)

    const role = await prisma.role.create({
      data: {
        name: data.name,
        permissions: {
          create: data.permissions.map((permissionName) => ({
            permission: {
              connect: { name: permissionName },
            },
          })),
        },
      },
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return normalizeRole(role)
  },

  async updateRole(id: string, data: CreateRoleInput) {
    // Update role name and permissions
    await ensurePermissionsExist(data.permissions)

    const role = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        permissions: {
          deleteMany: {},
          create: data.permissions.map((permissionName) => ({
            permission: {
              connect: { name: permissionName },
            },
          })),
        },
      },
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    // Invalidate permission caches for all users with this role
    const users = await prisma.user.findMany({
      where: { roleId: id },
      select: { id: true },
    })

    for (const user of users) {
      await invalidatePermissionCache(user.id)
    }

    return normalizeRole(role)
  },

  async deleteRole(id: string) {
    // Check if role is being used
    const userCount = await prisma.user.count({ where: { roleId: id } })
    if (userCount > 0) {
      throw new Error("Cannot delete role that is assigned to users")
    }

    return prisma.role.delete({
      where: { id },
    })
  },

  async getRoleStats() {
    const [total, rolesWithUsers] = await Promise.all([
      prisma.role.count(),
      prisma.role.findMany({
        where: {
          users: {
            some: {},
          },
        },
        select: { id: true },
      }),
    ])

    return {
      total,
      withUsers: rolesWithUsers.length,
      withoutUsers: total - rolesWithUsers.length,
    }
  },

  async cloneRole(sourceRoleId: string, newName: string) {
    // Check if source role exists
    const sourceRole = await prisma.role.findUnique({
      where: { id: sourceRoleId },
      include: {
        permissions: {
          select: {
            permissionId: true,
          },
        },
      },
    })

    if (!sourceRole) {
      throw new Error("Source role not found")
    }

    // Check if new name already exists
    const nameConflict = await prisma.role.findUnique({
      where: { name: newName },
    })

    if (nameConflict) {
      throw new Error("Role with this name already exists")
    }

    // Create cloned role with same permissions
    const role = await prisma.role.create({
      data: {
        name: newName,
        permissions: {
          create: sourceRole.permissions.map((rp) => ({
            permission: {
              connect: { id: rp.permissionId },
            },
          })),
        },
      },
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return normalizeRole(role)
  },

  async getRoleWithUserCount(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return role ? normalizeRole(role) : null
  },
}
