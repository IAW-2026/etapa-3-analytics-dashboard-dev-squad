'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@/components/theme-provider'
import { PieChart as PieIcon } from 'lucide-react'

interface Props {
  productCount: number
  sellerCount: number
}

const COLORS = ['#2563eb', '#059669']

export default function TypeDonut({ productCount, sellerCount }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const total = productCount + sellerCount

  const data = [
    { name: 'Productos', value: productCount },
    { name: 'Vendedores', value: sellerCount },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-blue-600" />
          Productos vs Vendedores
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <PieIcon className="w-4 h-4 text-blue-600" />
        Productos vs Vendedores
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
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx]} />
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
          {data.map((d, idx) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx] }} />
              <span className="text-[var(--foreground)]">{d.name}</span>
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
