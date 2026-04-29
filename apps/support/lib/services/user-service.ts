import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { getDefaultRole } from "@/lib/rbac/roles"
import { invalidatePermissionCache } from "@/lib/rbac/permissions"
import { verifyPassword } from "@/lib/auth/password"

export interface CreateUserInput {
  email: string
  name?: string
  password: string
  roleId?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  roleId?: string
}

export interface UpdateProfileInput {
  name: string
  email: string
  image?: string | null
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ListUsersOptions {
  page?: number
  pageSize?: number
  search?: string
}

export interface ListUsersResult {
  users: Array<{
    id: string
    name: string | null
    email: string
    image: string | null
    roleId: string
    createdAt: Date
    updatedAt: Date
    role: {
      id: string
      name: string
    } | null
  }>
  total: number
  page: number
  pageSize: number
  totalPages: number
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export const userService = {
  async listUsers({
    page = 1,
    pageSize = 10,
    search,
  }: ListUsersOptions = {}): Promise<ListUsersResult> {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { role: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      pagination: {
        page,
        pageSize,
        totalCount: total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } } },
    })
  },

  async createUser(data: CreateUserInput) {
    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Validate password
    const { validatePassword } = await import("@/lib/auth/password")
    const validation = validatePassword(data.password)
    if (!validation.valid) {
      throw new Error(validation.errors.join(", "))
    }

    const defaultRole = data.roleId
      ? await prisma.role.findUnique({ where: { id: data.roleId } })
      : await getDefaultRole()

    if (!defaultRole) {
      throw new Error("Default role not found")
    }

    const hashedPassword = await hashPassword(data.password)

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      include: { role: true },
    })
  },

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        roleId: data.roleId,
      },
      include: { role: true },
    })

    // Invalidate permission cache if role changed
    if (data.roleId) {
      await invalidatePermissionCache(id)
    }

    return user
  },

  async getCurrentUserProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  },

  async updateCurrentUserProfile(userId: string, data: UpdateProfileInput) {
    const normalizedName = data.name.trim()

    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id: userId },
      },
      select: { id: true },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: normalizedName.length > 0 ? normalizedName : null,
        email: data.email,
        image: data.image ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  },

  async changeCurrentUserPassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (!user.password) {
      throw new Error("This account does not have a password set")
    }

    const isValid = await verifyPassword(data.currentPassword, user.password)

    if (!isValid) {
      throw new Error("Current password is incorrect")
    }

    const { validatePassword } = await import("@/lib/auth/password")
    const validation = validatePassword(data.newPassword)

    if (!validation.valid) {
      throw new Error(validation.errors.join(", "))
    }

    const hashedPassword = await hashPassword(data.newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  },

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    })
  },

  async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    return (
      user?.role.permissions
        .map((p) => p.permission?.name)
        .filter((name): name is string => Boolean(name)) ?? []
    )
  },
}
