import { getInitialPaidTests } from '@/lib/data/tests'
import PaidTestClientPage from './paid-test-client-page'

/**
 * Server component for the paid tests page.
 * Loading is now handled automatically by the `loading.jsx` file in this directory.
 */
export default async function PaidTestsPage() {
  const { tests, hasMore } = await getInitialPaidTests()

  return <PaidTestClientPage initialTests={tests} initialHasMore={hasMore} />
}
