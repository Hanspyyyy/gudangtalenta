import { SearchClient } from '@/components/search/search-client'
import { requireProfile } from '@/lib/auth'
import { isAdminRole } from '@/lib/types'

export default async function CariPage() {
  const profile = await requireProfile()
  return <SearchClient isAdmin={isAdminRole(profile.role)} />
}
