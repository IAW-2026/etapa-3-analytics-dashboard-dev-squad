// Labels y colores de estado compartidos entre ShippingAnalyticsClient y OperationalTables.
// Único lugar de verdad: si se agrega un estado nuevo o cambia un label, se edita acá.

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'En preparación',
  IN_TRANSIT: 'En camino',
  DELIVERED: 'Entregado',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: '#facc15',
  PREPARING: '#3b82f6',
  IN_TRANSIT: '#a855f7',
  DELIVERED: '#22c55e',
}

export const CARRIER_LABELS: Record<string, string> = {
  MAIL: 'Correo',
  PICKUP: 'Retiro en sucursal',
}