'use client'
// src/app/dashboard/payments/PaymentsAnalyticsClient.tsx
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

type Period = '7d' | '30d'
interface ChartPoint { fecha: string; monto: number }
interface Stats {
  charts: {
    ultimos7dias:  ChartPoint[]
    ultimos30dias: ChartPoint[]
  }
  chartsRechazadas?: {
    ultimos7dias:  ChartPoint[]
    ultimos30dias: ChartPoint[]
  }
  kpis: {
    exitosas7d:    number
    disputas7d:    number
    montoTotal7d:  number
    montoTotal30d: number
    rechazadas7d?:      number
    montoRechazado7d?:  number
  }
}

function AreaPeriodChart({
  title,
  data,
  period,
  setPeriod,
  color,
  gradientId,
}: {
  title: string
  data: ChartPoint[]
  period: Period
  setPeriod: (p: Period) => void
  color: string
  gradientId: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex gap-1 p-1 rounded-lg border border-border bg-muted">
          {(['7d', '30d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                period === p
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '7d' ? '7D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-sm opacity-40">Sin datos para este período.</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(v) => [`$ ${Number(v).toLocaleString('es-AR')}`, 'Monto']}
            />
            <Area
              type="monotone"
              dataKey="monto"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function BarPeriodChart({
  title,
  data,
  period,
  setPeriod,
  color,
}: {
  title: string
  data: ChartPoint[]
  period: Period
  setPeriod: (p: Period) => void
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex gap-1 p-1 rounded-lg border border-border bg-muted">
          {(['7d', '30d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                period === p
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '7d' ? '7D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-sm opacity-40">Sin datos para este período.</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(v) => [`$ ${Number(v).toLocaleString('es-AR')}`, 'Monto']}
              cursor={{ fill: color, fillOpacity: 0.08 }}
            />
            <Bar
              dataKey="monto"
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function PaymentsAnalyticsClient({
  initialStats,
  initialError,
}: {
  initialStats: Stats | null
  initialError: string | null
}) {
  const [stats]              = useState<Stats | null>(initialStats)
  const [error]               = useState<string | null>(initialError)
  const [period, setPeriod]             = useState<Period>('7d')
  const [periodRechazadas, setPeriodRechazadas] = useState<Period>('7d')

  const chartData = stats
    ? period === '7d' ? stats.charts.ultimos7dias : stats.charts.ultimos30dias
    : []

  const chartDataRechazadas = stats?.chartsRechazadas
    ? periodRechazadas === '7d'
      ? stats.chartsRechazadas.ultimos7dias
      : stats.chartsRechazadas.ultimos30dias
    : []

  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>
  )
  if (!stats) return (
    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
      Sin datos disponibles.
    </div>
  )

  const kpis = [
    { label: 'Monto últimos 7 días',          value: `$ ${stats!.kpis.montoTotal7d.toLocaleString('es-AR')}`,  icon: '💰', danger: false, success: false },
    { label: 'Monto últimos 30 días',          value: `$ ${stats!.kpis.montoTotal30d.toLocaleString('es-AR')}`, icon: '📅', danger: false, success: false },
    { label: 'Transferencias exitosas (7d)',   value: stats!.kpis.exitosas7d.toString(),                        icon: '✅', danger: false, success: true  },
    { label: 'Disputas (7d)',                  value: stats!.kpis.disputas7d.toString(),                        icon: '⚠️', danger: stats!.kpis.disputas7d > 0, success: false },
  ]

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos — Dashboard</h1>
        <p className="text-sm opacity-60 mt-1">Resumen de actividad del módulo de pagos.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-border bg-background p-4">
            <div className="text-xl mb-1">{kpi.icon}</div>
            <p className="text-xs opacity-50 truncate">{kpi.label}</p>
            <p className={`text-lg font-bold mt-1 ${
              kpi.danger  ? 'text-red-500'   :
              kpi.success ? 'text-green-600' : ''
            }`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart: Monto procesado (aprobadas) — área */}
      <AreaPeriodChart
        title="Monto procesado"
        data={chartData}
        period={period}
        setPeriod={setPeriod}
        color="#3b82f6"
        gradientId="gradPagos"
      />

      {/* Chart: Transferencias rechazadas — columnas */}
      {stats?.chartsRechazadas ? (
        <BarPeriodChart
          title="Transferencias rechazadas"
          data={chartDataRechazadas}
          period={periodRechazadas}
          setPeriod={setPeriodRechazadas}
          color="#ef4444"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm opacity-50">
          El backend de Payments todavía no expone la serie de rechazadas
          (<code>chartsRechazadas</code> en <code>/api/admin/stats</code>).
        </div>
      )}
    </div>
  )
}