'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Edit, Trash2, Plus, Eye, 
  BookOpen, Calendar, BarChart3, 
  ChevronRight, AlertCircle,
  FileText, Share2, Copy,
  CheckCircle, XCircle
} from 'lucide-react'

interface Serie {
  id: number
  title: string
  description: string
  status: string
  cover_url: string
  chapters: any[]
  created_at: string
  updated_at: string
}

export default function AdminSeriePage() {
  const [serie, setSerie] = useState<Serie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const serieId = params.id as string

  useEffect(() => {
    loadData()
  }, [serieId])

  const loadData = async () => {
    try {
      // Verificar autenticación y rol
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      // Cargar serie
      const { data, error: serieError } = await supabase
        .from('series')
        .select('*')
        .eq('id', serieId)
        .single()

      if (serieError) throw serieError
      setSerie(data)

    } catch (err: any) {
      setError(err.message || 'Error al cargar la serie')
    } finally {
      setLoading(false)
    }
  }

  const deleteSerie = async () => {
    if (!confirm('¿Estás seguro de eliminar esta serie? ¡Esta acción no se puede deshacer y eliminará todos los capítulos!')) {
      return
    }

    try {
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', serieId)

      if (error) throw error

      alert('Serie eliminada correctamente')
      router.push('/admin/series')
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la serie')
    }
  }

  const deleteChapter = async (chapterIndex: number, chapterNumber: number) => {
    if (!confirm(`¿Eliminar el capítulo ${chapterNumber}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const updatedChapters = [...serie!.chapters]
      updatedChapters.splice(chapterIndex, 1)

      // Renumerar capítulos
      const renumberedChapters = updatedChapters.map((cap, idx) => ({
        ...cap,
        numero: idx + 1,
        titulo: cap.titulo || `Capítulo ${idx + 1}`
      }))

      const { error } = await supabase
        .from('series')
        .update({ 
          chapters: renumberedChapters,
          updated_at: new Date().toISOString()
        })
        .eq('id', serieId)

      if (error) throw error

      setSerie({ ...serie!, chapters: renumberedChapters })
      alert(`Capítulo ${chapterNumber} eliminado correctamente`)
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el capítulo')
    }
  }

  const copyToClipboard = async () => {
    try {
      const url = `${window.location.origin}/series/${serieId}`
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setError('Error al copiar al portapapeles')
    }
  }

  const navigateToEdit = () => {
    router.push(`/admin/series/${serieId}/editar`)
  }

  const navigateToAddChapter = () => {
    router.push(`/admin/series/${serieId}/capitulo/nuevo-capitulo`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">Cargando serie...</div>
      </div>
    )
  }

  if (!serie) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-400" />
              <span className="text-red-300">Serie no encontrada</span>
            </div>
          </div>
          <Link 
            href="/admin/series" 
            className="inline-flex items-center mt-6 text-accent hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado de series
          </Link>
        </div>
      </div>
    )
  }

  const totalChapters = serie.chapters?.length || 0
  const totalPages = serie.chapters?.reduce((acc, cap) => 
    acc + (Array.isArray(cap.paginas) ? cap.paginas.length : 0), 0
  ) || 0
  const lastUpdated = new Date(serie.updated_at).toLocaleDateString('es-ES')
  const createdDate = new Date(serie.created_at).toLocaleDateString('es-ES')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-gray-400">Gestionando serie</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href={`/series/${serieId}`} 
                className="text-sm text-gray-300 hover:text-white transition"
                target="_blank"
              >
                Ver pública
              </Link>
              <Link 
                href="/admin/series" 
                className="text-sm bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                ← Todas las series
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Información de la serie */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{serie.title}</h1>
              <p className="text-gray-300 mb-4 max-w-2xl">{serie.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  serie.status === 'ongoing' ? 'bg-yellow-500/20 text-yellow-300' :
                  serie.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {serie.status === 'ongoing' ? 'En curso' :
                   serie.status === 'completed' ? 'Completada' : 'En pausa'}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  ID: {serie.id}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={navigateToEdit}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition"
              >
                <Edit className="h-4 w-4" />
                Editar Serie
              </button>
              <button
                onClick={deleteSerie}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar Serie
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Capítulos</p>
                <p className="text-2xl font-bold">{totalChapters}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Páginas totales</p>
                <p className="text-2xl font-bold">{totalPages}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Creada</p>
                <p className="text-lg font-bold">{createdDate}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Última actualización</p>
                <p className="text-lg font-bold">{lastUpdated}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Sección de capítulos */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Capítulos ({totalChapters})</h2>
            <button
              onClick={navigateToAddChapter}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold hover:bg-orange-600 transition"
            >
              <Plus className="h-5 w-5" />
              Añadir Capítulo
            </button>
          </div>

          {totalChapters > 0 ? (
            <div className="bg-gray-800/30 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="p-4 text-left">#</th>
                      <th className="p-4 text-left">Título</th>
                      <th className="p-4 text-left">Páginas</th>
                      <th className="p-4 text-left">Fecha</th>
                      <th className="p-4 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serie.chapters.map((cap, index) => (
                      <tr key={index} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="p-4 font-bold">#{cap.numero || index + 1}</td>
                        <td className="p-4">
                          <div className="font-medium">{cap.titulo || `Capítulo ${cap.numero || index + 1}`}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            {Array.isArray(cap.paginas) ? cap.paginas.length : 0}
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {cap.fecha_subida ? new Date(cap.fecha_subida).toLocaleDateString('es') : 'Sin fecha'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/leer/${serieId}/${cap.numero || index + 1}`}
                              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                              title="Leer capítulo"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteChapter(index, cap.numero || index + 1)}
                              className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition"
                              title="Eliminar capítulo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-8 sm:p-12 text-center">
              <BookOpen className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-gray-700" />
              <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold">No hay capítulos</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-400 text-sm sm:text-base">
                Esta serie aún no tiene capítulos publicados.
              </p>
              <div className="mt-6 sm:mt-8">
                <button
                  onClick={navigateToAddChapter}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 sm:px-8 py-3 font-bold hover:bg-orange-600 transition"
                >
                  <Plus className="h-5 w-5" />
                  Añadir primer capítulo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="rounded-xl border border-gray-800 bg-gradient-to-r from-gray-900/50 to-black/50 p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={navigateToAddChapter}
              className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-accent transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Añadir capítulo</h4>
                  <p className="text-sm text-gray-400 mt-1">Subir nuevo contenido</p>
                </div>
                <Plus className="h-5 w-5 text-accent" />
              </div>
            </button>
            
            <Link
              href={`/series/${serieId}`}
              target="_blank"
              className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-accent transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Ver vista pública</h4>
                  <p className="text-sm text-gray-400 mt-1">Como la ven los lectores</p>
                </div>
                <Eye className="h-5 w-5 text-green-500" />
              </div>
            </Link>
            
            <button
              onClick={copyToClipboard}
              className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-accent transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Copiar enlace</h4>
                  <p className="text-sm text-gray-400 mt-1">Compartir esta serie</p>
                  {copySuccess && (
                    <div className="flex items-center mt-1 text-green-400 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ¡Enlace copiado!
                    </div>
                  )}
                </div>
                {copySuccess ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}