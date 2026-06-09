import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, X, FileImage, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.pdf']

function isValidFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `Arquivo muito grande. Máximo: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXT.includes(ext)) return `Tipo inválido. Use: ${ALLOWED_EXT.join(', ')}`
  if (!ALLOWED_TYPES.includes(file.type)) return 'Tipo de arquivo não permitido.'
  return null
}

function getFileIcon(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-500" />
  return <FileImage className="w-8 h-8 text-blue-500" />
}

export default function FileUpload({
  onUpload,
  value,
  onClear,
  bucket = 'proofs',
  folder = 'orders',
  disabled = false,
}: {
  onUpload: (url: string) => void
  value?: string | null
  onClear?: () => void
  bucket?: string
  folder?: string
  disabled?: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(value ?? null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setError(null)
    const validation = isValidFile(selected)
    if (validation) {
      setError(validation)
      toast.error(validation)
      return
    }
    setFile(selected)
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(selected)
    } else {
      setPreview(null)
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: upError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (upError) {
        console.error('Upload error:', upError)
        setError(upError.message)
        toast.error('Falha no upload: ' + upError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      const url = urlData.publicUrl
      setUploadedUrl(url)
      onUpload(url)
      toast.success('Comprovativo enviado com sucesso!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(msg)
      toast.error('Erro no upload: ' + msg)
    } finally {
      setUploading(false)
    }
  }, [file, bucket, folder, onUpload])

  const handleClear = useCallback(() => {
    setFile(null)
    setPreview(null)
    setUploadedUrl(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onClear?.()
  }, [onClear])

  // If already uploaded (value passed or uploaded)
  const displayUrl = uploadedUrl || value
  if (displayUrl) {
    return (
      <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/50 dark:bg-green-950/10">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700">Comprovativo enviado</p>
            <p className="text-xs text-green-600/70 truncate">{displayUrl.split('/').pop()}</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-xs h-7" onClick={handleClear} disabled={disabled}>
            <X className="w-3 h-3 mr-1" /> Alterar
          </Button>
        </div>
        {displayUrl.match(/\.(jpg|jpeg|png)$/) && (
          <img src={displayUrl} alt="Comprovativo" className="mt-3 rounded-lg max-h-48 object-contain border border-green-200" loading="lazy" />
        )}
      </div>
    )
  }

  // Drag-and-drop + click area
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="space-y-3">
      <div
        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-colors p-6 ${
          dragOver
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/10'
            : error
            ? 'border-red-300 bg-red-50/30 dark:bg-red-950/10'
            : file
            ? 'border-blue-300 bg-blue-50/30 dark:bg-blue-950/10'
            : 'border-border bg-muted/20 hover:bg-muted/40'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          const dropped = e.dataTransfer.files?.[0]
          if (dropped) {
            setError(null)
            const validation = isValidFile(dropped)
            if (validation) {
              setError(validation)
              toast.error(validation)
              return
            }
            setFile(dropped)
            if (dropped.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = () => setPreview(reader.result as string)
              reader.readAsDataURL(dropped)
            } else {
              setPreview(null)
            }
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            {getFileIcon(file)}
            <p className="text-sm font-medium text-center line-clamp-1">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-8 h-8 ${error ? 'text-red-400' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium text-center">Arraste ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground">JPG, JPEG, PNG, PDF até 5MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="space-y-3">
          {preview && (
            <div className="border border-border rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full max-h-56 object-contain" />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Enviar Comprovativo
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={uploading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
