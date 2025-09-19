import { Skeleton } from '@/components/ui/skeleton'

/**
 * DashboardLoading Skeleton
 * Matches the CLAT test dashboard layout for smooth page transitions.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome Section */}
        <div className="flex items-start sm:items-center gap-3">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-6 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        </div>

        {/* Subject Tabs */}
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-md" />
          ))}
        </div>

        {/* Test List Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          {/* Table Header (desktop only) */}
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-4 py-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-1/3 rounded" />
            ))}
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-6 w-1/4 flex-1" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
