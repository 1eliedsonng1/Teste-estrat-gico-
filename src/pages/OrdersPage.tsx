import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Package } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  preparing: { label: 'Em Preparação', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-700 border-green-200' },
  delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [searched, setSearched] = useState(false)

  const searchOrders = async () => {
    if (!phone.trim()) return
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').eq('customer_phone', phone.trim()).order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
    setSearched(true)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Minhas Encomendas</h1>
        <p className="text-sm text-muted-foreground">Pesquise pelo número de telefone usado no pedido</p>
      </div>

      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Número de telefone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchOrders()}
            className="pl-10"
          />
        </div>
        <button
          onClick={searchOrders}
          className="px-5 h-9 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Pesquisar
        </button>
      </div>

      {loading && searched && (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {!loading && searched && orders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhuma encomenda encontrada para este número.</p>
        </div>
      )}

      {!loading && searched && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(order => {
            const st = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-muted text-muted-foreground' }
            const items = Array.isArray(order.items) ? order.items : []
            return (
              <div key={order.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0,8).toUpperCase()}</p>
                    <p className="font-semibold text-sm mt-0.5">{order.customer_name}</p>
                  </div>
                  <Badge className={`${st.color} border text-xs shrink-0`}>{st.label}</Badge>
                </div>
                <div className="space-y-1">
                  {items.map((item: { product_name: string; quantity: number; subtotal: number }, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                      <span>{item.product_name} ×{item.quantity}</span>
                      <span>{(item.subtotal ?? 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('pt-MZ')}</span>
                  <span className="font-bold text-orange-600">{order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Insira o número de telefone para ver as suas encomendas</p>
        </div>
      )}
    </div>
  )
}
