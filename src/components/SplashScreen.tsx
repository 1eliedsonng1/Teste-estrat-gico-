import { useEffect, useState } from 'react'
import { useSetting } from '@/hooks/useData'
import { Flame } from 'lucide-react'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const { value: splashConfig } = useSetting('splash')
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const duration = (splashConfig?.duration as number) ?? 3000
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 600)
    const finishTimer = setTimeout(() => { setVisible(false); onFinish() }, duration)
    return () => { clearTimeout(fadeTimer); clearTimeout(finishTimer) }
  }, [splashConfig, onFinish])

  if (!visible) return null

  const title = (splashConfig?.title as string) ?? 'Chapa Quente'
  const subtitle = (splashConfig?.subtitle as string) ?? 'Sabor que aquece a alma'
  const imageUrl = (splashConfig?.image_url as string) ?? ''

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: imageUrl
          ? `url(${imageUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, oklch(0.2 0.05 30) 0%, oklch(0.45 0.2 35) 50%, oklch(0.6 0.22 45) 100%)'
      }}
    >
      {!imageUrl && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      <div className="relative z-10 flex flex-col items-center gap-6 text-white text-center px-8">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 shadow-2xl">
          <Flame className="w-12 h-12 text-orange-300" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">{title}</h1>
          <p className="mt-2 text-lg text-white/80 font-medium">{subtitle}</p>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[0,1,2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-white/40 absolute bottom-8">by Nexorium Group LLC</p>
      </div>
    </div>
  )
}
