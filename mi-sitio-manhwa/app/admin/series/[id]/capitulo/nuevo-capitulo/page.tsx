// app/admin/series/[id]/nuevo-capitulo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, Upload, FileImage, X, BookOpen } from 'lucide-react'

export default function NuevoCapituloPage() {
  const params = useParams()
  const router = useRouter()
  const serieId = params.id as string

  const [serie, setSerie] = useState<any>(null)
  const [titulo, setTitulo] = useState('')
  const [numeroCapitulo, setNumeroCapitulo] = useState(1)
  const [archivos, setArchivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingSerie, setLoadingSerie] = useState(true)

  // Obtener información de la serie
  useEffect(() => {
    const fetchSerie = async () => {
      try {
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .eq('id', serieId)
          .single()

        if (error) throw error
        setSerie(data)
        
        // Calcular el próximo número de capítulo
        const capitulosActuales = Array.isArray(data.chapters) ? data.chapters : []
        setNumeroCapitulo(capitulosActuales.length + 1)
        
      } catch (err) {
        setError('Error al cargar la serie')
      } finally {
        setLoadingSerie(false)
      }
    }

    fetchSerie()
  }, [serieId])

  // Manejar selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const validFiles = newFiles.filter(file => 
        file.type.startsWith('image/') && 
        file.size <= 5 * 1024 * 1024 // 5MB límite
      )

      setArchivos(prev => [...prev, ...validFiles])
      
      // Crear previews
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Eliminar archivo
  const removeFile = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Reordenar archivos
  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...archivos]
    const newPreviews = [...previews]
    
    const [movedFile] = newFiles.splice(fromIndex, 1)
    const [movedPreview] = newPreviews.splice(fromIndex, 1)
    
    newFiles.splice(toIndex, 0, movedFile)
    newPreviews.splice(toIndex, 0, movedPreview)
    
    setArchivos(newFiles)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (archivos.length === 0) {
        throw new Error('Debes subir al menos una página')
      }

      // Array para almacenar URLs de las páginas
      const paginasUrls: string[] = []

      // 1. Subir cada página al bucket de capítulos
      for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `series/${serieId}/capitulo-${numeroCapitulo}/${fileName}`

        // Subir archivo
        const { error: uploadError } = await supabase.storage
          .from('capitulos') // Bucket para capítulos
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Error al subir la página ${i + 1}: ${uploadError.message}`)
        }

        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('capitulos')
          .getPublicUrl(filePath)

        paginasUrls.push(publicUrlData.publicUrl)
      }

      // 2. Crear objeto del capítulo
      const nuevoCapitulo = {
        numero: numeroCapitulo,
        titulo: titulo || `Capítulo ${numeroCapitulo}`,
        fecha_subida: new Date().toISOString(),
        paginas: paginasUrls,
        total_paginas: paginasUrls.length
      }

      // 3. Obtener capítulos actuales de la serie
      const { data: serieData } = await supabase
        .from('series')
        .select('chapters')
        .eq('id', serieId)
        .single()

      const capitulosActuales = Array.isArray(serieData?.chapters) ? serieData.chapters : []
      const nuevosCapitulos = [...capitulosActuales, nuevoCapitulo]

      // 4. Actualizar la serie con el nuevo capítulo
      const { error: updateError } = await supabase
        .from('series')
        .update({
          chapters: nuevosCapitulos
        })
        .eq('id', serieId)

      if (updateError) throw updateError

      alert(`¡Capítulo ${numeroCapitulo} subido exitosamente!`)
      router.push(`/series/${serieId}`)

    } catch (err: any) {
      setError(err.message || 'Error al subir el capítulo')
    } finally {
      setLoading(false)
    }
  }

  if (loadingSerie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/serie/${serieId}`} 
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la serie
          </Link>
          <h1 className="mt-4 text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-accent" />
            Subir Nuevo Capítulo
          </h1>
          <p className="mt-2 text-gray-400">
            {serie?.title} - Capítulo {numeroCapitulo}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-gray-800/50 p-6">
          {error && (
            <div className="rounded-lg bg-red-500/20 p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Información del capítulo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Número del Capítulo *
              </label>
              <input
                type="number"
                required
                value={numeroCapitulo}
                onChange={(e) => setNumeroCapitulo(parseInt(e.target.value))}
                min="1"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Título (opcional)
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3"
                placeholder={`Capítulo ${numeroCapitulo}`}
              />
            </div>
          </div>

          {/* Subida de archivos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Páginas del Capítulo *
            </label>
            
            {/* Dropzone */}
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-900">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG o WEBP (MAX. 5MB por imagen)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">
                  Páginas ({archivos.length}) - Orden: Arrastra para reorganizar
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div 
                      key={index}
                      className="relative group"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                        moveFile(fromIndex, index)
                      }}
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-800">
                        <img 
                          src={preview} 
                          alt={`Página ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 bg-red-500/80 rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs p-1 text-center">
                        Página {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Sube las páginas en orden. Puedes reorganizarlas arrastrando.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link
              href={`/serie/${serieId}`}
              className="rounded-lg px-6 py-3 font-medium text-gray-300 hover:text-white"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || archivos.length === 0}
              className="rounded-lg bg-accent px-8 py-3 font-bold hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Subiendo...' : `Subir Capítulo ${numeroCapitulo}`}
            </button>
          </div>
        </form>

        {/* Notas */}
        <div className="mt-8 rounded-lg bg-blue-900/20 p-4 text-sm">
          <p className="text-blue-300">
            💡 Las imágenes se subirán a la carpeta: series/{serieId}/capitulo-{numeroCapitulo}/
          </p>
          <p className="text-blue-300 mt-2">
            📖 El orden de las páginas es importante. Asegúrate de subirlas en el orden correcto.
          </p>
        </div>
      </div>
    </div>
  )
}