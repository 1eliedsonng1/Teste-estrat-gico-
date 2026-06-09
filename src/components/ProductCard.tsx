import { Link } from 'react-router-dom'
import type { Product } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { Star, Flame, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const isPopular = (product.popularity_score ?? 0) >= 70

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Image */}
      <Link to={`/produto/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Flame className="w-10 h-10 opacity-20" />
          </div>
        )}
        {isPopular && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-orange-500 text-white border-0 gap-1 text-xs">
              <Flame className="w-3 h-3" /> Popular
            </Badge>
          </div>
        )}
        {product.old_price && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="text-xs border-0">Promoção</Badge>
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Indisponível</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <Link to={`/produto/${product.id}`}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(star => (
            <Star
              key={star}
              className={`w-3 h-3 ${star <= Math.round(product.avg_rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {product.avg_rating ? product.avg_rating.toFixed(1) : '—'} ({product.review_count ?? 0})
          </span>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-bold text-base text-foreground">
              {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
            </div>
            {product.old_price && (
              <div className="text-xs text-muted-foreground line-through">
                {product.old_price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/produto/${product.id}`}>
              <Button variant="outline" size="sm" className="text-xs h-8">Detalhes</Button>
            </Link>
            {product.available && (
              <Button size="sm" className="text-xs h-8 bg-orange-500 hover:bg-orange-600 text-white border-0" onClick={handleAdd}>
                <ShoppingCart className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
