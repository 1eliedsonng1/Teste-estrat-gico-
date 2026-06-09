import { useSetting } from '@/hooks/useData'
import { Skeleton } from '@/components/ui/skeleton'
import { Phone, MessageCircle, Mail } from 'lucide-react'

export default function ContactosPage() {
  const { value: contacts, loading } = useSetting('contacts')

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  )

  const whatsapp = (contacts?.whatsapp as string) ?? ''
  const phone = (contacts?.phone as string) ?? ''
  const instagram = (contacts?.instagram as string) ?? ''
  const facebook = (contacts?.facebook as string) ?? ''
  const tiktok = (contacts?.tiktok as string) ?? ''
  const email = (contacts?.email as string) ?? ''

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )

  const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )

  const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.24 8.24 0 004.82 1.54V6.82a4.85 4.85 0 01-1.05-.13z"/>
    </svg>
  )

  const contactLinks = [
    whatsapp && {
      label: 'WhatsApp',
      href: `https://wa.me/${whatsapp.replace(/\D/g,'')}`,
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600',
    },
    phone && {
      label: phone,
      href: `tel:${phone}`,
      icon: <Phone className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    instagram && {
      label: '@' + instagram,
      href: `https://instagram.com/${instagram}`,
      icon: <InstagramIcon />,
      color: 'bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500',
    },
    facebook && {
      label: facebook,
      href: `https://facebook.com/${facebook}`,
      icon: <FacebookIcon />,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    tiktok && {
      label: '@' + tiktok,
      href: `https://tiktok.com/@${tiktok}`,
      icon: <TikTokIcon />,
      color: 'bg-black hover:bg-zinc-800',
    },
    email && {
      label: email,
      href: `mailto:${email}`,
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-orange-500 hover:bg-orange-600',
    }
  ].filter(Boolean)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Contactos</h1>
        <p className="text-sm text-muted-foreground">Entre em contacto connosco</p>
      </div>

      <div className="space-y-3">
        {contactLinks.map((c, i) => c && (
          <a
            key={i}
            href={c.href}
            target={c.href.startsWith('http') ? '_blank' : '_self'}
            rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className={`flex items-center gap-4 p-4 rounded-xl text-white transition-all active:scale-95 ${c.color}`}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {c.icon}
            </div>
            <span className="font-semibold">{c.label}</span>
          </a>
        ))}
      </div>

      {contactLinks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Contactos ainda não configurados.</p>
        </div>
      )}
    </div>
  )
}
