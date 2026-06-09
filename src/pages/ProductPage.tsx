import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Product, Review } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { Star, Flame, ShoppingCart, ArrowLeft, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: p } = await supabase.from('products').select('*').eq('id', id).single()
      const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
      if (p) {
        const rList = revs || []
        const avg = rList.length ? rList.reduce((s, r) => s + r.rating, 0) / rList.length : 0
        setProduct({ ...p, avg_rating: parseFloat(avg.toFixed(1)), review_count: rList.length })
      }
      setReviews(revs || [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product)
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const handleSubmitReview = async () => {
    if (!id || !reviewName.trim()) { toast.error('Insira o seu nome'); return }
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      product_id: id,
      reviewer_name: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim() || null
    })
    if (error) { toast.error('Erro ao enviar avaliação'); setSubmitting(false); return }
    
    // Update popularity
    await supabase.from('products').update({ popularity_score: (product?.popularity_score ?? 0) + 3 }).eq('id', id)
    
    toast.success('Avaliação enviada! Obrigado!')
    setReviewName(''); setReviewComment(''); setReviewRating(5); setShowReviewForm(false)
    setSubmitting(false)
    
    // Reload reviews
    const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
    setReviews(revs || [])
    if (product && revs) {
      const avg = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 0
      setProduct(prev => prev ? { ...prev, avg_rating: parseFloat(avg.toFixed(1)), review_count: revs.length } : prev)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )

  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
      <p className="text-muted-foreground">Produto não encontrado</p>
      <Button className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
    </div>
  )

  const avgRating = product.avg_rating ?? 0
  const isPopular = (product.popularity_score ?? 0) >= 70

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Image */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-6">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        {isPopular && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-orange-500 text-white border-0 gap-1">
              <Flame className="w-3 h-3" /> Popular
            </Badge>
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Indisponível</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
          <Badge variant="outline" className="shrink-0 capitalize">{product.category}</Badge>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-orange-600">
            {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
          </span>
          {product.old_price && (
            <span className="text-base text-muted-foreground line-through">
              {product.old_price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
            ))}
          </div>
          <span className="text-sm font-medium">{avgRating > 0 ? avgRating : '—'}</span>
          <span className="text-sm text-muted-foreground">({product.review_count ?? 0} avaliações)</span>
          {isPopular && (
            <span className="text-sm text-orange-500 font-medium flex items-center gap-1">
              <Flame className="w-3 h-3" /> Muito popular
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Sobre este prato</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{product.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {product.available ? (
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0 h-12 text-base font-semibold" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" /> Adicionar ao Carrinho
            </Button>
          ) : (
            <Button disabled className="flex-1 h-12">Indisponível</Button>
          )}
          <Button variant="outline" className="h-12" onClick={() => setShowReviewForm(!showReviewForm)}>
            <Star className="w-4 h-4 mr-2" /> Avaliar
          </Button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
            <h3 className="font-semibold">Deixar Avaliação</h3>
            <Input placeholder="Seu nome" value={reviewName} onChange={e => setReviewName(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Nota:</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`w-6 h-6 transition-colors ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea placeholder="Comentário (opcional)..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="min-h-20" />
            <div className="flex gap-2">
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0" onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Reviews */}
        <div>
          <h3 className="font-semibold mb-4">Avaliações ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Ainda sem avaliações. Seja o primeiro!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="border border-border rounded-xl p-3 bg-card">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{r.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground/60 mt-1">{new Date(r.created_at).toLocaleDateString('pt-MZ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
