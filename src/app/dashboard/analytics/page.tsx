import { Suspense } from 'react'
import { getFeedbackStats } from '@/lib/api'
import AnalyticsClient from './AnalyticsClient'

function AnalyticsSkeleton() {
  return (
    <div className="flex-1 bg-[var(--background)] p-6 animate-pulse">
      <div className="h-7 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
      <div className="h-4 w-72 rounded bg-gray-100 dark:bg-gray-800 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
            <div className="h-8 w-16 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 h-72" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 h-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 h-52" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 h-52" />
      </div>
    </div>
  )
}

async function AnalyticsContent() {
  const stats = await getFeedbackStats()
  return <AnalyticsClient stats={stats} />
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  )
}
