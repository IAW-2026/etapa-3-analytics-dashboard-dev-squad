'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTheme } from '@/components/theme-provider'

interface Props {
  distribution: Record<number, number>
  total: number
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

export default function RatingChart({ distribution, total }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const data = Array.from({ length: 5 }, (_, i) => {
    const stars = i + 1
    const count = distribution[stars] ?? 0
    return {
      name: `${stars}★`,
      value: count,
      pct: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
    }
  }).reverse()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
        Distribución de calificaciones
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 0, bottom: 0 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: isDark ? '#a3a3a3' : '#666' }}
              axisLine={{ stroke: isDark ? '#333' : '#e5e5e5' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 13, fill: isDark ? '#d4d4d4' : '#333' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f1f1f' : '#fff',
                border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
                borderRadius: 8,
                color: isDark ? '#ededed' : '#111',
                fontSize: 13,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(_value: any, _name: any, entry: any) => [
                `${entry.payload.value} reseñas (${entry.payload.pct}%)`,
                'Cantidad',
              ]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[4 - idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
