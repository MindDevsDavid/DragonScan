'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Edit, Trash2, Plus, Eye, BarChart3, Users, PauseCircle, Calendar, Search, Filter } from 'lucide-react'

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

  // Calcular estadísticas
  const totalSeries = series.length
  const totalChapters = series.reduce((acc, serie) => 
    acc + (Array.isArray(serie.chapters) ? serie.chapters.length : 0), 0
  )
  const seriesByStatus = {
    ongoing: series.filter(s => s.status === 'ongoing').length,
    hiatus: series.filter(s => s.status === 'hiatus').length,
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

        {/* Estadísticas de Admin */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Series</p>
                <p className="text-2xl font-bold">{totalSeries}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Capítulos</p>
                <p className="text-2xl font-bold">{totalChapters}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">En Curso</p>
                <p className="text-2xl font-bold">{seriesByStatus.ongoing}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">En Pausa</p>
                <p className="text-2xl font-bold">{seriesByStatus.hiatus}</p>
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
                    ongoing: 'bg-yellow-500/20 text-yellow-300',
                    completed: 'bg-green-500/20 text-green-300',
                    hiatus: 'bg-gray-500/20 text-gray-300',
                  }

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
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadge[serie.status as keyof typeof statusBadge]}`}>
                          {serie.status === 'ongoing' ? 'En curso' :
                           serie.status === 'completed' ? 'Completada' : 'En pausa'}
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
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                            title="Ver pública"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link 
                            href={`/admin/series/editar/${serie.id}`} 
                            className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteSerie(serie.id)}
                            className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50"
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
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold hover:bg-orange-600"
              >
                <Plus className="h-5 w-5" />
                Crear primera serie
              </Link>
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <div className="mt-8 rounded-lg bg-blue-900/20 p-4">
          <p className="text-sm text-blue-300">
            💡 Como administrador, puedes editar o eliminar cualquier serie. 
            Los cambios se reflejarán inmediatamente en el sitio público.
          </p>
        </div>
      </main>
    </div>
  )
}