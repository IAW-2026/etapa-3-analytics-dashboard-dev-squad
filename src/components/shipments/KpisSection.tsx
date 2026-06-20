'use client'

import React from 'react'
import { Package, Truck, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import type { ShippingSummary } from './types'

function KpiCard({ label, value, sub, icon: Icon, tint }: {
  label: string; 
  value: string | number; 
  sub?: string;
  icon: React.ElementType; 
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-50">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tint}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  )
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

interface KpisSectionProps {
  kpis: ShippingSummary['kpis']
}

export function KpisSection({ kpis }: KpisSectionProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Envíos totales"
        value={kpis.totalShipments}
        icon={Package}
        tint="bg-blue-500/15 text-blue-400"
      />
      <KpiCard
        label="Envíos activos"
        value={kpis.activeShipments}
        sub="en preparación o en camino"
        icon={Truck}
        tint="bg-purple-500/15 text-purple-400"
      />
      <KpiCard
        label="Entregas a tiempo"
        value={`${kpis.onTimeRate}%`}
        icon={CheckCircle2}
        tint="bg-green-500/15 text-green-400"
      />
      <KpiCard
        label="Tiempo promedio de entrega"
        value={`${kpis.avgDeliveryDays} días`}
        icon={Clock}
        tint="bg-orange-500/15 text-orange-400"
      />
      <KpiCard
        label="Ingresos por envío"
        value={fmt(kpis.shippingRevenue)}
        sub="envíos entregados"
        icon={DollarSign}
        tint="bg-green-500/15 text-green-400"
      />
    </div>
  )
}