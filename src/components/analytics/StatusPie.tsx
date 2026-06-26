'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@/components/theme-provider'
import { ShieldAlert } from 'lucide-react'

interface Props {
  published: number
  reported: number
  removed: number
}

const COLORS: Record<string, string> = {
  published: '#22c55e',
  reported: '#eab308',
  removed: '#ef4444',
}

const LABELS: Record<string, string> = {
  published: 'Publicadas',
  reported: 'Reportadas',
  removed: 'Eliminadas',
}

export default function StatusPie({ published, reported, removed }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const data = [
    { name: 'published', value: published },
    { name: 'reported', value: reported },
    { name: 'removed', value: removed },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          Estado de reseñas
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-blue-600" />
        Estado de reseñas
      </h3>
      <div className="flex items-center gap-4">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f1f1f' : '#fff',
                  border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
                  borderRadius: 8,
                  color: isDark ? '#ededed' : '#111',
                  fontSize: 13,
                }}
                formatter={(value) => [`${value ?? 0} (${((Number(value ?? 0) / total) * 100).toFixed(1)}%)`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[d.name] }} />
              <span className="text-[var(--foreground)]">{LABELS[d.name]}</span>
              <span className="text-gray-400 dark:text-gray-500">
                {d.value} ({((d.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
