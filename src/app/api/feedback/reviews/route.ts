import { getFeedbackReviews } from '@/lib/api'

export async function GET() {
  const first = await getFeedbackReviews({ page: 1, limit: 1000 })
  const allData = [...first.data]

  if (first.totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        getFeedbackReviews({ page: i + 2, limit: 1000 }).catch(() => null)
      )
    )
    for (const r of rest) {
      if (r) allData.push(...r.data)
    }
  }

  return Response.json(allData)
}
