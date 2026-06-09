import { useSetting } from '@/hooks/useData'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame } from 'lucide-react'

export default function SobrePage() {
  const { value: about, loading } = useSetting('about')

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )

  const title = (about?.title as string) ?? 'Sobre o Chapa Quente'
  const content = (about?.content as string) ?? ''
  const team = (about?.team as string) ?? ''
  const images = (about?.images as string[]) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4">{title}</h1>
        {content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {content.split('\n').map((para, i) => para.trim() ? (
              <p key={i} className="text-base leading-relaxed text-foreground/80 mb-4">{para}</p>
            ) : null)}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {images.map((img, i) => (
            <img key={i} src={img} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" loading="lazy" />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">Desenvolvido com ❤️ pela</p>
        <p className="font-bold text-lg mt-1">Nexorium Group LLC</p>
        {team && <p className="text-sm text-muted-foreground mt-1">{team}</p>}
      </div>
    </div>
  )
}
