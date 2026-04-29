import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/features/settings/components/settings-client"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  if (!user) {
    redirect("/sign-in")
  }

  return <SettingsClient user={user} />
}
