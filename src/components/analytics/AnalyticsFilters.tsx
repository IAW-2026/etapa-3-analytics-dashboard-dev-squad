'use client'

import { Filter } from 'lucide-react'

export type TipoFilter = 'all' | 'product' | 'seller'

interface Props {
  tipo: TipoFilter
  onTipoChange: (t: TipoFilter) => void
}

export default function AnalyticsFilters({ tipo, onTipoChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="flex gap-1.5">
        {(['all', 'product', 'seller'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTipoChange(t)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tipo === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-50 dark:bg-[var(--muted)] border border-[var(--border)] text-black dark:text-gray-300 hover:bg-[var(--muted)]'
            }`}
            title={t === 'all' ? 'Mostrar todas las reseñas' : t === 'product' ? 'Solo reseñas de productos' : 'Solo reseñas de vendedores'}
          >
            {t === 'all' ? 'Todas' : t === 'product' ? 'Productos' : 'Vendedores'}
          </button>
        ))}
      </div>
    </div>
  )
}
