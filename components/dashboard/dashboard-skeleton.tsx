export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-40 bg-muted rounded-lg" />
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-40 bg-muted rounded-lg" />
              <div className="h-40 bg-muted rounded-lg" />
              <div className="h-40 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
