'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Upload, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSeries: 0,
    totalChapters: 0,
    totalUsers: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadStats()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    // Obtener perfil completo
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
    setLoading(false)
  }

  const loadStats = async () => {
    // Aquí cargarás estadísticas reales luego
    // Por ahora datos de ejemplo
    setStats({
      totalSeries: 0,
      totalChapters: 0,
      totalUsers: 1
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Verificando permisos...</div>
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
                className="text-gray-300 hover:text-white transition"
              >
                Ver sitio público
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 transition"
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
        {/* Tarjetas de Estadísticas */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Series</p>
                <p className="text-3xl font-bold">{stats.totalSeries}</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Capítulos</p>
                <p className="text-3xl font-bold">{stats.totalChapters}</p>
              </div>
              <FileText className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Usuarios Registrados</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/series/nueva"
              className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-accent hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-blue-900/30 p-3 group-hover:bg-blue-900/50">
                <Plus className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold">Nueva Serie</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Crea una nueva serie de manhwa
                </p>
              </div>
            </Link>

            <Link
              href="/admin/series"
              className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-accent hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-green-900/30 p-3 group-hover:bg-green-900/50">
                <BookOpen className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold">Gestionar Series</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Ver y editar todas las series
                </p>
              </div>
            </Link>

            <Link
              href="/admin/capitulos/nuevo"
              className="group flex items-center space-x-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-accent hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-orange-900/30 p-3 group-hover:bg-orange-900/50">
                <Upload className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold">Subir Capítulo</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Agrega un nuevo capítulo a una serie
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Aviso de Desarrollo */}
        <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-bold">Panel en Desarrollo</h3>
              <p className="mt-2 text-gray-300">
                Esta es la primera versión del panel de administración. Las funcionalidades 
                se irán implementando en las próximas semanas según el roadmap.
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p className="font-medium">Próximas implementaciones:</p>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                  <li>Formulario para crear nuevas series</li>
                  <li>Sistema de subida de capítulos con imágenes</li>
                  <li>Tablas para gestionar contenido</li>
                  <li>Estadísticas reales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}