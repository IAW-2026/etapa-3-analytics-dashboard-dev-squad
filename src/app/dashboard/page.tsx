import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package2,
  Percent,
  Receipt,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { fetchOrders, type OrderStatus } from '@/lib/api'
import { OrdersVolume, RevenueTrend, StatusDonut, type DailyPoint, type StatusCount } from './buyer/order-charts'
import { PageSizeSelector } from '@/components/PageSizeSelector'

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  PAID: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  SHIPPED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  DELIVERED: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
}

type OrderRow = Awaited<ReturnType<typeof fetchOrders>>['data'][number]
type Accent = 'gray' | 'amber' | 'green' | 'blue' | 'indigo'

const ACCENT_CLASSES: Record<Accent, string> = {
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
}

// Groups a list of orders into per-day buckets (orders + revenue) and
// returns the most recent 14 days that actually had activity. Used to feed
// both the revenue area chart and the order-volume bar chart.
function buildDailySeries(orders: OrderRow[]): DailyPoint[] {
  const buckets = new Map<string, { orders: number; revenue: number }>()

  for (const order of orders) {
    if (!order.createdAt) continue
    const key = new Date(order.createdAt).toISOString().slice(0, 10)
    const bucket = buckets.get(key) ?? { orders: 0, revenue: 0 }
    bucket.orders += 1
    bucket.revenue += order.total != null ? Number(order.total) : 0
    buckets.set(key, bucket)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-14)
    .map(([key, value]) => ({
      date: key,
      label: new Date(key).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      orders: value.orders,
      revenue: Math.round(value.revenue * 100) / 100,
    }))
}

// Compares the sum of the last 7 days against the previous 7 days. Returns
// null when there isn't enough history to make the comparison meaningful,
// so the UI can simply omit the badge instead of showing a misleading 0%.
function weekOverWeek(daily: DailyPoint[], key: 'orders' | 'revenue'): number | null {
  if (daily.length < 8) return null
  const sum = (rows: DailyPoint[]) => rows.reduce((acc, row) => acc + row[key], 0)
  const last7 = sum(daily.slice(-7))
  const prev7 = sum(daily.slice(-14, -7))
  if (prev7 === 0) return null
  return Math.round(((last7 - prev7) / prev7) * 100)
}

function TrendBadge({ value, suffix }: { value: number | null; suffix: string }) {
  if (value === null) return null
  const isUp = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}% {suffix}
    </span>
  )
}

function MetricCard({
  label,
  value,
  active,
  icon: Icon,
  accent = 'gray',
  caption,
}: {
  label: string
  value: string | number
  active?: boolean
  icon?: LucideIcon
  accent?: Accent
  caption?: React.ReactNode
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        active
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 ring-1 ring-blue-300 dark:ring-blue-700'
          : 'border-[var(--border)] bg-[var(--background)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        {Icon && (
          <span className={`rounded-lg p-1.5 ${ACCENT_CLASSES[accent]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-1.5 text-3xl font-bold text-[var(--foreground)]">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {caption && <div className="mt-1">{caption}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors = STATUS_COLORS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ status?: string; page?: string; limit?: string }>
}) {
  const searchParams = await props.searchParams
  const status = (Object.hasOwn(STATUS_LABELS, searchParams.status ?? '')
    ? searchParams.status
    : undefined) as OrderStatus | undefined
  const page = Math.max(1, Number(searchParams.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 10))

  const [orders, pending, paid, shipped, delivered, recent] = await Promise.all([
    fetchOrders({ status, page, limit }),
    fetchOrders({ status: 'PENDING', limit: 1 }),
    fetchOrders({ status: 'PAID', limit: 1 }),
    fetchOrders({ status: 'SHIPPED', limit: 1 }),
    fetchOrders({ status: 'DELIVERED', limit: 1 }),
    // A separate, filter-independent snapshot used only to power the charts
    // below. If your API exposes a dedicated analytics/aggregates endpoint,
    // swap this for that instead of paging through raw orders.
    fetchOrders({ limit: 500 }),
  ])

  const counts = {
    total: orders.pagination.totalItems,
    PENDING: pending.pagination.totalItems,
    PAID: paid.pagination.totalItems,
    SHIPPED: shipped.pagination.totalItems,
    DELIVERED: delivered.pagination.totalItems,
  }

  const statusCounts: StatusCount[] = (['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((s) => ({
    status: s,
    count: counts[s],
  }))

  const dailySeries = buildDailySeries(recent.data)
  const ordersWithTotal = recent.data.filter((o) => o.total != null)
  const recentRevenue = ordersWithTotal.reduce((sum, o) => sum + Number(o.total), 0)
  const avgTicket = ordersWithTotal.length > 0 ? recentRevenue / ordersWithTotal.length : 0
  const conversionRate = counts.total > 0 ? ((counts.PAID + counts.SHIPPED + counts.DELIVERED) / counts.total) * 100 : 0
  const revenueTrend = weekOverWeek(dailySeries, 'revenue')

  const filters = [
    { label: 'Todas', href: `/dashboard?limit=${limit}`, active: !status },
    ...(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((s) => ({
      label: STATUS_LABELS[s],
      href: `/dashboard?status=${s}&limit=${limit}`,
      active: status === s,
    })),
  ]

  return (
    <div className="flex-1 bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Órdenes</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Panel de métricas de órdenes</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Conteos por estado, exactos (vienen de totalItems, no de una muestra) */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <MetricCard label="Total" value={counts.total} icon={Package2} accent="indigo" />
          <MetricCard label="Pendientes" value={counts.PENDING} active={status === 'PENDING'} icon={Clock3} accent="amber" />
          <MetricCard label="Pagadas" value={counts.PAID} active={status === 'PAID'} icon={CreditCard} accent="green" />
          <MetricCard label="Enviadas" value={counts.SHIPPED} active={status === 'SHIPPED'} icon={Truck} accent="blue" />
          <MetricCard label="Entregadas" value={counts.DELIVERED} active={status === 'DELIVERED'} icon={CheckCircle2} accent="gray" />
        </div>

        {/* Resumen de actividad reciente, calculado sobre las últimas órdenes */}
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Actividad reciente</h2>
          <span className="text-xs text-gray-400">Basado en las últimas {recent.data.length} órdenes</span>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Ingresos recientes"
            value={`$${recentRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={Wallet}
            accent="blue"
            caption={<TrendBadge value={revenueTrend} suffix="vs. semana anterior" />}
          />
          <MetricCard
            label="Ticket promedio"
            value={`$${avgTicket.toFixed(2)}`}
            icon={Receipt}
            accent="green"
          />
          <MetricCard
            label="Tasa de conversión"
            value={`${conversionRate.toFixed(1)}%`}
            icon={Percent}
            accent="indigo"
            caption={<span className="text-xs text-gray-400">Pagada, enviada o entregada</span>}
          />
        </div>

        {/* Gráficos */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueTrend data={dailySeries} />
          </div>
          <StatusDonut data={statusCounts} total={counts.total} />
          <div className="lg:col-span-3">
            <OrdersVolume data={dailySeries} />
          </div>
        </div>

        <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Detalle de órdenes</h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    f.active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 dark:bg-[var(--muted)] border border-[var(--border)] text-black dark:text-gray-300 hover:bg-[var(--muted)]'
                  }`}
                >
                  {f.label}
                </a>
              ))}
            </div>

            {orders.pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <a
                  href={`/dashboard?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ''}`}
                  className={`rounded-lg border px-3 py-1.5 transition-colors ${
                    page <= 1
                      ? 'pointer-events-none border-[var(--border)] text-gray-300 dark:text-gray-600'
                      : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  Anterior
                </a>

                {(() => {
                  const pages: (number | 'ellipsis')[] = []
                  const total = orders.pagination.totalPages
                  const range = 2
                  const start = Math.max(2, page - range)
                  const end = Math.min(total - 1, page + range)

                  pages.push(1)
                  if (start > 2) pages.push('ellipsis')
                  for (let i = start; i <= end; i++) pages.push(i)
                  if (end < total - 1) pages.push('ellipsis')
                  if (total > 1) pages.push(total)

                  return pages.map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`e-${i}`} className="px-1">...</span>
                    ) : (
                      <a
                        key={p}
                        href={`/dashboard?page=${p}&limit=${limit}${status ? `&status=${status}` : ''}`}
                        className={`rounded-lg border px-3 py-1.5 transition-colors ${
                          p === page
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                        }`}
                      >
                        {p}
                      </a>
                    )
                  )
                })()}

                <a
                  href={`/dashboard?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ''}`}
                  className={`rounded-lg border px-3 py-1.5 transition-colors ${
                    page >= orders.pagination.totalPages
                      ? 'pointer-events-none border-[var(--border)] text-gray-300 dark:text-gray-600'
                      : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  Siguiente
                </a>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--muted)]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cliente</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {orders.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                      No se encontraron órdenes
                    </td>
                  </tr>
                ) : (
                  orders.data.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-[var(--muted)]">
                      <td className="max-w-[120px] truncate px-6 py-4 font-mono text-sm font-medium text-[var(--foreground)]">
                        {order.id}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.receiverName || '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-medium text-[var(--foreground)]">
                        {order.total != null ? `$${Number(order.total).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {counts.total} {counts.total === 1 ? 'orden' : 'órdenes'} en total
              {orders.data.length > 0 && (
                <span className="ml-1">
                  — Página {page} ({(page - 1) * limit + 1}–{Math.min(page * limit, counts.total)})
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Mostrar</span>
              <PageSizeSelector limit={limit} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}