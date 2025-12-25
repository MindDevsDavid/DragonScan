'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, BookOpen } from 'lucide-react'

export default function NuevaSeriePage() {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('ongoing')
  const [portadaFile, setPortadaFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Generar vista previa de la imagen seleccionada
  useEffect(() => {
    if (portadaFile) {
      const url = URL.createObjectURL(portadaFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [portadaFile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let coverUrl = ''

      // 1. Subir imagen de portada a Supabase Storage si existe
      if (portadaFile) {
        // Generar nombre único para el archivo
        const fileExt = portadaFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `portadas/${fileName}`

        // Subir archivo a Supabase Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('series-covers') // Nombre del bucket en Supabase
          .upload(filePath, portadaFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Error al subir la imagen: ${uploadError.message}`)
        }

        // Obtener URL pública de la imagen
        const { data: publicUrlData } = supabase.storage
          .from('series-covers')
          .getPublicUrl(filePath)

        coverUrl = publicUrlData.publicUrl
      }

      // 2. Guardar serie en Supabase
      const { data, error: dbError } = await supabase
        .from('series')
        .insert([
          {
            title: titulo,
            description: descripcion,
            status: estado,
            cover_url: coverUrl,
            chapters: []
          }
        ])
        .select()
        .single()

      if (dbError) throw dbError

      alert(`¡Serie "${titulo}" creada exitosamente!`)
      router.push('/admin')

    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Link>
          <h1 className="mt-4 text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-accent" />
            Crear Nueva Serie
          </h1>
          <p className="mt-2 text-gray-400">
            Añade una nueva serie de manhwa. Los capítulos los agregarás después.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-gray-800/50 p-6">
          {error && (
            <div className="rounded-lg bg-red-500/20 p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Campo: Título */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Título de la Serie *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 focus:border-accent focus:outline-none"
              placeholder="Ej: El Reino de la Niebla"
            />
          </div>

          {/* Vista previa de la portada seleccionada */}
          {previewUrl && (
            <div className="mt-4 mb-6 max-w-xs">
              <div className="text-sm text-gray-500 mb-2">Vista previa de la portada:</div>
              <img 
                src={previewUrl} 
                alt="Vista previa de la portada"
                className="rounded-lg w-full h-auto max-h-64 object-cover border border-gray-700"
              />
            </div>
          )}

          {/* Campo: Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 focus:border-accent focus:outline-none"
              placeholder="Describe de qué trata la serie..."
            />
          </div>

          {/* Campo: Estado */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 focus:border-accent focus:outline-none"
            >
              <option value="ongoing">En curso</option>
              <option value="completed">Completada</option>
              <option value="hiatus">En pausa</option>
            </select>
          </div>

          {/* Campo: Portada */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Portada (opcional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex cursor-pointer items-center space-x-3 rounded-lg border border-dashed border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-900">
                <Upload className="h-5 w-5" />
                <span>{portadaFile ? portadaFile.name : 'Subir imagen'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPortadaFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {portadaFile && (
                <button
                  type="button"
                  onClick={() => setPortadaFile(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Eliminar
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Recomendado: 600×800 px. Formatos: JPG, PNG, WEBP.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link
              href="/admin"
              className="rounded-lg px-6 py-3 font-medium text-gray-300 hover:text-white"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-8 py-3 font-bold hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Serie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}