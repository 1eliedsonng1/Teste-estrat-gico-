import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import type { Payment } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import FileUpload from '@/components/ui/file-upload'
import MapPicker from '@/components/ui/map-picker'

type Step = 'info' | 'payment' | 'proof' | 'done'

interface LocationData {
  lat: number
  lng: number
  address: string
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('info')
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedMethod, setSelectedMethod] = useState<Payment | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', notes: ''
  })
  const [location, setLocation] = useState<LocationData | null>(null)

  useEffect(() => {
    if (items.length === 0 && step !== 'done') navigate('/carrinho')
    supabase.from('payments').select('*').eq('active', true).then(({ data }) => {
      if (data) setPayments(data)
    })
  }, [items, navigate, step])

  const updateForm = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleNextStep = () => {
    if (step === 'info') {
      if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
        toast.error('Preencha nome, telefone e morada')
        return
      }
      setStep('payment')
    } else if (step === 'payment') {
      if (!selectedMethod) { toast.error('Escolha um método de pagamento'); return }
      setStep('proof')
    }
  }

  const handleSubmit = async () => {
    if (!proofUrl) {
      toast.error('Envie o comprovativo de pagamento antes de confirmar')
      return
    }
    setSubmitting(true)

    const orderItems = items.map(i => ({
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: i.product.price,
      subtotal: i.product.price * i.quantity
    }))

    const { data: order, error } = await supabase.from('orders').insert({
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      customer_address: form.address,
      customer_lat: location?.lat ?? null,
      customer_lng: location?.lng ?? null,
      customer_location_address: location?.address ?? null,
      items: orderItems,
      total,
      payment_method: selectedMethod!.method,
      payment_proof_url: proofUrl,
      notes: form.notes || null
    }).select().single()

    if (error) {
      console.error('Order insert error:', error)
      toast.error('Erro ao finalizar pedido: ' + error.message)
      setSubmitting(false)
      return
    }

    // Update order count and popularity for products
    for (const item of items) {
      await supabase.from('products').update({
        order_count: item.product.order_count + item.quantity,
        popularity_score: (item.product.popularity_score ?? 0) + item.quantity * 5
      }).eq('id', item.product.id)
    }

    // Log to admin_logs
    await supabase.from('admin_logs').insert({
      action: 'new_order',
      entity: 'orders',
      entity_id: order.id,
      details: { total, items_count: items.length, customer_phone: form.phone }
    })

    setOrderId(order.id)
    clearCart()
    setStep('done')
    setSubmitting(false)
    toast.success('Pedido confirmado com sucesso!')
  }

  if (step === 'done') return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Pedido Confirmado!</h2>
      <p className="text-muted-foreground mb-2">Obrigado pelo seu pedido.</p>
      {orderId && <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded mb-6 inline-block">#{orderId.slice(0,8).toUpperCase()}</p>}
      <p className="text-sm text-muted-foreground mb-8">Vamos processar o seu pedido e entrar em contacto pelo telefone fornecido.</p>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white border-0">
          Voltar ao Início
        </Button>
        <Button variant="outline" onClick={() => navigate('/encomendas')}>Ver Encomendas</Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => step === 'info' ? navigate('/carrinho') : setStep(prev => prev === 'proof' ? 'payment' : 'info')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Finalizar Compra</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['info','payment','proof'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s ? 'bg-orange-500 text-white' : ((['info','payment','proof'] as const).indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground')}`}>
              {i + 1}
            </div>
            {i < 2 && <div className="h-px flex-1 bg-border min-w-6" />}
          </div>
        ))}
      </div>

      {/* Step: Info */}
      {step === 'info' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-4">Dados de Entrega</h2>
          <Input placeholder="Nome completo *" value={form.name} onChange={e => updateForm('name', e.target.value)} />
          <Input placeholder="Telefone *" type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
          <Input placeholder="Email (opcional)" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} />
          <Input placeholder="Morada completa *" value={form.address} onChange={e => updateForm('address', e.target.value)} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Localização de Entrega</p>
            <p className="text-xs text-muted-foreground">Clique no mapa para marcar o local exacto de entrega.</p>
            <MapPicker value={location} onChange={setLocation} />
          </div>
          <Input placeholder="Notas adicionais (opcional)" value={form.notes} onChange={e => updateForm('notes', e.target.value)} />
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-4">Método de Pagamento</h2>
          <div className="space-y-3">
            {payments.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedMethod(p)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${selectedMethod?.id === p.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-border bg-card hover:bg-accent/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold capitalize">
                      {p.method === 'mpesa' ? 'M-Pesa (Vodacom)' : p.method === 'emola' ? 'E-Mola (Movitel)' : 'Transferência Bancária'}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.holder_name} · {p.account_number}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMethod?.id === p.id ? 'border-orange-500 bg-orange-500' : 'border-muted-foreground'}`}>
                    {selectedMethod?.id === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedMethod && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="text-sm font-medium mb-2">Dados para pagamento:</p>
              <p className="text-sm"><span className="text-muted-foreground">Titular:</span> {selectedMethod.holder_name}</p>
              <p className="text-sm"><span className="text-muted-foreground">Número/Conta:</span> {selectedMethod.account_number}</p>
              <Separator className="my-2" />
              <p className="text-base font-bold">Total: {total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
            </div>
          )}
        </div>
      )}

      {/* Step: Proof — robust upload */}
      {step === 'proof' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-2">Comprovativo de Pagamento</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Após efectuar o pagamento de <strong>{total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</strong> via {selectedMethod?.method === 'mpesa' ? 'M-Pesa' : selectedMethod?.method === 'emola' ? 'E-Mola' : 'Banco'}, envie o comprovativo.
          </p>

          <FileUpload
            onUpload={(url) => {
              setProofUrl(url)
              toast.success('Comprovativo recebido!')
            }}
            onClear={() => setProofUrl(null)}
            value={proofUrl}
            disabled={submitting}
          />

          {!proofUrl && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
              <Badge variant="secondary" className="text-xs">Nota</Badge>
              <span>Sem comprovativo, pode continuar para confirmar o pedido, mas o processamento será mais lento.</span>
            </div>
          )}
        </div>
      )}

      {/* Order Summary */}
      <div className="mt-6 border border-border rounded-xl p-4 bg-muted/20 space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">Resumo do Pedido</p>
        {items.map(i => (
          <div key={i.product.id} className="flex justify-between text-sm">
            <span>{i.product.name} ×{i.quantity}</span>
            <span>{(i.product.price * i.quantity).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-orange-600">{total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
        </div>
      </div>

      {/* Action */}
      <div className="mt-6">
        {step !== 'proof' ? (
          <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white border-0 font-semibold text-base" onClick={handleNextStep}>
            Continuar
          </Button>
        ) : (
          <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white border-0 font-semibold text-base" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
              </>
            ) : (
              'Confirmar Pedido'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
