export default function OpportunityFeedSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-6 bg-gray-200 rounded w-64"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>

              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>

              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </div>

            <div className="ml-6 flex flex-col items-end gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-10 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
