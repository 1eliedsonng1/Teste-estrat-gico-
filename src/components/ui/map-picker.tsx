import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_CENTER = { lat: -25.9667, lng: 32.5833 } // Maputo, MZ

interface LocationData {
  lat: number
  lng: number
  address: string
  formatted_address?: string
}

let mapsPromise: Promise<typeof google> | null = null

function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  if (mapsPromise) return mapsPromise
  if (window.google?.maps) return Promise.resolve(window.google)

  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__gmInit`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Falha ao carregar Google Maps'))
    ;(window as unknown as Record<string, () => void>).__gmInit = () => {
      if (window.google) resolve(window.google)
    }
    document.head.appendChild(script)
  })
  return mapsPromise
}

function reverseGeocode(google: typeof window.google, latLng: google.maps.LatLng): Promise<string> {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        resolve(results[0].formatted_address)
      } else {
        reject(new Error('Não foi possível obter o endereço desta localização'))
      }
    })
  })
}

export default function MapPicker({
  value,
  onChange,
  disabled = false,
}: {
  value?: LocationData | null
  onChange: (loc: LocationData | null) => void
  disabled?: boolean
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<LocationData | null>(value ?? null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey) {
      setError('Chave da API do Google Maps não configurada.')
      setLoading(false)
      return
    }

    let cancelled = false
    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !mapRef.current) return
        const map = new google.maps.Map(mapRef.current, {
          center: value ?? DEFAULT_CENTER,
          zoom: 14,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        })
        mapInstanceRef.current = map

        if (value) {
          const marker = new google.maps.Marker({
            position: { lat: value.lat, lng: value.lng },
            map,
            draggable: false,
          })
          markerRef.current = marker
        }

        map.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || disabled) return
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()

          markerRef.current?.setMap(null)
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            animation: google.maps.Animation.DROP,
          })
          markerRef.current = marker

          try {
            const address = await reverseGeocode(google, e.latLng)
            const loc: LocationData = { lat, lng, address }
            setSelected(loc)
            onChange(loc)
            toast.success('Localização definida!')
          } catch {
            const loc: LocationData = { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
            setSelected(loc)
            onChange(loc)
            toast.error('Não foi possível obter o endereço, mas a localização foi guardada.')
          }
        })

        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Erro ao carregar Google Maps')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [apiKey, disabled, value, onChange])

  const handleClear = useCallback(() => {
    markerRef.current?.setMap(null)
    markerRef.current = null
    setSelected(null)
    onChange(null)
  }, [onChange])

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar mapa...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
          <span className="font-medium">Erro:</span> {error}
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-72 rounded-xl border border-border overflow-hidden"
        style={{ display: error ? 'none' : 'block' }}
      />

      {!error && !loading && (
        <p className="text-xs text-muted-foreground">
          Clique no mapa para escolher a localização de entrega.
        </p>
      )}

      {selected && (
        <div className="border border-green-200 rounded-xl p-3 bg-green-50/50 dark:bg-green-950/10">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-700">{selected.address}</p>
              <p className="text-xs text-green-600/70">
                {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 h-7 text-xs" onClick={handleClear} disabled={disabled}>
              <X className="w-3 h-3 mr-1" /> Alterar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function MapViewer({
  lat,
  lng,
  address,
  height = 240,
}: {
  lat: number
  lng: number
  address?: string
  height?: number
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey) {
      setError('Chave da API do Google Maps não configurada.')
      setLoading(false)
      return
    }
    let cancelled = false
    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !mapRef.current) return
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 16,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        })
        new google.maps.Marker({
          position: { lat, lng },
          map,
          animation: google.maps.Animation.DROP,
        })
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Erro ao carregar Google Maps')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [apiKey, lat, lng])

  return (
    <div className="space-y-2">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar mapa...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
          {error}
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full rounded-xl border border-border overflow-hidden"
        style={{ height, display: error ? 'none' : 'block' }}
      />
      {address && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{address}</span>
        </div>
      )}
    </div>
  )
}
