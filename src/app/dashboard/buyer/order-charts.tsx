'use client'

import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { OrderStatus } from '@/lib/api'

export type DailyPoint = {
  date: string
  label: string
  orders: number
  revenue: number
}

export type StatusCount = {
  status: OrderStatus
  count: number
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
}

const STATUS_HEX: Record<OrderStatus, string> = {
  PENDING: '#fbbf24',
  PAID: '#22c55e',
  SHIPPED: '#3b82f6',
  DELIVERED: '#9ca3af',
}

const AXIS_TICK = { fontSize: 11, fill: '#9ca3af' }
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--background)',
  fontSize: 12,
  color: 'var(--foreground)',
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function StatusDonut({ data, total }: { data: StatusCount[]; total: number }) {
  return (
    <ChartCard title="Distribución por estado" subtitle={`${total.toLocaleString()} órdenes en total`}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-[160px] w-[160px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((d) => (
                  <Cell key={d.status} fill={STATUS_HEX[d.status]} />
                ))}
              </Pie>
            <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, _name, item) => [
                `${Number(value).toLocaleString()} órdenes`,
                STATUS_LABELS[item.payload.status as OrderStatus],
            ]}
            />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full flex-1 space-y-2">
          {data.map((d) => (
            <li key={d.status} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_HEX[d.status] }} />
                {STATUS_LABELS[d.status]}
              </span>
              <span className="font-medium text-[var(--foreground)]">
                {d.count.toLocaleString()}{' '}
                <span className="text-gray-400">({total > 0 ? Math.round((d.count / total) * 100) : 0}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

export function RevenueTrend({ data }: { data: DailyPoint[] }) {
  return (
    <ChartCard title="Ingresos por día" subtitle="Últimos días con órdenes registradas">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            />
            <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [
                `$${Number(value).toFixed(2)}`,
                'Ingresos',
            ]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export function OrdersVolume({ data }: { data: DailyPoint[] }) {
  return (
    <ChartCard title="Volumen de órdenes" subtitle="Cantidad de órdenes recibidas por día">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
            <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [
                    `${Number(value)}`,
                    'Órdenes',
                ]}
                />
            <Bar dataKey="orders" radius={[4, 4, 0, 0]} fill="#60a5fa" maxBarSize={28} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}