'use client'

import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  PieChart as PieChartIcon,
  Layers,
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export interface Summary {
  sellers: { total: number; active: number; inactive: number }
  products: { total: number; active: number; inactive: number }
  sells: { total: number; confirmed: number; pending: number; cancelled: number }
  revenue: { confirmed: number }
  topSellers: {
    id: string
    name: string
    email: string
    active: boolean
    totalSells: number
    totalProducts: number
  }[]
  topProducts: {
    id: string
    name: string
    brand: string
    price: number
    stock: number
    active: boolean
    seller: string
    totalSells: number
  }[]
}

interface SellerAnalyticsClientProps {
  data: Summary
}
const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0)

function KpiCard({ label, value, sub, icon: Icon, tint }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; tint: string;
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

// Matches the card styling instead of recharts' default white tooltip box
interface ChartTooltipPayload {
  name?: string
  value?: number
  color?: string
  fill?: string
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 shadow-lg text-xs space-y-1">
      {label && <p className="font-medium opacity-80">{label}</p>}
      {payload.map((p: ChartTooltipPayload, i: number) => (
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

// Fixed pixel size on purpose: ResponsiveContainer can fail to measure a flex
// child on first paint and silently render nothing, so small fixed donuts
// just use width/height directly on the chart itself — no observer needed.
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

export default function SellerAnalyticsClient({
  data: summary,
}: SellerAnalyticsClientProps) {

  const tasaConfirmacion = pct(summary.sells.confirmed, summary.sells.total)

  const salesData = [
    { name: 'Confirmadas', value: summary.sells.confirmed, color: '#22c55e' },
    { name: 'Pendientes',  value: summary.sells.pending,   color: '#facc15' },
    { name: 'Canceladas',  value: summary.sells.cancelled, color: '#f87171' },
  ]

  const sellerStatusData = [
    { name: 'Activos',   value: summary.sellers.active,   color: '#22c55e' },
    { name: 'Inactivos', value: summary.sellers.inactive, color: '#475569' },
  ]

  const productStatusData = [
    { name: 'Activos',   value: summary.products.active,   color: '#3b82f6' },
    { name: 'Inactivos', value: summary.products.inactive, color: '#475569' },
  ]

  const sellersRanked  = [...summary.topSellers].sort((a, b) => b.totalSells - a.totalSells)
  const productsRanked = [...summary.topProducts].sort((a, b) => b.totalSells - a.totalSells)
const truncate = (s: string, max = 18) =>
  s.length > max ? s.slice(0, max) + '…' : s

const sellersYWidth = Math.min(
  Math.max(...sellersRanked.map(s => s.name.length)) * 6.5,
  180
)
const productsYWidth = Math.min(
  Math.max(...productsRanked.map(p => p.name.length)) * 6.5,
  180
)

  const axisTick = { fontSize: 11, fill: 'currentColor', opacity: 0.5 }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-bold">Seller App</h1>
        <p className="text-sm opacity-60 mt-1">Métricas del marketplace de zapatillas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos confirmados"
          value={fmt(summary.revenue.confirmed)}
          sub="en ventas completadas"
          icon={DollarSign}
          tint="bg-green-500/15 text-green-400"
        />
        <KpiCard
          label="Ventas totales"
          value={summary.sells.total}
          sub={`${summary.sells.pending} pendientes`}
          icon={ShoppingCart}
          tint="bg-blue-500/15 text-blue-400"
        />
        <KpiCard
          label="Tasa de confirmación"
          value={`${tasaConfirmacion}%`}
          sub={`${summary.sells.cancelled} canceladas`}
          icon={TrendingUp}
          tint="bg-purple-500/15 text-purple-400"
        />
        <KpiCard
          label="Sellers activos"
          value={`${summary.sellers.active} / ${summary.sellers.total}`}
          sub={`${summary.products.active} productos activos`}
          icon={Users}
          tint="bg-orange-500/15 text-orange-400"
        />
      </div>

      {/* Distribución de ventas + estado del catálogo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border)] p-5">
          <CardTitle icon={PieChartIcon} tint="bg-purple-500/15 text-purple-400">Distribución de ventas</CardTitle>
          <div className="flex items-center gap-6 mt-5">
            <Donut data={salesData} size={120} />
            <div className="flex-1">
              <Legend items={salesData} total={summary.sells.total} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] p-5">
          <CardTitle icon={Layers} tint="bg-orange-500/15 text-orange-400">Estado del catálogo</CardTitle>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="flex items-center gap-3">
              <Donut data={sellerStatusData} size={92} />
              <div>
                <p className="text-xs font-medium opacity-70 mb-2">Sellers</p>
                <Legend items={sellerStatusData} total={summary.sellers.total} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Donut data={productStatusData} size={92} />
              <div>
                <p className="text-xs font-medium opacity-70 mb-2">Productos</p>
                <Legend items={productStatusData} total={summary.products.total} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top sellers */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <CardTitle icon={Users} tint="bg-blue-500/15 text-blue-400">Top vendedores</CardTitle>
          </div>

          <div className="px-5 pt-4">
            <ResponsiveContainer width="100%" height={Math.max(sellersRanked.length * 34, 90)}>
              <BarChart data={sellersRanked} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis type="category" dataKey="name" width={sellersYWidth} axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(v) => truncate(v)} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="totalSells" name="Ventas" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="w-full mt-2">
            <thead>
              <tr className="border-b border-t border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Vendedor</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Productos</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Ventas</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sellersRanked.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs opacity-40">{s.email}</p>
                  </td>
                  <td className="px-5 py-3 text-center text-sm">{s.totalProducts}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold">{s.totalSells}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {s.active ? 'activo' : 'inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top productos */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <CardTitle icon={Package} tint="bg-violet-500/15 text-violet-400">Productos más vendidos</CardTitle>
          </div>

          <div className="px-5 pt-4">
            <ResponsiveContainer width="100%" height={Math.max(productsRanked.length * 34, 90)}>
              <BarChart data={productsRanked} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis type="category" dataKey="name" width={productsYWidth} axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(v) => truncate(v)} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="totalSells" name="Vendidos" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="w-full mt-2">
            <thead>
              <tr className="border-b border-t border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Producto</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Precio</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Stock</th>
                <th className="text-center text-xs font-semibold uppercase tracking-wider px-5 py-3 opacity-50">Vendidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {productsRanked.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs opacity-40">{p.brand} · {p.seller}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold">{fmt(p.price)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-sm ${p.stock === 0 ? 'opacity-30' : ''}`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-semibold">{p.totalSells}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}