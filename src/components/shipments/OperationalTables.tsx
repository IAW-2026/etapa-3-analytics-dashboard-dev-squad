'use client'

import React from 'react'
import { AlertTriangle, MapPin } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { ShippingSummary } from './types'
import { STATUS_LABELS, STATUS_COLORS } from './ShippingLabels'

const axisTick = { fontSize: 11, fill: 'currentColor', opacity: 0.5 }

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

interface OperationalTablesProps {
  staleShipments: ShippingSummary['staleShipments']
  topDestinations: ShippingSummary['topDestinations']
}

export function OperationalTables({ staleShipments, topDestinations }: OperationalTablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Envíos estancados */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <CardTitle icon={AlertTriangle} tint="bg-yellow-500/15 text-yellow-500">
            Envíos estancados
          </CardTitle>
        </div>
        {staleShipments.length === 0 ? (
          <p className="px-5 py-6 text-sm opacity-50">No hay envíos sin actualizar hace más de 5 días.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Pedido</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Estado</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Días sin avance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staleShipments.map((s) => (
                <tr key={s.orderId} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-3 text-sm font-medium">{s.orderId}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: `${STATUS_COLORS[s.status]}22`, color: STATUS_COLORS[s.status] }}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold">{s.daysSinceUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Provincias con más envíos */}
      <div className="rounded-xl border border-border p-5">
        <CardTitle icon={MapPin} tint="bg-blue-500/15 text-blue-500">Ciudades con más envíos</CardTitle>
        <p className="text-xs opacity-50 mt-1 mb-4">Principales destinos de distribución</p>
        {topDestinations.length === 0 ? (
          <p className="text-sm opacity-50 py-6">No hay datos de destino para este período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topDestinations} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 0 }}>
              <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="count" name="Envíos" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}