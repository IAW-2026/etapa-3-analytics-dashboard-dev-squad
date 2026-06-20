'use client'

import React, { useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Truck, Package, Clock, DollarSign, Calendar } from 'lucide-react'
import {PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,} from 'recharts'
import type { ShippingSummary } from '../../../components/shipments/types'
import { STATUS_LABELS, STATUS_COLORS, CARRIER_LABELS } from '../../../components/shipments/ShippingLabels'

import { KpisSection } from '../../../components/shipments/KpisSection'
import { OperationalTables } from '../../../components/shipments/OperationalTables'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0)

function formatMonth(monthKey: string) {
  return format(new Date(`${monthKey}-01T00:00:00`), 'MMM yyyy', { locale: es })
}

// Genera los últimos N meses en formato "YYYY-MM" para popular el selector,
// del más reciente al más antiguo.
function lastMonths(n: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

function CardTitle({ icon: Icon, tint, children }: { icon: React.ElementType; tint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${tint}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="text-sm font-semibold">{children}</h2>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg text-xs space-y-1">
      {label && <p className="font-medium opacity-80">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ background: p.color || p.fill }} />
          <span className="opacity-50">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function Legend({ items, total }: { items: { name: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: it.color }} />
          <span className="opacity-60">{it.name}</span>
          <span className="font-semibold ml-auto">{it.value} <span className="opacity-40 font-normal">({pct(it.value, total)}%)</span></span>
        </div>
      ))}
    </div>
  )
}

function Donut({ data, size = 120 }: { data: { name: string; value: number; color: string }[]; size?: number }) {
  const inner = size * 0.34
  const outer = size * 0.48
  return (
    <PieChart width={size} height={size}>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={outer} paddingAngle={2} stroke="none">
        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
      </Pie>
      <Tooltip content={<ChartTooltip />} />
    </PieChart>
  )
}

const axisTick = { fontSize: 11, fill: 'currentColor', opacity: 0.5 }

interface ShippingAnalyticsClientProps {
  data: ShippingSummary
  selectedMonth: string | null
}

export default function ShippingAnalyticsClient({ data, selectedMonth }: ShippingAnalyticsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const { kpis, funnel, statusDistribution, monthlyTrend, carrierComparison, stageTimes, discounts, staleShipments, topDestinations } = data

  const monthOptions = lastMonths(12)

  function handleMonthChange(value: string) {
    const params = new URLSearchParams()
    if (value !== 'all') params.set('month', value)
    const query = params.toString()

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const funnelData = funnel.map((f) => ({
    name: STATUS_LABELS[f.status] ?? f.status,
    value: f.count,
    color: STATUS_COLORS[f.status] ?? '#94a3b8',
  }))

  const statusData = statusDistribution.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#94a3b8',
  }))

  const trendData = monthlyTrend.map((m) => ({
    month: formatMonth(m.month),
    Creados: m.created,
    Entregados: m.delivered,
  }))

  const stageTimesData = stageTimes.map((s) => ({
    name: s.stage,
    value: s.avgDays,
  }))

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">Shipping</h1>
          <p className="text-sm opacity-60 mt-1">Métricas de envíos y logística</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 opacity-50" />
          <select
            value={selectedMonth ?? 'all'}
            onChange={(e) => handleMonthChange(e.target.value)}
            disabled={isPending}
            className="text-sm rounded-lg border border-border bg-background px-3 py-1.5 outline-none disabled:opacity-50"
          >
            <option value="all">Todo el período</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
          {isPending && (
            <span className="w-4 h-4 rounded-full border-2 border-border border-t-transparent animate-spin" />
          )}
        </div>
      </div>

      <div
        aria-busy={isPending}
        className={`space-y-8 transition-opacity duration-150 ${
          isPending ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}
      >
      {/* KPIs */}
      <KpisSection kpis={kpis} />

      {/* Embudo + distribución actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-5">
          <CardTitle icon={Truck} tint="bg-blue-500/15 text-blue-400">Embudo de envíos</CardTitle>
          <p className="text-xs opacity-50 mt-1 mb-4">Envíos que alcanzaron al menos cada etapa</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="value" name="Envíos" radius={[0, 4, 4, 0]} barSize={18}>
                {funnelData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border p-5">
          <CardTitle icon={Package} tint="bg-purple-500/15 text-purple-400">Estado actual</CardTitle>
          <div className="flex items-center gap-6 mt-5">
            <Donut data={statusData} size={120} />
            <div className="flex-1">
              <Legend items={statusData} total={kpis.totalShipments} />
            </div>
          </div>
        </div>
      </div>

      {/* Tendencia mensual */}
      <div className="rounded-xl border border-border p-5">
        <CardTitle icon={Clock} tint="bg-orange-500/15 text-orange-400">Tendencia mensual</CardTitle>
        <p className="text-xs opacity-50 mt-1 mb-4">
          {selectedMonth
            ? 'Envíos creados vs. entregados en el mes seleccionado'
            : 'Envíos creados vs. entregados por mes'}
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ left: -16, right: 16, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="Creados" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Entregados" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-blue-500" />Creados</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-green-500" />Entregados</span>
        </div>
      </div>

      {/* Comparativa por carrier + tiempo por etapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-5">
          <CardTitle icon={Truck} tint="bg-blue-500/15 text-blue-400">Comparativa por tipo de envío</CardTitle>
          <div className="grid grid-cols-2 gap-4 mt-5">
            {carrierComparison.map((c) => (
              <div key={c.carrier}>
                <p className="text-xs font-medium opacity-70 mb-2">{CARRIER_LABELS[c.carrier] ?? c.carrier}</p>
                <p className="text-2xl font-bold">{c.count}</p>
                <p className="text-xs opacity-50 mb-3">envíos</p>
                <p className="text-sm"><span className="font-semibold">{c.avgDeliveryDays}</span> <span className="opacity-50">días promedio</span></p>
                <p className="text-sm"><span className="font-semibold">{c.onTimeRate}%</span> <span className="opacity-50">a tiempo</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border p-5">
          <CardTitle icon={Clock} tint="bg-purple-500/15 text-purple-400">Tiempo promedio por etapa</CardTitle>
          <p className="text-xs opacity-50 mt-1 mb-4">Días entre cambios de estado</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stageTimesData} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis type="category" dataKey="name" width={140} axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="value" name="Días" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Costos de envío */}
      <div className="rounded-xl border border-border p-5">
        <CardTitle icon={DollarSign} tint="bg-green-500/15 text-green-400">Costos de envío</CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-2xl font-bold">{fmt(discounts.avgShippingCost)}</p>
            <p className="text-xs opacity-50 mt-1">costo promedio de envío</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{discounts.discountUsageRate}%</p>
            <p className="text-xs opacity-50 mt-1">de envíos con descuento aplicado</p>
          </div>
        </div>
      </div>

      {/* Envíos estancados + Provincias con más envíos (delegado) */}
      <OperationalTables staleShipments={staleShipments} topDestinations={topDestinations} />
      </div>
    </div>
  )
}