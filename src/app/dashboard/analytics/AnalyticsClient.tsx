'use client'

import { useMemo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Review, HomeStats } from '@/lib/api'
import OverviewCards from '@/components/analytics/OverviewCards'
import RatingChart from '@/components/analytics/RatingChart'
import TrendChart from '@/components/analytics/TrendChart'
import TypeDonut from '@/components/analytics/TypeDonut'
import StatusPie from '@/components/analytics/StatusPie'
import TopProducts from '@/components/analytics/TopProducts'
import TopSellers from '@/components/analytics/TopSellers'
import RecentReviews from '@/components/analytics/RecentReviews'
import AnimatedCard from '@/components/analytics/AnimatedCard'
import AnalyticsFilters, { type TipoFilter } from '@/components/analytics/AnalyticsFilters'

interface Props {
  stats: HomeStats
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
      <div className="h-48 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

type SortBy = 'date' | 'rating'

function aggregateTopByTipo(reviews: Review[], tipo: 'product' | 'seller', limit = 10): { id: string; nombre: string; averageRating: number; totalReviews: number }[] {
  const groups = new Map<string, { name: string; totalRating: number; count: number }>()

  for (const r of reviews) {
    if (r.tipo !== tipo) continue
    const key = r.targetId
    const existing = groups.get(key)
    if (existing) {
      existing.totalRating += r.rating
      existing.count += 1
    } else {
      groups.set(key, { name: r.targetName ?? '—', totalRating: r.rating, count: 1 })
    }
  }

  return Array.from(groups.entries())
    .map(([id, g]) => ({
      id,
      nombre: g.name,
      averageRating: Math.round((g.totalRating / g.count) * 10) / 10,
      totalReviews: g.count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews)
    .slice(0, limit)
}

function getMonthlyTrend(reviews: Review[]): { month: string; count: number }[] {
  const groups = new Map<string, number>()

  for (const r of reviews) {
    const key = r.fecha.slice(0, 7)
    groups.set(key, (groups.get(key) ?? 0) + 1)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      month: format(new Date(key + '-01T12:00:00.000Z'), 'MMM yyyy', { locale: es }),
      count,
    }))
}

function getRatingDistribution(reviews: Review[]): Record<number, number> {
  const dist: Record<number, number> = {}
  for (let i = 1; i <= 5; i++) dist[i] = 0
  for (const r of reviews) dist[r.rating] = (dist[r.rating] ?? 0) + 1
  return dist
}

export default function AnalyticsClient({ stats }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('date')

  useEffect(() => {
    fetch('/api/feedback/reviews')
      .then(r => r.json())
      .then(data => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const publishedReviews = useMemo(
    () => reviews.filter(r => r.estado === 'published'),
    [reviews]
  )

  const filtered = useMemo(() => {
    let r = publishedReviews
    if (tipoFilter !== 'all') {
      r = r.filter(rev => rev.tipo === tipoFilter)
    }
    return r
  }, [publishedReviews, tipoFilter])

  const filteredAll = useMemo(() => {
    let r = reviews
    if (tipoFilter !== 'all') {
      r = r.filter(rev => rev.tipo === tipoFilter)
    }
    return r
  }, [reviews, tipoFilter])

  const sortedReviews = useMemo(() => {
    const r = [...filtered]
    if (sortBy === 'date') {
      r.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    } else {
      r.sort((a, b) => b.rating - a.rating || new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    }
    return r
  }, [filtered, sortBy])

  const topProducts = useMemo(() => aggregateTopByTipo(filtered, 'product', 10), [filtered])
  const topSellers = useMemo(() => aggregateTopByTipo(filtered, 'seller', 10), [filtered])
  const trend = useMemo(() => getMonthlyTrend(filtered), [filtered])

  const productCount = filteredAll.filter(r => r.tipo === 'product').length
  const sellerCount = filteredAll.filter(r => r.tipo === 'seller').length
  const published = filteredAll.filter(r => r.estado === 'published').length
  const reported = filteredAll.filter(r => r.estado === 'reported').length
  const removed = filteredAll.filter(r => r.estado === 'removed').length

  const filteredAvg = useMemo(() => {
    if (filtered.length === 0) return 0
    return filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
  }, [filtered])

  const ratingDist = useMemo(() => getRatingDistribution(filtered), [filtered])
  const latest = sortedReviews.slice(0, 5)
  const reviewsTitle = sortBy === 'date' ? 'Reseñas recientes' : 'Mejores reseñas'

  return (
    <div className="flex-1 bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Feedback</h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Métricas y estadísticas de reseñas de la comunidad
              </p>
            </div>
            <AnalyticsFilters
              tipo={tipoFilter}
              onTipoChange={setTipoFilter}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <AnimatedCard index={0}>
          <OverviewCards stats={stats} />
        </AnimatedCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <AnimatedCard index={1}>
                <RatingChart distribution={ratingDist} total={filtered.length} />
              </AnimatedCard>
              <AnimatedCard index={2}>
                <TrendChart data={trend} />
              </AnimatedCard>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              {tipoFilter === 'all' ? (
                <AnimatedCard index={3}>
                  <TypeDonut productCount={productCount} sellerCount={sellerCount} />
                </AnimatedCard>
              ) : (
                <AnimatedCard index={3}>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                        {tipoFilter === 'product' ? 'P' : 'V'}
                      </span>
                      Reseñas de {tipoFilter === 'product' ? 'productos' : 'vendedores'}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-3xl font-bold text-[var(--foreground)]">{filtered.length}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">total de reseñas</p>
                      </div>
                      {filtered.length > 0 && (
                        <div>
                          <p className="text-3xl font-bold text-[var(--foreground)]">{filteredAvg.toFixed(1)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">calificación promedio</p>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              )}
              <AnimatedCard index={4}>
                <StatusPie published={published} reported={reported} removed={removed} />
              </AnimatedCard>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <AnimatedCard index={5}>
                <TopProducts products={topProducts} />
              </AnimatedCard>
              <AnimatedCard index={6}>
                <TopSellers sellers={topSellers} />
              </AnimatedCard>
            </>
          )}
        </div>

        {loading ? (
          <CardSkeleton />
        ) : (
          <AnimatedCard index={7}>
            <RecentReviews
              reviews={latest}
              title={reviewsTitle}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </AnimatedCard>
        )}
      </main>
    </div>
  )
}
