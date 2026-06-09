import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, Order, Reservation, Review, Payment, NavbarItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Package, ShoppingCart, Calendar, Star, Settings, BarChart3,
  Plus, Pencil, Trash2, Eye, EyeOff, Flame, ChevronDown, ChevronUp, Menu, Image as FileImage, MapPin
} from 'lucide-react'
import { MapViewer } from '@/components/ui/map-picker'

type Tab = 'overview' | 'products' | 'orders' | 'reservations' | 'reviews' | 'payments' | 'settings' | 'navbar'

const ADMIN_PASSWORD = '@NG2007#$'

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('cq_admin') === '1')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<Tab>('overview')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('cq_admin', '1')
      setAuthed(true)
      toast.success('Bem-vindo ao Painel Admin!')
    } else {
      toast.error('Senha incorreta')
    }
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Chapa Quente</p>
        </div>
        <Input type="password" placeholder="Senha de administrador" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0" onClick={handleLogin}>Entrar</Button>
      </div>
    </div>
  )

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'products', label: 'Produtos', icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'Pedidos', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'reservations', label: 'Reservas', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reviews', label: 'Avaliações', icon: <Star className="w-4 h-4" /> },
    { id: 'payments', label: 'Pagamentos', icon: <Settings className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
    { id: 'navbar', label: 'Navbar', icon: <Menu className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold leading-none">Painel Admin</h1>
              <p className="text-xs text-muted-foreground">Chapa Quente</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem('cq_admin'); setAuthed(false) }} className="text-xs text-muted-foreground">Sair</Button>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 pb-px scrollbar-none">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'reservations' && <ReservationsTab />}
        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'navbar' && <NavbarTab />}
      </div>
    </div>
  )
}

/* =========================================
   OVERVIEW TAB
=========================================*/
function OverviewTab() {
  const [stats, setStats] = useState({ products: 0, orders: 0, reservations: 0, reviews: 0, revenue: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, o, r, rev] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, total, status'),
        supabase.from('reservations').select('id', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact' })
      ])
      const orders = o.data || []
      const revenue = orders.filter((o: { status: string }) => o.status !== 'cancelled').reduce((s: number, o: { total: number }) => s + o.total, 0)
      const pending = orders.filter((o: { status: string }) => o.status === 'pending').length
      setStats({ products: p.count ?? 0, orders: orders.length, reservations: r.count ?? 0, reviews: rev.count ?? 0, revenue, pending })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Produtos', value: stats.products, icon: <Package className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Pedidos', value: stats.orders, icon: <ShoppingCart className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20' },
    { label: 'Pendentes', value: stats.pending, icon: <ShoppingCart className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20' },
    { label: 'Reservas', value: stats.reservations, icon: <Calendar className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
    { label: 'Avaliações', value: stats.reviews, icon: <Star className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20' },
    { label: 'Receita', value: stats.revenue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }), icon: <BarChart3 className="w-5 h-5" />, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Visão Geral</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="border border-border rounded-xl p-4 bg-card">
            {loading ? <Skeleton className="h-10 w-full" /> : (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
                <div className="font-bold text-xl">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================
   PRODUCTS TAB
=========================================*/
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editing?.name || !editing?.price) { toast.error('Nome e preço obrigatórios'); return }
    setSaving(true)
    if (editing.id) {
      const { error } = await supabase.from('products').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); setSaving(false); return }
      toast.success('Produto atualizado!')
    } else {
      const { error } = await supabase.from('products').insert({ ...editing })
      if (error) { toast.error('Erro ao criar'); setSaving(false); return }
      toast.success('Produto criado!')
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Produto eliminado')
    load()
  }

  const handleToggle = async (p: Product) => {
    await supabase.from('products').update({ available: !p.available }).eq('id', p.id)
    load()
  }

  const BLANK: Partial<Product> = { name: '', description: '', price: 0, old_price: undefined, image_url: '', category: 'pratos', available: true, popularity_score: 0 }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Produtos</h2>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={() => setEditing(BLANK)}>
          <Plus className="w-4 h-4 mr-1" /> Novo Produto
        </Button>
      </div>

      {editing !== null && (
        <div className="border border-border rounded-xl p-4 mb-6 bg-card space-y-3">
          <h3 className="font-semibold">{editing.id ? 'Editar Produto' : 'Novo Produto'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Nome *" value={editing.name ?? ''} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} />
            <Input placeholder="Imagem URL" value={editing.image_url ?? ''} onChange={e => setEditing(p => ({ ...p!, image_url: e.target.value }))} />
            <Input type="number" placeholder="Preço *" value={editing.price ?? ''} onChange={e => setEditing(p => ({ ...p!, price: parseFloat(e.target.value) }))} />
            <Input type="number" placeholder="Preço antigo (opcional)" value={editing.old_price ?? ''} onChange={e => setEditing(p => ({ ...p!, old_price: e.target.value ? parseFloat(e.target.value) : undefined }))} />
            <select value={editing.category ?? 'pratos'} onChange={e => setEditing(p => ({ ...p!, category: e.target.value }))} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              {['pratos','snacks','bebidas','sobremesas','geral'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
            <Input type="number" placeholder="Popularidade (0-100)" value={editing.popularity_score ?? 0} onChange={e => setEditing(p => ({ ...p!, popularity_score: parseInt(e.target.value) }))} />
          </div>
          <Textarea placeholder="Descrição / Biografia do produto" value={editing.description ?? ''} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))} className="min-h-24" />
          <div className="flex items-center gap-2">
            <Switch checked={editing.available ?? true} onCheckedChange={v => setEditing(p => ({ ...p!, available: v }))} />
            <span className="text-sm">Disponível</span>
          </div>
          <div className="flex gap-2">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />) : (
          products.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" /> : <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  {!p.available && <Badge variant="secondary" className="text-xs shrink-0">Inativo</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{p.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} · {p.category}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(p)} className={`p-1.5 rounded-lg transition-colors ${p.available ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20' : 'text-muted-foreground hover:bg-muted'}`}>
                  {p.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* =========================================
   ORDERS TAB
=========================================*/
const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] as const
const STATUS_LABELS: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Em Preparação', ready: 'Pronto', delivered: 'Entregue', cancelled: 'Cancelado' }
const STATUS_COLORS: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700 border-yellow-200', confirmed: 'bg-blue-100 text-blue-700 border-blue-200', preparing: 'bg-orange-100 text-orange-700 border-orange-200', ready: 'bg-green-100 text-green-700 border-green-200', delivered: 'bg-gray-100 text-gray-600 border-gray-200', cancelled: 'bg-red-100 text-red-700 border-red-200' }

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success('Status atualizado!')
    load()
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="all">Todos</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
          filtered.length === 0 ? <p className="text-center py-12 text-muted-foreground">Nenhum pedido</p> :
          filtered.map(order => {
            const st = STATUS_LABELS[order.status]
            const sc = STATUS_COLORS[order.status]
            const isExp = expanded === order.id
            const items = Array.isArray(order.items) ? order.items : []
            return (
              <div key={order.id} className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(isExp ? null : order.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0,8).toUpperCase()}</p>
                      <Badge className={`${sc} border text-xs`}>{st}</Badge>
                    </div>
                    <p className="font-medium text-sm">{order.customer_name} · {order.customer_phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-orange-600">{order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-MZ')}</p>
                  </div>
                  {isExp ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
                {isExp && (
                  <div className="border-t border-border p-3 space-y-3 bg-muted/20">
                    <div className="space-y-1">
                      {items.map((item: { product_name: string; quantity: number; subtotal: number }, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.product_name} ×{item.quantity}</span>
                          <span>{(item.subtotal ?? 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Morada:</span> {order.customer_address}</p>
                      {order.customer_email && <p><span className="text-muted-foreground">Email:</span> {order.customer_email}</p>}
                      <p><span className="text-muted-foreground">Pagamento:</span> {order.payment_method}</p>
                      {order.payment_proof_url ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Comprovativo:</span>
                            <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                              <FileImage className="w-3 h-3" /> Abrir / Download
                            </a>
                          </div>
                          {order.payment_proof_url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                            <img src={order.payment_proof_url} alt="Comprovativo" className="max-h-48 rounded-lg border border-border object-contain" loading="lazy" />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-600 font-medium">Sem comprovativo de pagamento</p>
                      )}
                    </div>

                    {(order.customer_lat != null && order.customer_lng != null) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <MapPin className="w-4 h-4" /> Localização de Entrega
                        </div>
                        <MapViewer
                          lat={order.customer_lat}
                          lng={order.customer_lng}
                          address={order.customer_location_address ?? undefined}
                          height={200}
                        />
                        {order.customer_location_address && (
                          <p className="text-sm text-muted-foreground">{order.customer_location_address}</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {ORDER_STATUSES.filter(s => s !== order.status).map(s => (
                        <Button key={s} size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatus(order.id, s)}>
                          {STATUS_LABELS[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

/* =========================================
   RESERVATIONS TAB
=========================================*/
const RES_STATUS_LABELS: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', rejected: 'Rejeitado', waiting: 'Aguardando' }
const RES_STATUS_COLORS: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700 border-yellow-200', confirmed: 'bg-green-100 text-green-700 border-green-200', rejected: 'bg-red-100 text-red-700 border-red-200', waiting: 'bg-blue-100 text-blue-700 border-blue-200' }

function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('reservations').select('*').order('reservation_date', { ascending: true })
    setReservations(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: string) => {
    await supabase.from('reservations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success('Status atualizado!')
    load()
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Reservas</h2>
      <div className="space-y-3">
        {loading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) :
          reservations.length === 0 ? <p className="text-center py-12 text-muted-foreground">Nenhuma reserva</p> :
          reservations.map(r => {
            const st = RES_STATUS_LABELS[r.status] ?? r.status
            const sc = RES_STATUS_COLORS[r.status] ?? 'bg-muted text-muted-foreground'
            return (
              <div key={r.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{r.customer_phone} · {r.party_size} pessoa(s)</p>
                  </div>
                  <Badge className={`${sc} border text-xs shrink-0`}>{st}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Data:</span> {new Date(r.reservation_date + 'T12:00:00').toLocaleDateString('pt-MZ')} às {r.reservation_time}</p>
                  {r.notes && <p><span className="text-muted-foreground">Notas:</span> {r.notes}</p>}
                  {r.deposit_proof_url && (
                    <a href={r.deposit_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">Ver Sinal de Pagamento</a>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['confirmed','rejected','waiting','pending'] as const).filter(s => s !== r.status).map(s => (
                    <Button key={s} size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatus(r.id, s)}>
                      {RES_STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

/* =========================================
   REVIEWS TAB
=========================================*/
function ReviewsTab() {
  const [reviews, setReviews] = useState<(Review & { product_name?: string })[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data: revs } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (!revs) { setLoading(false); return }
    const pIds = [...new Set(revs.map(r => r.product_id))]
    const { data: prods } = await supabase.from('products').select('id, name').in('id', pIds)
    const pMap = Object.fromEntries((prods || []).map(p => [p.id, p.name]))
    setReviews(revs.map(r => ({ ...r, product_name: pMap[r.product_id] })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id)
    toast.success('Avaliação removida')
    load()
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Avaliações</h2>
        {reviews.length > 0 && <Badge variant="outline">Média: ⭐ {avg.toFixed(1)}</Badge>}
      </div>
      <div className="space-y-3">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
          reviews.length === 0 ? <p className="text-center py-12 text-muted-foreground">Nenhuma avaliação</p> :
          reviews.map(r => (
            <div key={r.id} className="border border-border rounded-xl p-3 bg-card flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{r.reviewer_name}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />)}
                  </div>
                </div>
                {r.product_name && <p className="text-xs text-muted-foreground">{r.product_name}</p>}
                {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">{new Date(r.created_at).toLocaleString('pt-MZ')}</p>
              </div>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

/* =========================================
   PAYMENTS TAB
=========================================*/
function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [editing, setEditing] = useState<Payment | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('payments').select('*')
    setPayments(data || [])
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('payments').update({ holder_name: editing.holder_name, account_number: editing.account_number, active: editing.active }).eq('id', editing.id)
    toast.success('Dados de pagamento atualizados!')
    setSaving(false)
    setEditing(null)
    load()
  }

  const METHOD_LABELS: Record<string, string> = { mpesa: 'M-Pesa (Vodacom)', emola: 'E-Mola (Movitel)', banco: 'Banco' }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Configurar Pagamentos</h2>
      <div className="space-y-4">
        {payments.map(p => (
          <div key={p.id} className="border border-border rounded-xl p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{METHOD_LABELS[p.method] ?? p.method}</h3>
              <div className="flex items-center gap-2">
                <Switch checked={p.active} onCheckedChange={async v => { await supabase.from('payments').update({ active: v }).eq('id', p.id); load() }} />
                <span className="text-xs text-muted-foreground">{p.active ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            {editing?.id === p.id ? (
              <div className="space-y-3">
                <Input placeholder="Titular" value={editing.holder_name} onChange={e => setEditing(prev => ({ ...prev!, holder_name: e.target.value }))} />
                <Input placeholder="Número / Conta / NIB" value={editing.account_number} onChange={e => setEditing(prev => ({ ...prev!, account_number: e.target.value }))} />
                <div className="flex gap-2">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm"><span className="text-muted-foreground">Titular:</span> {p.holder_name}</p>
                <p className="text-sm"><span className="text-muted-foreground">Número/Conta:</span> {p.account_number}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing(p)}><Pencil className="w-3 h-3 mr-1" /> Editar</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================
   SETTINGS TAB
=========================================*/
function SettingsTab() {
  const [restaurant, setRestaurant] = useState<Record<string, unknown>>({})
  const [splash, setSplash] = useState<Record<string, unknown>>({})
  const [about, setAbout] = useState<Record<string, unknown>>({})
  const [contacts, setContacts] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        data.forEach(s => {
          if (s.key === 'restaurant') setRestaurant(s.value)
          if (s.key === 'splash') setSplash(s.value)
          if (s.key === 'about') setAbout(s.value)
          if (s.key === 'contacts') setContacts(s.value)
        })
      }
    }
    load()
  }, [])

  const saveSetting = async (key: string, value: Record<string, unknown>) => {
    setSaving(key)
    await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    toast.success('Configurações salvas!')
    setSaving(null)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-xl font-bold">Configurações</h2>

      <section className="border border-border rounded-xl p-4 bg-card space-y-3">
        <h3 className="font-semibold">Splash Screen</h3>
        <Input placeholder="Título" value={(splash.title as string) ?? ''} onChange={e => setSplash(p => ({ ...p, title: e.target.value }))} />
        <Input placeholder="Subtítulo" value={(splash.subtitle as string) ?? ''} onChange={e => setSplash(p => ({ ...p, subtitle: e.target.value }))} />
        <Input placeholder="URL da imagem de fundo (opcional)" value={(splash.image_url as string) ?? ''} onChange={e => setSplash(p => ({ ...p, image_url: e.target.value }))} />
        <Input type="number" placeholder="Duração (ms)" value={(splash.duration as number) ?? 3000} onChange={e => setSplash(p => ({ ...p, duration: parseInt(e.target.value) }))} />
        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={() => saveSetting('splash', splash)} disabled={saving === 'splash'}>{saving === 'splash' ? 'Salvando...' : 'Salvar'}</Button>
      </section>

      <section className="border border-border rounded-xl p-4 bg-card space-y-3">
        <h3 className="font-semibold">Restaurante</h3>
        <Input placeholder="Nome do restaurante" value={(restaurant.name as string) ?? ''} onChange={e => setRestaurant(p => ({ ...p, name: e.target.value }))} />
        <Input placeholder="Slogan" value={(restaurant.tagline as string) ?? ''} onChange={e => setRestaurant(p => ({ ...p, tagline: e.target.value }))} />
        <Input placeholder="Telefone" value={(restaurant.phone as string) ?? ''} onChange={e => setRestaurant(p => ({ ...p, phone: e.target.value }))} />
        <Input placeholder="Email" value={(restaurant.email as string) ?? ''} onChange={e => setRestaurant(p => ({ ...p, email: e.target.value }))} />
        <Input placeholder="Endereço" value={(restaurant.address as string) ?? ''} onChange={e => setRestaurant(p => ({ ...p, address: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Input type="time" placeholder="Abertura" value={(restaurant.opening_time as string) ?? '08:00'} onChange={e => setRestaurant(p => ({ ...p, opening_time: e.target.value }))} />
          <Input type="time" placeholder="Fecho" value={(restaurant.closing_time as string) ?? '22:00'} onChange={e => setRestaurant(p => ({ ...p, closing_time: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={(restaurant.is_open as boolean) ?? true} onCheckedChange={v => setRestaurant(p => ({ ...p, is_open: v }))} />
          <span className="text-sm">{restaurant.is_open ? 'Restaurante Aberto' : 'Restaurante Fechado'}</span>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={() => saveSetting('restaurant', restaurant)} disabled={saving === 'restaurant'}>{saving === 'restaurant' ? 'Salvando...' : 'Salvar'}</Button>
      </section>

      <section className="border border-border rounded-xl p-4 bg-card space-y-3">
        <h3 className="font-semibold">Sobre Nós</h3>
        <Input placeholder="Título" value={(about.title as string) ?? ''} onChange={e => setAbout(p => ({ ...p, title: e.target.value }))} />
        <Textarea placeholder="Conteúdo / História do restaurante" value={(about.content as string) ?? ''} onChange={e => setAbout(p => ({ ...p, content: e.target.value }))} className="min-h-32" />
        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={() => saveSetting('about', about)} disabled={saving === 'about'}>{saving === 'about' ? 'Salvando...' : 'Salvar'}</Button>
      </section>

      <section className="border border-border rounded-xl p-4 bg-card space-y-3">
        <h3 className="font-semibold">Contactos</h3>
        <Input placeholder="WhatsApp (com código do país)" value={(contacts.whatsapp as string) ?? ''} onChange={e => setContacts(p => ({ ...p, whatsapp: e.target.value }))} />
        <Input placeholder="Telefone" value={(contacts.phone as string) ?? ''} onChange={e => setContacts(p => ({ ...p, phone: e.target.value }))} />
        <Input placeholder="Instagram (sem @)" value={(contacts.instagram as string) ?? ''} onChange={e => setContacts(p => ({ ...p, instagram: e.target.value }))} />
        <Input placeholder="Facebook (username)" value={(contacts.facebook as string) ?? ''} onChange={e => setContacts(p => ({ ...p, facebook: e.target.value }))} />
        <Input placeholder="TikTok (sem @)" value={(contacts.tiktok as string) ?? ''} onChange={e => setContacts(p => ({ ...p, tiktok: e.target.value }))} />
        <Input placeholder="Email" type="email" value={(contacts.email as string) ?? ''} onChange={e => setContacts(p => ({ ...p, email: e.target.value }))} />
        <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={() => saveSetting('contacts', contacts)} disabled={saving === 'contacts'}>{saving === 'contacts' ? 'Salvando...' : 'Salvar'}</Button>
      </section>
    </div>
  )
}

/* =========================================
   NAVBAR TAB
=========================================*/
function NavbarTab() {
  const [items, setItems] = useState<NavbarItem[]>([])
  const [editing, setEditing] = useState<NavbarItem | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('navbar_items').select('*').order('sort_order')
    setItems(data || [])
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('navbar_items').update({ label: editing.label, path: editing.path, sort_order: editing.sort_order, visible: editing.visible }).eq('id', editing.id)
    toast.success('Item atualizado!')
    setSaving(false)
    setEditing(null)
    load()
  }

  const toggleVisible = async (item: NavbarItem) => {
    await supabase.from('navbar_items').update({ visible: !item.visible }).eq('id', item.id)
    load()
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Configurar Navbar</h2>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="border border-border rounded-xl p-3 bg-card">
            {editing?.id === item.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Label" value={editing.label} onChange={e => setEditing(p => ({ ...p!, label: e.target.value }))} />
                  <Input placeholder="Path" value={editing.path} onChange={e => setEditing(p => ({ ...p!, path: e.target.value }))} />
                  <Input type="number" placeholder="Ordem" value={editing.sort_order} onChange={e => setEditing(p => ({ ...p!, sort_order: parseInt(e.target.value) }))} />
                </div>
                <div className="flex gap-2">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0" size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.path} · Ordem {item.sort_order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleVisible(item)} className={`p-1.5 rounded-lg ${item.visible ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20' : 'text-muted-foreground hover:bg-muted'}`}>
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
