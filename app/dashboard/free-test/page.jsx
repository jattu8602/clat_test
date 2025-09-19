import { getInitialFreeTests } from '@/lib/data/tests'
import FreeTestClientPage from './free-test-client-page'

/**
 * Server component for the free tests page.
 * Loading is now handled automatically by the `loading.jsx` file in this directory.
 */
export default async function FreeTestsPage() {
  const { tests, hasMore } = await getInitialFreeTests()

  return <FreeTestClientPage initialTests={tests} initialHasMore={hasMore} />
}
