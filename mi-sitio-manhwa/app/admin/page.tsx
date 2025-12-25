'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Upload, 
  Users, 
  BarChart3, 
  LogOut,
  AlertCircle,
  Plus,
  FileText,
  Eye,
  List,
  Settings,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSeries: 0,
    seriesCompletadas: 0,
    seriesEnCurso: 0,
    seriesPausadas: 0
  })
  const [recentSeries, setRecentSeries] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadData()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    setUser(profile)
  }

  const loadData = async () => {
    try {
      // Cargar series
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('*, chapters')
        .order('created_at', { ascending: false })
        .limit(5)

      if (seriesError) throw seriesError

      // Calcular estadísticas por estado
      const seriesCompletadas = series?.filter(s => s.status === 'completed').length || 0
      const seriesEnCurso = series?.filter(s => s.status === 'ongoing').length || 0
      const seriesPausadas = series?.filter(s => s.status === 'hiatus').length || 0

      setStats({
        totalSeries: series?.length || 0,
        seriesCompletadas,
        seriesEnCurso,
        seriesPausadas
      })

      setRecentSeries(series || [])
      
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Cargando panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header del Admin */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-gray-400">
                  Hola, {user?.username || user?.email?.split('@')[0]} • Rol: Admin
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition text-sm"
              >
                Ver sitio público
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 transition text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-6 py-8">
        {/* Estadísticas REALES - ACTUALIZADAS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Estadísticas por Estado</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Series</p>
                  <p className="text-3xl font-bold">{stats.totalSeries}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalSeries === 1 ? '1 serie' : `${stats.totalSeries} series`}
                  </p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            {/* CAMBIADO: Series Completadas */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Series Completadas</p>
                  <p className="text-3xl font-bold">{stats.seriesCompletadas}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.seriesCompletadas === 1 ? '1 serie finalizada' : `${stats.seriesCompletadas} series finalizadas`}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>

            {/* CAMBIADO: Series en Curso */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Series en Curso</p>
                  <p className="text-3xl font-bold">{stats.seriesEnCurso}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.seriesEnCurso === 1 ? '1 serie activa' : `${stats.seriesEnCurso} series activas`}
                  </p>
                </div>
                <PlayCircle className="h-10 w-10 text-yellow-500" />
              </div>
            </div>

            {/* CAMBIADO: Series Pausadas */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Series Pausadas</p>
                  <p className="text-3xl font-bold">{stats.seriesPausadas}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.seriesPausadas === 1 ? '1 serie en pausa' : `${stats.seriesPausadas} series en pausa`}
                  </p>
                </div>
                <PauseCircle className="h-10 w-10 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/series/nueva"
              className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-accent hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-blue-900/30 p-3 group-hover:bg-blue-900/50">
                <Plus className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold">Crear Nueva Serie</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Añade una nueva serie al catálogo
                </p>
              </div>
            </Link>

            <Link
              href="/admin/series"
              className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-accent hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-green-900/30 p-3 group-hover:bg-green-900/50">
                <List className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold">Gestionar Series</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Ver y administrar todas las series
                </p>
              </div>
            </Link>

            <Link
              href="/series"
              className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-accent hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-purple-900/30 p-3 group-hover:bg-purple-900/50">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold">Ver Catálogo Público</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Ver cómo ven los lectores el sitio
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Series Recientes */}
        {recentSeries.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Series Recientes</h2>
              <Link 
                href="/admin/series" 
                className="text-sm text-accent hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSeries.map((serie) => {
                const chapterCount = Array.isArray(serie.chapters) ? serie.chapters.length : 0
                const statusConfig = {
                  ongoing: { 
                    label: 'En curso', 
                    bgColor: 'bg-yellow-500/20', 
                    textColor: 'text-yellow-300',
                    icon: PlayCircle 
                  },
                  completed: { 
                    label: 'Completada', 
                    bgColor: 'bg-green-500/20', 
                    textColor: 'text-green-300',
                    icon: CheckCircle 
                  },
                  hiatus: { 
                    label: 'En pausa', 
                    bgColor: 'bg-gray-500/20', 
                    textColor: 'text-gray-300',
                    icon: PauseCircle 
                  }
                }
                const config = statusConfig[serie.status as keyof typeof statusConfig] || statusConfig.ongoing
                const StatusIcon = config.icon
                
                return (
                  <div 
                    key={serie.id} 
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-accent transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{serie.title}</h3>
                        <div className={`text-sm px-3 py-1 rounded-full inline-flex items-center ${config.bgColor} ${config.textColor}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {serie.description || 'Sin descripción'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {chapterCount} capítulo{chapterCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/series/${serie.id}`}
                          className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
                          title="Ver pública"
                        >
                          <Eye className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/admin/series/${serie.id}`}
                          className="text-xs bg-accent hover:bg-orange-600 px-3 py-1 rounded"
                          title="Administrar"
                        >
                          Gestionar
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-3">Resumen por Estados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="font-medium mb-1">Completadas</h4>
                  <p className="text-sm text-gray-300">
                    {stats.seriesCompletadas} {stats.seriesCompletadas === 1 ? 'serie' : 'series'} finalizadas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 mb-3">
                    <PlayCircle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h4 className="font-medium mb-1">En Curso</h4>
                  <p className="text-sm text-gray-300">
                    {stats.seriesEnCurso} {stats.seriesEnCurso === 1 ? 'serie' : 'series'} activas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-500/20 mb-3">
                    <PauseCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="font-medium mb-1">En Pausa</h4>
                  <p className="text-sm text-gray-300">
                    {stats.seriesPausadas} {stats.seriesPausadas === 1 ? 'serie' : 'series'} en espera
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-6">
                Puedes cambiar el estado de una serie desde la página de gestión de cada serie.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}