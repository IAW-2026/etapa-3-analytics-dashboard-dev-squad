import { fetchOrders, type OrderStatus } from '@/lib/api'

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

function MetricCard({ label, value, active }: { label: string; value: number; active?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        active
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 ring-1 ring-blue-300 dark:ring-blue-700'
          : 'border-[var(--border)] bg-[var(--background)]'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-[var(--foreground)]">{value.toLocaleString()}</p>
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
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const status = (Object.hasOwn(STATUS_LABELS, searchParams.status ?? '')
    ? searchParams.status
    : undefined) as OrderStatus | undefined
  const page = Math.max(1, Number(searchParams.page) || 1)

  const [orders, pending, paid, shipped, delivered] = await Promise.all([
    fetchOrders({ status, page, limit: 100 }),
    fetchOrders({ status: 'PENDING', limit: 1 }),
    fetchOrders({ status: 'PAID', limit: 1 }),
    fetchOrders({ status: 'SHIPPED', limit: 1 }),
    fetchOrders({ status: 'DELIVERED', limit: 1 }),
  ])

  const counts = {
    total: orders.pagination.totalItems,
    PENDING: pending.pagination.totalItems,
    PAID: paid.pagination.totalItems,
    SHIPPED: shipped.pagination.totalItems,
    DELIVERED: delivered.pagination.totalItems,
  }

  const filters = [
    { label: 'Todas', href: '/dashboard', active: !status },
    ...(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((s) => ({
      label: STATUS_LABELS[s],
      href: `/dashboard?status=${s}`,
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
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <MetricCard label="Total" value={counts.total} />
          <MetricCard label="Pendientes" value={counts.PENDING} active={status === 'PENDING'} />
          <MetricCard label="Pagadas" value={counts.PAID} active={status === 'PAID'} />
          <MetricCard label="Enviadas" value={counts.SHIPPED} active={status === 'SHIPPED'} />
          <MetricCard label="Entregadas" value={counts.DELIVERED} active={status === 'DELIVERED'} />
        </div>

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
                  href={`/dashboard?page=${page - 1}${status ? `&status=${status}` : ''}`}
                  className={`rounded-lg border px-3 py-1.5 transition-colors ${
                    page <= 1
                      ? 'pointer-events-none border-[var(--border)] text-gray-300 dark:text-gray-600'
                      : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  Anterior
                </a>
                <span className="px-2">
                  {page} / {orders.pagination.totalPages}
                </span>
                <a
                  href={`/dashboard?page=${page + 1}${status ? `&status=${status}` : ''}`}
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
                        {order.customer ?? '—'}
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
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
