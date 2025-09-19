import { getInitialDashboardData } from '@/lib/data/tests'
import DashboardClientPage from './dashboard-client-page'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton' // Assuming you have a Skeleton component

/**
 * This is the main server component for the dashboard.
 * It fetches data on the server and passes it to the client component.
 * This approach significantly improves performance by avoiding client-side data fetching waterfalls.
 */

const DashboardLoading = () => (
  <div className="p-4">
    <Skeleton className="h-12 w-1/2 mb-4" />
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
)

export default async function DashboardHome() {
  const { tests, stats, hasMore } = await getInitialDashboardData()

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClientPage
        initialTests={tests}
        initialStats={stats}
        initialHasMore={hasMore}
      />
    </Suspense>
  )
}
