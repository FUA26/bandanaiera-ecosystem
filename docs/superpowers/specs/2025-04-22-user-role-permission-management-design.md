# User, Role, & Permission Management Feature Design

**Date:** 2025-04-22
**Status:** Draft
**Type:** Feature Merge from naiera-admin

---

## Overview

This document describes the design for merging and enhancing user, role, and permission management features from naiera-admin into bandanaiera. The goal is to create a complete RBAC management interface while maintaining bandanaiera's existing patterns and architecture.

---

## Current State Analysis

### bandanaiera (Existing)

- **Has:** Basic user list with pagination, search, bulk delete; user/role services; API routes
- **Missing:** User create/edit dialogs, roles UI page, permissions UI page, advanced features

### naiera-admin (Source)

- **Has:** Complete user/role/permission management with dialogs, stats, TanStack tables, cloning
- **Differences:** Different permission naming, Hugeicons vs Lucide, API protection pattern

---

## Architecture Decisions

### 1. Folder Structure

```
apps/support/
├── app/(backoffice)/manage/
│   ├── users/
│   │   ├── page.tsx          # Enhance existing (add dialogs)
│   │   └── layout.tsx        # New: breadcrumbs, metadata
│   ├── roles/
│   │   ├── page.tsx          # New: roles management
│   │   └── layout.tsx        # New: breadcrumbs, metadata
│   ├── permissions/
│   │   ├── page.tsx          # New: permissions management
│   │   └── layout.tsx        # New: breadcrumbs, metadata
│   └── layout.tsx            # New: manage section layout
├── features/backoffice/components/admin/
│   ├── user-list.tsx         # Existing: enhance with dialogs
│   ├── user-dialog.tsx       # New: create/edit user form
│   ├── role-dialog.tsx       # New: create/edit/clone role form
│   ├── role-delete-dialog.tsx # New: delete confirmation with warning
│   ├── permission-dialog.tsx # New: create/edit permission form
│   ├── roles-table.tsx       # New: roles data table
│   └── permissions-table.tsx # New: permissions data table
├── lib/services/
│   ├── user-service.ts       # Enhance: add getUserByEmail, bulk operations
│   ├── role-service.ts       # Enhance: add clone, stats
│   └── permission-service.ts # New: CRUD + stats
├── lib/validations/
│   ├── user.ts               # New: user form validation schemas
│   ├── role.ts               # New: role form validation schemas
│   └── permission.ts         # New: permission form validation schemas
└── app/api/
    ├── users/
    │   ├── route.ts          # Enhance: add PUT for update
    │   └── [id]/route.ts     # Enhance: add profile, password endpoints
    ├── roles/
    │   ├── route.ts          # Enhance: add stats, clone endpoint
    │   └── [id]/
    │       ├── route.ts      # Existing: enhance
    │       └── clone/route.ts # New: clone role
    └── permissions/
        └── route.ts          # New: CRUD + stats
```

### 2. Permission Naming Convention

Use **naiera-admin's pattern** (`ADMIN_*` prefix for consistency):

| Resource    | Read                       | Create                     | Update                     | Delete                     |
| ----------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
| Users       | `ADMIN_USERS_MANAGE`       | `ADMIN_USERS_MANAGE`       | `ADMIN_USERS_MANAGE`       | `ADMIN_USERS_MANAGE`       |
| Roles       | `ADMIN_ROLES_MANAGE`       | `ADMIN_ROLES_MANAGE`       | `ADMIN_ROLES_MANAGE`       | `ADMIN_ROLES_MANAGE`       |
| Permissions | `ADMIN_PERMISSIONS_MANAGE` | `ADMIN_PERMISSIONS_MANAGE` | `ADMIN_PERMISSIONS_MANAGE` | `ADMIN_PERMISSIONS_MANAGE` |

**Note:** naiera-admin uses coarse-grained permissions (one per resource) rather than CRUD-grained. We'll adopt this simpler approach.

### 3. Icon Library

Keep **lucide-react** (bandanaiera's existing choice) for consistency.

- Already installed and used throughout the app
- Familiar to the team, matches existing patterns

### 4. Table Implementation

**Use TanStack Table** from naiera-admin for advanced features:

- Better performance for large datasets
- Built-in sorting, filtering, pagination
- Virtual scrolling support
- Consistent with naiera-admin's proven patterns

Install: `@tanstack/react-table`

---

## Feature Specifications

### 1. User Management (`/manage/users`)

#### Components

**UserList** (Enhance existing)

- Add `UserDialog` for create/edit
- Add status indicator (active/inactive based on sessions)
- Keep existing pagination, search, bulk delete

**UserDialog** (New)

- Fields: name, email, password (create only), role select
- Validation: email format, password strength, required fields
- Modes: create, edit
- On success: refresh list, show toast

#### API Enhancements

`PUT /api/users/[id]` (New)

- Update user name, email, role
- Return updated user with role

`GET /api/users/[id]/profile` (New)

- Get user profile with permissions

`PUT /api/users/[id]/password` (New)

- Admin reset user password

#### Permissions Required

- All actions: `ADMIN_USERS_MANAGE`

---

### 2. Role Management (`/manage/roles`)

#### Components

**RolesPage** (New)

- Stats dashboard: total roles, in-use, unused
- Roles table with actions
- Create button

**RolesTable** (New)

- Columns: name, permissions (count), users (count), created date, actions
- Row actions: edit, clone, delete
- Delete shows warning if users assigned

**RoleDialog** (New)

- Fields: name, description (optional), permissions multi-select
- Validation: unique name, at least one permission
- Modes: create, edit, clone
- Clone mode: pre-fill with "Copy of [name]"

**RoleDeleteDialog** (New)

- Shows role name and user count
- Warning if role has users
- Cannot delete if users assigned

#### Service Methods

```typescript
roleService = {
  listRoles() // existing
  getRoleById(id) // existing
  createRole(data) // existing
  updateRole(id, data) // existing
  deleteRole(id) // existing

  // New:
  getRoleStats() // { total, withUsers, withoutUsers }
  cloneRole(id, newName) // create copy with same permissions
  getRoleWithUsers(id) // for delete confirmation
}
```

#### API Routes

`GET /api/roles`

- Add `?stats=true` query param for stats dashboard
- Return: `{ roles, stats }`

`POST /api/roles/[id]/clone` (New)

- Clone role with same permissions
- Return new role

#### Permissions Required

- All actions: `ADMIN_ROLES_MANAGE`

---

### 3. Permission Management (`/manage/permissions`)

#### Components

**PermissionsPage** (New)

- Stats dashboard: total, categories, unused, in-use
- Permissions table with category filter
- Create button

**PermissionsTable** (New)

- Columns: name, category, description, roles count, created date, actions
- Category filter dropdown
- Search by name/description
- Row actions: edit, delete

**PermissionDialog** (New)

- Fields: name, category, description
- Validation: unique name, valid category
- Categories: `users`, `roles`, `permissions`, `content`, `settings`, `system`
- Modes: create, edit

#### Service Methods

```typescript
permissionService = {
  listPermissions(options?: { includeUsage?: boolean })
  getPermissionById(id)
  createPermission(data)
  updatePermission(id, data)
  deletePermission(id)
  getPermissionStats() // { total, byCategory, unused }
  getCategories() // string[]
}
```

#### API Routes

`GET /api/permissions`

- Query params: `?includeUsage=true&stats=true`
- Return: `{ permissions, stats, categories }`

`POST /api/permissions` (New)

- Create permission

`PUT /api/permissions/[id]` (New)

- Update permission

`DELETE /api/permissions/[id]` (New)

- Delete permission (check if in use)

#### Permissions Required

- All actions: `ADMIN_PERMISSIONS_MANAGE`

---

## Data Models

### Validation Schemas

**User Schema:**

```typescript
{
  name: string.min(2).max(100)
  email: string.email()
  password: string.min(8).regex(passwordPattern) // required for create
  roleId: string.cuid()
}
```

**Role Schema:**

```typescript
{
  name: string.min(2).max(50).unique()
  description: string.max(500).optional()
  permissionIds: array(string.cuid()).min(1)
}
```

**Permission Schema:**

```typescript
{
  name: string.min(2).max(100).unique()
  category: enum([...categories])
  description: string.max(500).optional()
}
```

---

## UI/UX Patterns

### 1. Stats Dashboard Pattern

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-sm text-muted-foreground">Total Roles</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold">{stats.total}</p>
    <p className="text-xs text-muted-foreground">Available in system</p>
  </CardContent>
</Card>
```

### 2. Dialog Pattern

All dialogs follow the same pattern:

- Title describing action
- Form with validation
- Footer: Cancel (secondary), Submit (primary)
- Close on escape
- Success toast on completion

### 3. Table Actions Pattern

- Row-level actions via dropdown menu
- Bulk actions in toolbar
- Destructive actions show confirmation dialog

---

## Implementation Sequence

1. **Phase 1: User Dialogs**
   - Create `UserDialog` component
   - Add `user.ts` validation schema
   - Enhance `user-service.ts` if needed
   - Add PUT endpoint to `/api/users/[id]/route.ts`

2. **Phase 2: Role Management**
   - Create `role-service.ts` enhancements (stats, clone)
   - Create role validation schema
   - Create `RoleDialog`, `RoleDeleteDialog`, `RolesTable`
   - Create `/api/roles` enhancements
   - Create `/api/roles/[id]/clone` route
   - Create roles page and layout

3. **Phase 3: Permission Management**
   - Create `permission-service.ts`
   - Create permission validation schema
   - Create `PermissionDialog`, `PermissionsTable`
   - Create `/api/permissions` routes
   - Create permissions page and layout

4. **Phase 4: Polish**
   - Add loading skeletons
   - Add error handling
   - Update breadcrumbs configuration
   - Add to sidebar navigation

---

## Open Questions

1. Should we implement soft delete for users/roles/permissions?
2. Do we need audit logging for role/permission changes?
3. Should permissions be editable or fixed after creation?
4. Do we need role templates/presets?

---

## Dependencies

**External Packages to Install:**

```bash
pnpm add @tanstack/react-table
```

**Internal:**

- `@workspace/ui` components
- Existing `user-service`, `role-service`
- Prisma models (already have User, Role, Permission)

---

## Success Criteria

- [ ] Users can be created, edited, and deleted via UI
- [ ] Roles can be created, edited, cloned, and deleted
- [ ] Permissions can be created, edited, and deleted
- [ ] Stats dashboards show accurate counts
- [ ] All actions have appropriate permission checks
- [ ] Forms validate input and show helpful errors
- [ ] Tables have loading states and empty states
- [ ] Delete actions show warnings for items in use
