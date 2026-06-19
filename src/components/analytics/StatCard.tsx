interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: string; positive: boolean }
}

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${
              trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={trend.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              {trend.value}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-blue-600 dark:bg-blue-500/20 text-white dark:text-blue-400 shrink-0">
          {icon}
        </div>
      </div>
    </div>
  )
}
