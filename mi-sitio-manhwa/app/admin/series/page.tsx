'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Edit, Trash2, Plus, Eye, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react'

interface Serie {
  id: number
  title: string
  description: string
  status: string
  cover_url: string
  chapters: any[]
  created_at: string
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Serie[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadSeries()
  }, [])

  const checkUserAndLoadSeries = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    // Verificar rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    setUserRole(profile.role)
    loadSeries()
  }

  const loadSeries = async () => {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSeries(data)
    }
    setLoading(false)
  }

  const deleteSerie = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta serie? Esta acción no se puede deshacer.')) {
      return
    }

    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', id)

    if (!error) {
      setSeries(series.filter(s => s.id !== id))
    }
  }

  // Calcular estadísticas por estado de serie
  const totalSeries = series.length
  const seriesByStatus = {
    completadas: series.filter(s => s.status === 'completed').length,
    enCurso: series.filter(s => s.status === 'ongoing').length,
    pausadas: series.filter(s => s.status === 'hiatus').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header de Admin */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-gray-400">Gestión de Series • Rol: Admin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/series" className="text-gray-300 hover:text-white text-sm">
                Ver sitio público
              </Link>
              <Link 
                href="/admin" 
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
              >
                Volver al panel
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header con acciones */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Series</h1>
            <p className="text-gray-400">Administra todas las series del catálogo</p>
          </div>
          
          <div className="flex gap-4">
            <Link 
              href="/admin/series/nueva" 
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold hover:bg-orange-600 transition"
            >
              <Plus className="h-5 w-5" />
              Nueva Serie
            </Link>
          </div>
        </div>

        {/* Estadísticas de Admin - ACTUALIZADAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Series</p>
                <p className="text-2xl font-bold">{totalSeries}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalSeries === 1 ? '1 serie' : `${totalSeries} series`}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          {/* CAMBIADO: Series Completadas */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Series Completadas</p>
                <p className="text-2xl font-bold">{seriesByStatus.completadas}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seriesByStatus.completadas === 1 ? '1 serie finalizada' : `${seriesByStatus.completadas} series finalizadas`}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          {/* CAMBIADO: Series en Curso */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Series en Curso</p>
                <p className="text-2xl font-bold">{seriesByStatus.enCurso}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seriesByStatus.enCurso === 1 ? '1 serie activa' : `${seriesByStatus.enCurso} series activas`}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          {/* CAMBIADO: Series Pausadas */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Series Pausadas</p>
                <p className="text-2xl font-bold">{seriesByStatus.pausadas}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seriesByStatus.pausadas === 1 ? '1 serie en pausa' : `${seriesByStatus.pausadas} series en pausa`}
                </p>
              </div>
              <PauseCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Tabla de series con controles */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">Todas las Series ({totalSeries})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="p-4 text-left">Título</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-left">Capítulos</th>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {series.map((serie) => {
                  const chapterCount = Array.isArray(serie.chapters) ? serie.chapters.length : 0
                  const statusBadge = {
                    ongoing: {
                      class: 'bg-yellow-500/20 text-yellow-300',
                      icon: PlayCircle,
                      label: 'En curso'
                    },
                    completed: {
                      class: 'bg-green-500/20 text-green-300',
                      icon: CheckCircle,
                      label: 'Completada'
                    },
                    hiatus: {
                      class: 'bg-gray-500/20 text-gray-300',
                      icon: PauseCircle,
                      label: 'En pausa'
                    },
                  }
                  
                  const statusConfig = statusBadge[serie.status as keyof typeof statusBadge] || statusBadge.ongoing
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={serie.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{serie.title}</div>
                          <div className="text-sm text-gray-400 line-clamp-1 max-w-md">
                            {serie.description || 'Sin descripción'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusConfig.class}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                          {chapterCount}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(serie.created_at).toLocaleDateString('es')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link 
                            href={`/series/${serie.id}`} 
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                            title="Ver pública"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link 
                            href={`/admin/series/${serie.id}/editar`} 
                            className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteSerie(serie.id)}
                            className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {series.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-700" />
              <h3 className="mt-4 text-xl font-bold">No hay series</h3>
              <p className="mt-2 text-gray-400 mb-6">
                Aún no has creado ninguna serie.
              </p>
              <Link 
                href="/admin/series/nueva" 
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold hover:bg-orange-600 transition"
              >
                <Plus className="h-5 w-5" />
                Crear primera serie
              </Link>
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <div className="mt-8 rounded-lg bg-blue-900/20 p-4">
          <div className="flex items-center">
            <div className="mr-3">
              <span className="text-blue-400">💡</span>
            </div>
            <div>
              <p className="text-sm text-blue-300">
                Como administrador, puedes editar o eliminar cualquier serie. 
                Los cambios se reflejarán inmediatamente en el sitio público.
              </p>
              <p className="text-sm text-blue-400/80 mt-1">
                <strong>Resumen:</strong> {seriesByStatus.completadas} completadas • {seriesByStatus.enCurso} en curso • {seriesByStatus.pausadas} en pausa
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}