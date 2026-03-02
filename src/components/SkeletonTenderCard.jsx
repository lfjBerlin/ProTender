export default function SkeletonTenderCard() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
          </div>
        </div>
        <div className="w-28 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
      </div>
    </div>
  )
}
