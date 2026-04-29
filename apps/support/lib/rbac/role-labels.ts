const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  USER: "User",
}

export function formatRoleLabel(roleName?: string | null) {
  if (!roleName) return "User"

  return (
    ROLE_LABELS[roleName] ??
    roleName
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  )
}
