import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Review, Product } from '@/lib/supabase'
import { Star, Flame } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

type ReviewWithProduct = Review & { product?: Product }

export default function AvaliacoesPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: revs } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (!revs) { setLoading(false); return }
      const productIds = [...new Set(revs.map(r => r.product_id))]
      const { data: prods } = await supabase.from('products').select('id, name, image_url').in('id', productIds)
      const prodMap = Object.fromEntries((prods || []).map(p => [p.id, p]))
      setReviews(revs.map(r => ({ ...r, product: prodMap[r.product_id] })))
      setLoading(false)
    }
    load()
  }, [])

  const avgOverall = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Avaliações</h1>
        <p className="text-sm text-muted-foreground">O que os nossos clientes dizem</p>
      </div>

      {/* Summary */}
      {!loading && reviews.length > 0 && (
        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 mb-8">
          <div className="text-center">
            <div className="text-5xl font-black text-orange-600">{avgOverall.toFixed(1)}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgOverall) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />)}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold">{reviews.length} avaliações</p>
            <p className="text-sm text-muted-foreground">Média geral de satisfação</p>
            {avgOverall >= 4 && (
              <p className="text-sm text-orange-600 flex items-center gap-1 mt-1"><Flame className="w-3 h-3" /> Excelente reputação!</p>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-3">
        {loading
          ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Ainda sem avaliações. Seja o primeiro!</p>
            </div>
          ) : reviews.map(r => (
            <div key={r.id} className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-start gap-3">
                {r.product?.image_url && (
                  <Link to={`/produto/${r.product_id}`} className="shrink-0">
                    <img src={r.product.image_url} alt={r.product?.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-semibold text-sm">{r.reviewer_name}</span>
                      {r.product?.name && (
                        <Link to={`/produto/${r.product_id}`} className="block text-xs text-muted-foreground hover:text-orange-600 transition-colors">{r.product.name}</Link>
                      )}
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />)}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.created_at).toLocaleDateString('pt-MZ')}</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
