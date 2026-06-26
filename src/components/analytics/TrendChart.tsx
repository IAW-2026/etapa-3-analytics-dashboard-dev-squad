'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useTheme } from '@/components/theme-provider'
import { TrendingUp } from 'lucide-react'

interface DataPoint {
  month: string
  count: number
}

interface Props {
  data: DataPoint[]
}

export default function TrendChart({ data }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Tendencia mensual
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: isDark ? '#a3a3a3' : '#888' }}
                axisLine={{ stroke: isDark ? '#333' : '#e5e5e5' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: isDark ? '#a3a3a3' : '#888' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f1f1f' : '#fff',
                  border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
                  borderRadius: 8,
                  color: isDark ? '#ededed' : '#111',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2563eb' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
