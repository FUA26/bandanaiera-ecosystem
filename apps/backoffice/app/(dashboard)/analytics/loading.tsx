export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Analytics Dashboard</h1>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
