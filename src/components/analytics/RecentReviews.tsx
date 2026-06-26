'use client'

import { MessageSquare, Star, Clock, ArrowUpDown } from 'lucide-react'
import type { Review } from '@/lib/api'

interface Props {
  reviews: Review[]
  title: string
  sortBy: 'date' | 'rating'
  onSortChange: (s: 'date' | 'rating') => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function RecentReviews({ reviews, title, sortBy, onSortChange }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          {title}
        </h3>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
          {(['date', 'rating'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-[var(--muted)] border border-[var(--border)] text-gray-900 dark:text-gray-300 hover:bg-[var(--muted)]'
              }`}
              title={s === 'date' ? 'Ordenar por fecha (más recientes primero)' : 'Ordenar por calificación (mejor puntuadas primero)'}
            >
              {s === 'date' ? 'Fecha' : 'Rating'}
            </button>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
          No hay reseñas recientes
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--foreground)] truncate">
                      {r.targetName ?? '—'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0 px-1.5 py-0.5 rounded bg-[var(--muted)]">
                      {r.tipo === 'product' ? 'Producto' : 'Vendedor'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < r.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {r.comentario}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span>por {r.userName ?? 'Usuario'}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(r.fecha)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
