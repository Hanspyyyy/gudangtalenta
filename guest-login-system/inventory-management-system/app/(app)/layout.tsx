import { requireProfile } from '@/lib/auth'
import { isAdminRole } from '@/lib/types'
import { BottomNav } from '@/components/bottom-nav'
import { AdminFab } from '@/components/admin-fab'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireProfile()
  const admin = isAdminRole(profile.role)

  return (
    <div className="mx-auto min-h-svh w-full max-w-2xl bg-background">
      <div className="bottom-nav-offset">{children}</div>
      {admin && <AdminFab />}
      <BottomNav />
    </div>
  )
}
