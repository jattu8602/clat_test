import { getInitialPaidTests } from '@/lib/data/tests'
import PaidTestClientPage from './paid-test-client-page'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const PaidTestsLoading = () => (
  <div className="p-4">
    <Skeleton className="h-12 w-1/3 mb-4" />
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

export default async function PaidTestsPage() {
  const { tests, hasMore } = await getInitialPaidTests()

  return (
    <Suspense fallback={<PaidTestsLoading />}>
      <PaidTestClientPage initialTests={tests} initialHasMore={hasMore} />
    </Suspense>
  )
}
