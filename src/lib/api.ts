const BASE_URL = 'https://zapasya.vercel.app/'

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
  const url = `${BASE_URL}/api/orders${queryString ? `?${queryString}` : ''}`

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

  const res = await fetch(`${BASE_URL}/api/orders?id=${id}`, {
    headers: { 'buyer-key': secret },
  })

  if (!res.ok) {
    if (res.status === 403) throw new Error('Clave inválida')
    if (res.status === 404) throw new Error('Order not found')
    throw new Error(`Error API: ${res.status}`)
  }

  return res.json()
}
