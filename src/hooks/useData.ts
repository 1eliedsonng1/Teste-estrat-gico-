import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useSetting(key: string) {
  const [value, setValue] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', key).single().then(({ data }) => {
      if (data) setValue(data.value as Record<string, unknown>)
      setLoading(false)
    })
  }, [key])

  return { value, loading }
}

export function useProducts() {
  const [products, setProducts] = useState<import('@/lib/supabase').Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: prods, error: e } = await supabase.from('products').select('*').order('popularity_score', { ascending: false })
      if (e) { setError(e.message); setLoading(false); return }
      
      const { data: revs } = await supabase.from('reviews').select('product_id, rating')
      
      const enriched = (prods || []).map(p => {
        const pRevs = (revs || []).filter(r => r.product_id === p.id)
        const avg_rating = pRevs.length ? pRevs.reduce((s, r) => s + r.rating, 0) / pRevs.length : 0
        return { ...p, avg_rating: parseFloat(avg_rating.toFixed(1)), review_count: pRevs.length }
      })
      
      setProducts(enriched)
      setLoading(false)
    }
    load()
  }, [])

  return { products, loading, error }
}
