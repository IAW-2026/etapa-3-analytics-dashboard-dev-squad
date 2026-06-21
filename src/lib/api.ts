// ── Buyer App (orders) ──

const BUYER_BASE = 'https://zapasya.vercel.app/'
const FEEDBACK_BASE = process.env.FEEDBACK_API_URL ?? ''
const ANALYTICS_KEY = process.env.API_KEY_ANALYTICS ?? ''
const PAYMENTS_BASE   = (process.env.NEXT_PUBLIC_PAYMENTS_API_URL ?? '').replace(/\/+$/, '')
const PAYMENTS_KEY    = process.env.PAYMENTS_API_KEY ?? ''
const PAYMENTS_BYPASS = process.env.PAYMENTS_VERCEL_BYPASS ?? ''

export interface ChartPoint { fecha: string; monto: number }

export interface PaymentsStats {
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

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED'

export interface Order {
  id: string
  status: OrderStatus
  customer?: string
  total?: number
  createdAt?: string
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export async function fetchOrders(params?: {
  id?: string
  status?: OrderStatus
  page?: number
  limit?: number
}): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams()
  if (params?.id) searchParams.set('id', params.id)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))

  const queryString = searchParams.toString()
  const url = `${BUYER_BASE}/api/orders${queryString ? `?${queryString}` : ''}`

  const secret = process.env.BUYER_SECRET
  if (!secret) throw new Error('BUYER_SECRET no configurada')

  const res = await fetch(url, {
    headers: { 'buyer-key': secret },
  })

  if (!res.ok) {
    if (res.status === 403) throw new Error('Clave inválida')
    if (res.status === 404) throw new Error('Order not found')
    throw new Error(`Error API: ${res.status}`)
  }

  return res.json()
}

export async function fetchOrderById(id: string): Promise<Order> {
  const secret = process.env.BUYER_SECRET
  if (!secret) throw new Error('BUYER_SECRET no configurada')

  const res = await fetch(`${BUYER_BASE}/api/orders?id=${id}`, {
    headers: { 'buyer-key': secret },
  })

  if (!res.ok) {
    if (res.status === 403) throw new Error('Clave inválida')
    if (res.status === 404) throw new Error('Order not found')
    throw new Error(`Error API: ${res.status}`)
  }

  return res.json()
}

// ── Feedback App (reviews / stats) ──

export interface HomeStats {
  totalReviews: number
  reviewsThisYear: number
  topProduct: TopItem | null
  topSeller: TopItem | null
  topReviewed: TopItem | null
  latestReview: LatestReview | null
}

export interface TopItem {
  id: string
  nombre: string
  averageRating: number
  totalReviews: number
}

export interface LatestReview {
  id: string
  tipo: string
  targetName: string
  rating: number
  comentario: string
  userName: string
  fecha: string
}

export interface Review {
  id: string
  tipo: 'product' | 'seller'
  targetId: string
  userId: string
  rating: number
  comentario: string
  estado: string
  fecha: string
  userName?: string
  targetName?: string
  sellerName?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

function feedbackHeaders() {
  if (!ANALYTICS_KEY) throw new Error('API_KEY_ANALYTICS no configurada')
  return {
    Authorization: `Bearer ${ANALYTICS_KEY}`,
    'Content-Type': 'application/json',
  }
}

export async function getFeedbackStats(): Promise<HomeStats> {
  if (!FEEDBACK_BASE) throw new Error('FEEDBACK_API_URL no configurada')

  const res = await fetch(`${FEEDBACK_BASE}/api/stats`, {
    headers: feedbackHeaders(),
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`Error al obtener stats: ${res.status}`)
  return res.json()
}

export async function getFeedbackReviews(params?: {
  page?: number
  limit?: number
  search?: string
  tipo?: 'product' | 'seller'
}): Promise<PaginatedResponse<Review>> {
  if (!FEEDBACK_BASE) throw new Error('FEEDBACK_API_URL no configurada')

  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.search) searchParams.set('search', params.search)
  if (params?.tipo) searchParams.set('tipo', params.tipo)

  const qs = searchParams.toString()
  const url = `${FEEDBACK_BASE}/api/reviews${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    headers: feedbackHeaders(),
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`Error al obtener reseñas: ${res.status}`)
  return res.json()
}

// ── Payments App (stats) ──

export async function getPaymentsStats(): Promise<PaymentsStats> {
  if (!PAYMENTS_BASE) throw new Error('NEXT_PUBLIC_PAYMENTS_API_URL no configurada')
  if (!PAYMENTS_KEY)  throw new Error('PAYMENTS_API_KEY no configurada')
    
  const res = await fetch(`${PAYMENTS_BASE}/api/admin/stats`, {
    headers: {
      'x-api-key': PAYMENTS_KEY,
      ...(PAYMENTS_BYPASS ? { 'x-vercel-protection-bypass': PAYMENTS_BYPASS } : {}),
    },
    next: { revalidate: 60 },
  })


  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Error al obtener stats de pagos: ${res.status}`)
  }
  return res.json()
}