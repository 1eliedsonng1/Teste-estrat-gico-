import { useCart } from '@/context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <ShoppingCart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
      <h2 className="text-xl font-bold mb-2">Carrinho vazio</h2>
      <p className="text-muted-foreground mb-6">Adicione produtos ao carrinho para continuar</p>
      <Link to="/cardapio">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0">
          <ChefHat className="w-4 h-4 mr-2" /> Ver Cardápio
        </Button>
      </Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Carrinho</h1>
        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={clearCart}>
          <Trash2 className="w-3 h-3 mr-1" /> Limpar
        </Button>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.product.id} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card">
            {item.product.image_url ? (
              <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <ChefHat className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-1">{item.product.name}</p>
              <p className="text-sm text-orange-600 font-medium">
                {item.product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 rounded-full"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 rounded-full"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-destructive hover:text-destructive"
                onClick={() => removeItem(item.product.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span className="text-orange-600">{total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white border-0 text-base font-semibold" onClick={() => navigate('/checkout')}>
          Finalizar Compra
        </Button>
        <Link to="/cardapio">
          <Button variant="outline" className="w-full">Continuar Comprando</Button>
        </Link>
      </div>
    </div>
  )
}
