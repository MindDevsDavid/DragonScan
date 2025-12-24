'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, BookOpen } from 'lucide-react'

export default function NuevaSeriePage() {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('ongoing')
  const [portadaFile, setPortadaFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Subir imagen de portada a Cloudflare R2
      let coverUrl = ''
      if (portadaFile) {
        // POR AHORA: Solo guardamos el nombre. En el PASO 3 subiremos realmente.
        coverUrl = `portadas/${Date.now()}_${portadaFile.name}`
      }

      // 2. Guardar serie en Supabase
      const { data, error: dbError } = await supabase
        .from('series')
        .insert([
          {
            title: titulo,
            description: descripcion,
            status: estado,
            cover_url: coverUrl, // Temporal
            chapters: [] // Array vacío de capítulos
          }
        ])
        .select()
        .single()

      if (dbError) throw dbError

      alert(`¡Serie "${titulo}" creada!`)
      router.push('/admin') // Volver al panel

    } catch (err: any) {
      setError(err.message)
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
              Recomendado: 600×800 px. La subiremos en el siguiente paso.
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

        {/* Nota sobre capítulos */}
        <div className="mt-8 rounded-lg bg-blue-900/20 p-4 text-sm">
          <p className="text-blue-300">
            💡 Los capítulos se agregarán después desde la página de la serie.
            Por ahora solo creamos la ficha básica.
          </p>
        </div>
      </div>
    </div>
  )
}