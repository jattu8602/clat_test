import AdminTestSeriesClientPage from './test-series-client-page'

export const metadata = {
  title: 'Manage Test Series | Admin',
  description: 'Create, edit, and manage test series for your users.',
}

export default function AdminTestSeriesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        Manage Test Series
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Create, edit, and manage test series for your users.
      </p>
      <AdminTestSeriesClientPage />
    </div>
  )
}
