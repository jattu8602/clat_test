import { getInitialDashboardData } from '@/lib/data/tests'
import DashboardClientPage from './dashboard-client-page'

/**
 * This is the main server component for the dashboard.
 * It fetches data on the server and passes it to the client component.
 * Loading is now handled automatically by the `loading.jsx` file in this directory.
 */
export default async function DashboardHome() {
  const { tests, stats, hasMore } = await getInitialDashboardData()

  return (
    <DashboardClientPage
      initialTests={tests}
      initialStats={stats}
      initialHasMore={hasMore}
    />
  )
}
