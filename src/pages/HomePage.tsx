import { useProducts, useSetting } from '@/hooks/useData'
import ProductCard from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Flame, ChefHat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { products, loading } = useProducts()
  const { value: restaurant } = useSetting('restaurant')

  const popular = products.filter(p => (p.popularity_score ?? 0) >= 75 && p.available)
  const available = products.filter(p => p.available)

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Flame className="w-3 h-3 mr-1" /> Restaurante Digital
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              {(restaurant?.name as string) ?? 'Chapa Quente'}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 font-medium">
              {(restaurant?.tagline as string) ?? 'Sabor que aquece a alma'}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/cardapio">
                <Button size="lg" className="bg-white text-orange-700 hover:bg-white/90 font-semibold">
                  <ChefHat className="w-4 h-4 mr-2" /> Ver Cardápio
                </Button>
              </Link>
              <Link to="/reservas">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Fazer Reserva
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Popular Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {popular.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold">Mais Populares</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading
                ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                : popular.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Nosso Cardápio</h2>
            <Link to="/cardapio">
              <Button variant="outline" size="sm">Ver tudo</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : available.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
          {!loading && available.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum produto disponível no momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
