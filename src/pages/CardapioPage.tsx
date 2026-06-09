import { useState } from 'react'
import { useProducts } from '@/hooks/useData'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { Star, Flame, Search, ShoppingCart, ChefHat } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = ['todos', 'pratos', 'snacks', 'bebidas', 'sobremesas', 'geral']

export default function CardapioPage() {
  const { products, loading } = useProducts()
  const { addItem } = useCart()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('todos')

  const filtered = products
    .filter(p => p.available)
    .filter(p => activeCategory === 'todos' || p.category === activeCategory)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description ?? '').toLowerCase().includes(search.toLowerCase()))

  const handleAdd = (product: typeof products[0], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} adicionado!`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Cardápio</h1>
        <p className="text-sm text-muted-foreground">Todos os nossos pratos disponíveis</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar pratos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {cat === 'todos' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-xl">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          : filtered.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card hover:bg-accent/30 transition-colors"
              >
                {/* Price */}
                <div className="text-right shrink-0 w-20">
                  <div className="font-bold text-sm text-orange-600">
                    {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                  </div>
                  {product.old_price && (
                    <div className="text-xs text-muted-foreground line-through">
                      {product.old_price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </div>
                  )}
                </div>

                {/* Name + Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/produto/${product.id}`} className="font-semibold text-sm hover:text-orange-600 transition-colors line-clamp-1">
                      {product.name}
                    </Link>
                    {(product.popularity_score ?? 0) >= 70 && (
                      <Flame className="w-3 h-3 text-orange-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(product.avg_rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground">({product.review_count ?? 0})</span>
                  </div>
                </div>

                {/* Thumb + Add */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/produto/${product.id}`}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </Link>
                  <Button size="icon" className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-full" onClick={e => handleAdd(product, e)}>
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
        }
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ChefHat className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum prato encontrado</p>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-muted-foreground text-center mt-6">{filtered.length} prato(s) disponível(is)</p>
      )}
    </div>
  )
}
