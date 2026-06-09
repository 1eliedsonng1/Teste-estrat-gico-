import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Upload, Users, Calendar, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function ReservasPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', party_size: '2',
    date: '', time: '', notes: ''
  })
  const [depositFile, setDepositFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [reservationId, setReservationId] = useState<string | null>(null)

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setSubmitting(true)

    let proofUrl = null
    if (depositFile) {
      const fileName = `deposit_${Date.now()}.${depositFile.name.split('.').pop()}`
      const { data: up } = await supabase.storage.from('proofs').upload(fileName, depositFile)
      if (up) {
        const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(fileName)
        proofUrl = urlData.publicUrl
      }
    }

    const { data, error } = await supabase.from('reservations').insert({
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      party_size: parseInt(form.party_size) || 2,
      reservation_date: form.date,
      reservation_time: form.time,
      notes: form.notes || null,
      deposit_proof_url: proofUrl
    }).select().single()

    if (error) { toast.error('Erro ao fazer reserva'); setSubmitting(false); return }
    setReservationId(data.id)
    setDone(true)
    setSubmitting(false)
  }

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Reserva Enviada!</h2>
      {reservationId && <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded mb-4 inline-block">#{reservationId.slice(0,8).toUpperCase()}</p>}
      <p className="text-muted-foreground mb-2">A sua reserva está <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 border">Pendente</Badge></p>
      <p className="text-sm text-muted-foreground mt-4">Entraremos em contacto pelo telefone fornecido para confirmar a sua reserva.</p>
      <Button className="mt-8 bg-orange-500 hover:bg-orange-600 text-white border-0" onClick={() => { setDone(false); setForm({ name: '', phone: '', email: '', party_size: '2', date: '', time: '', notes: '' }); setDepositFile(null) }}>
        Nova Reserva
      </Button>
    </div>
  )

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Fazer Reserva</h1>
        <p className="text-sm text-muted-foreground">Reserve a sua mesa com antecedência</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dados de Contacto</h3>
        <Input placeholder="Nome completo *" value={form.name} onChange={e => update('name', e.target.value)} />
        <Input placeholder="Telefone *" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
        <Input placeholder="Email (opcional)" type="email" value={form.email} onChange={e => update('email', e.target.value)} />

        <Separator />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Detalhes da Reserva</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="date" value={form.date} min={minDate} onChange={e => update('date', e.target.value)} className="pl-10" />
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="time" value={form.time} onChange={e => update('time', e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="number" min="1" max="50" placeholder="Número de pessoas *" value={form.party_size} onChange={e => update('party_size', e.target.value)} className="pl-10" />
        </div>

        <Textarea placeholder="Notas especiais (preferências, alergias, etc.)" value={form.notes} onChange={e => update('notes', e.target.value)} className="min-h-20" />

        <Separator />
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Sinal de Pagamento</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Para confirmar a reserva, recomendamos o envio de um sinal de pagamento. Entre em contacto para obter os dados de pagamento.
          </p>
          <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${depositFile ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border bg-muted/20 hover:bg-muted/40'}`}>
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => { if (e.target.files?.[0]) setDepositFile(e.target.files[0]) }} />
            <Upload className={`w-6 h-6 mb-1 ${depositFile ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className="text-sm">{depositFile ? depositFile.name : 'Upload comprovativo (opcional)'}</span>
          </label>
        </div>

        <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white border-0 font-semibold text-base mt-2" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Confirmar Reserva'}
        </Button>
      </div>
    </div>
  )
}
