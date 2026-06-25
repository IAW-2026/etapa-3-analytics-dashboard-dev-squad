import {
  Package2,
  MessageSquareText,
  ShoppingCart,
  Truck,
  CreditCard,
  Clock3,
  CheckCircle2,
  DollarSign,
  Users,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import { fetchOrders, getFeedbackStats, getSellerSummary, getShippingSummary, getPaymentsStats } from '@/lib/api'

const CARD_STYLES = {
  orders: {
    gradient: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    icon: 'text-blue-500 bg-blue-500/10',
    label: 'text-blue-600 dark:text-blue-400',
  },
  feedback: {
    gradient: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20',
    icon: 'text-purple-500 bg-purple-500/10',
    label: 'text-purple-600 dark:text-purple-400',
  },
  seller: {
    gradient: 'from-orange-500/10 to-orange-500/5',
    border: 'border-orange-500/20',
    icon: 'text-orange-500 bg-orange-500/10',
    label: 'text-orange-600 dark:text-orange-400',
  },
  shipping: {
    gradient: 'from-cyan-500/10 to-cyan-500/5',
    border: 'border-cyan-500/20',
    icon: 'text-cyan-500 bg-cyan-500/10',
    label: 'text-cyan-600 dark:text-cyan-400',
  },
  payments: {
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-500 bg-emerald-500/10',
    label: 'text-emerald-600 dark:text-emerald-400',
  },
}

function ServiceCard({
  icon: Icon,
  title,
  style,
  children,
}: {
  icon: React.ElementType
  title: string
  style: keyof typeof CARD_STYLES
  children: React.ReactNode
}) {
  const s = CARD_STYLES[style]
  return (
    <div className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.gradient} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${s.label}`}>{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs opacity-60">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {sub && <span className="text-[11px] opacity-40 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      <div className="h-8 w-64 bg-[var(--border)] rounded-lg" />
      <div className="h-4 w-96 bg-[var(--border)] rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--border)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-[var(--border)]" />
        ))}
      </div>
    </div>
  )
}

// ── Hero KPIs (one per service) ──

async function HeroKpiCards() {
  const [ordersRes, feedbackRes, sellerRes, shippingRes, paymentsRes] = await Promise.allSettled([
    fetchOrders({ limit: 1 }),
    getFeedbackStats(),
    getSellerSummary(),
    getShippingSummary(),
    getPaymentsStats(),
  ])

  const items = [
    {
      label: 'Órdenes totales',
      value: ordersRes.status === 'fulfilled' ? ordersRes.value.pagination.totalItems : '—',
      icon: Package2,
      style: 'orders' as const,
    },
    {
      label: 'Reseñas totales',
      value: feedbackRes.status === 'fulfilled' ? feedbackRes.value.totalReviews : '—',
      icon: MessageSquareText,
      style: 'feedback' as const,
    },
    {
      label: 'Ingresos seller',
      value: sellerRes.status === 'fulfilled' ? `$${sellerRes.value.revenue.confirmed.toLocaleString()}` : '—',
      icon: DollarSign,
      style: 'seller' as const,
    },
    {
      label: 'Envíos totales',
      value: shippingRes.status === 'fulfilled' ? shippingRes.value.kpis.totalShipments : '—',
      icon: Truck,
      style: 'shipping' as const,
    },
    {
      label: 'Pagos 30d',
      value: paymentsRes.status === 'fulfilled' ? `$${paymentsRes.value.kpis.montoTotal30d.toLocaleString('es-AR')}` : '—',
      icon: CreditCard,
      style: 'payments' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {items.map((item) => {
        const s = CARD_STYLES[item.style]
        return (
          <div key={item.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.gradient} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-50">{item.label}</p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.icon}`}>
                <item.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Orders section ──

async function OrdersSection() {
  const [all, pending, paid, shipped, delivered] = await Promise.all([
    fetchOrders({ limit: 1 }),
    fetchOrders({ status: 'PENDING', limit: 1 }),
    fetchOrders({ status: 'PAID', limit: 1 }),
    fetchOrders({ status: 'SHIPPED', limit: 1 }),
    fetchOrders({ status: 'DELIVERED', limit: 1 }),
  ])

  return (
    <ServiceCard icon={Package2} title="Órdenes" style="orders">
      <StatRow label="Total" value={all.pagination.totalItems} />
      <StatRow label="Pendientes" value={pending.pagination.totalItems} />
      <StatRow label="Pagadas" value={paid.pagination.totalItems} />
      <StatRow label="Enviadas" value={shipped.pagination.totalItems} />
      <StatRow label="Entregadas" value={delivered.pagination.totalItems} />
    </ServiceCard>
  )
}

// ── Feedback section ──

async function FeedbackSection() {
  const stats = await getFeedbackStats()

  return (
    <ServiceCard icon={MessageSquareText} title="Feedback" style="feedback">
      <StatRow label="Reseñas totales" value={stats.totalReviews} />
      <StatRow label="Reseñas este año" value={stats.reviewsThisYear} />
      {stats.topProduct && (
        <StatRow label="Mejor producto" value={stats.topProduct.nombre} sub={`${stats.topProduct.averageRating.toFixed(1)} ★`} />
      )}
      {stats.topSeller && (
        <StatRow label="Mejor vendedor" value={stats.topSeller.nombre} sub={`${stats.topSeller.averageRating.toFixed(1)} ★`} />
      )}
    </ServiceCard>
  )
}

// ── Seller section ──

async function SellerSection() {
  const summary = await getSellerSummary()
  const tasa = summary.sells.total > 0 ? Math.round((summary.sells.confirmed / summary.sells.total) * 100) : 0

  return (
    <ServiceCard icon={ShoppingCart} title="Seller App" style="seller">
      <StatRow label="Ingresos confirmados" value={`$${summary.revenue.confirmed.toLocaleString()}`} />
      <StatRow label="Ventas totales" value={summary.sells.total} sub={`${summary.sells.pending} pendientes`} />
      <StatRow label="Tasa de confirmación" value={`${tasa}%`} sub={`${summary.sells.cancelled} canceladas`} />
      <StatRow label="Sellers activos" value={`${summary.sellers.active} / ${summary.sellers.total}`} />
      <StatRow label="Productos activos" value={`${summary.products.active} / ${summary.products.total}`} />
    </ServiceCard>
  )
}

// ── Shipping section ──

async function ShippingSection() {
  const data = await getShippingSummary()

  return (
    <ServiceCard icon={Truck} title="Envíos" style="shipping">
      <StatRow label="Envíos totales" value={data.kpis.totalShipments} />
      <StatRow label="Envíos activos" value={data.kpis.activeShipments} />
      <StatRow label="Entregas a tiempo" value={`${data.kpis.onTimeRate}%`} />
      <StatRow label="Tiempo promedio" value={`${data.kpis.avgDeliveryDays} días`} />
      <StatRow label="Ingresos por envío" value={`$${data.kpis.shippingRevenue.toLocaleString()}`} />
    </ServiceCard>
  )
}

// ── Payments section ──

async function PaymentsSection() {
  const stats = await getPaymentsStats()

  return (
    <ServiceCard icon={CreditCard} title="Pagos" style="payments">
      <StatRow label="Monto 7 días" value={`$${stats.kpis.montoTotal7d.toLocaleString('es-AR')}`} />
      <StatRow label="Monto 30 días" value={`$${stats.kpis.montoTotal30d.toLocaleString('es-AR')}`} />
      <StatRow label="Transferencias exitosas (7d)" value={stats.kpis.exitosas7d} />
      <StatRow label="Disputas (7d)" value={stats.kpis.disputas7d} />
      {stats.kpis.rechazadas7d != null && (
        <StatRow label="Rechazadas (7d)" value={stats.kpis.rechazadas7d} />
      )}
    </ServiceCard>
  )
}

// ── Page ──

export default async function DatosGeneralesPage() {
  const sections = await Promise.allSettled([
    OrdersSection(),
    FeedbackSection(),
    SellerSection(),
    ShippingSection(),
    PaymentsSection(),
  ])

  const sectionComponents = [
    { key: 'orders', component: sections[0] },
    { key: 'feedback', component: sections[1] },
    { key: 'seller', component: sections[2] },
    { key: 'shipping', component: sections[3] },
    { key: 'payments', component: sections[4] },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-bold">Datos Generales</h1>
        <p className="text-sm opacity-60 mt-1">Métricas consolidadas de todas las APIs del ecosistema</p>
      </div>

      <HeroKpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sectionComponents.map(({ key, component }) => (
          <div key={key}>
            {component.status === 'fulfilled' ? component.value : (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-5 text-sm text-red-600 dark:text-red-400">
                Error al cargar datos de {key}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
