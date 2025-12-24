import { supabase } from './lib/supabaseClient'
import Link from 'next/link'
import { BookOpen, User, Sparkles, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  // Obtener sesión del usuario (desde el servidor)
  const { data: { session } } = await supabase.auth.getSession()
  let userName = "Invitado"
  
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single()
    userName = profile?.username || session.user.email?.split('@')[0] || "Usuario"
  }

  // Obtener series para estadísticas
  const { data: series } = await supabase
    .from('series')
    .select('id, title, chapters')
    .order('created_at', { ascending: false })
    .limit(5)

  const totalSeries = series?.length || 0
  const totalChapters = series?.reduce((acc, serie) => 
    acc + (Array.isArray(serie.chapters) ? serie.chapters.length : 0), 0
  ) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header Simplificado */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-bold">Mi<span className="text-accent">Manhwa</span></h1>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="font-medium hover:text-accent transition">Inicio</Link>
              <Link href="/series" className="font-medium hover:text-accent transition">Series</Link>
              <Link href="/about" className="font-medium hover:text-accent transition">Acerca de</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {session ? (
                <Link 
                  href="/admin" 
                  className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 font-medium hover:bg-blue-600 transition"
                >
                  <User className="h-4 w-4" />
                  <span>Panel Admin</span>
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 font-medium hover:bg-blue-600 transition"
                >
                  <User className="h-4 w-4" />
                  <span>Ingresar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal - Saludo y Acciones */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Saludo Personalizado */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-900/30 px-6 py-3">
              <Sparkles className="mr-3 h-5 w-5" />
              <span className="text-lg">
                ¡Hola, <span className="font-bold text-accent">{userName}</span>!
              </span>
            </div>
            
            <h2 className="mb-6 text-5xl font-bold leading-tight">
              Bienvenido a tu <span className="text-accent">biblioteca personal</span> de manhwas
            </h2>
            
            <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-300">
              Un espacio para crear, organizar y disfrutar de tus historias favoritas.
            </p>
          </div>

          {/* Tarjetas de Acción */}
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {/* Ver Series */}
            <Link href="/series" className="group">
              <div className="h-full rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-8 transition-all hover:border-accent hover:scale-[1.02]">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Explorar Series</h3>
                  <ArrowRight className="h-6 w-6 text-gray-500 group-hover:text-accent group-hover:translate-x-2 transition" />
                </div>
                <p className="mb-4 text-gray-400">
                  Descubre todas las series disponibles en la plataforma.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{totalSeries} series • {totalChapters} capítulos</span>
                </div>
              </div>
            </Link>

            {/* Crear Nueva Serie (solo para admin) */}
            {session && (
              <Link href="/admin/series/nueva" className="group">
                <div className="h-full rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-8 transition-all hover:border-accent hover:scale-[1.02]">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-bold">Crear Nueva Serie</h3>
                    <ArrowRight className="h-6 w-6 text-accent group-hover:translate-x-2 transition" />
                  </div>
                  <p className="mb-4 text-gray-300">
                    Añade una nueva serie a tu biblioteca. Define título, descripción y estado.
                  </p>
                  <div className="text-sm text-accent/80">
                    Acceso solo para administradores
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Series Recientes (si hay) */}
          {series && series.length > 0 && (
            <div className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Series Recientes</h3>
                <Link href="/series" className="text-primary hover:underline">
                  Ver todas →
                </Link>
              </div>
              
              <div className="grid gap-4">
                {series.map((serie) => (
                  <Link href={`/series/${serie.id}`} key={serie.id}>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-accent transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-bold">{serie.title}</h4>
                          <p className="mt-2 text-sm text-gray-400">
                            {Array.isArray(serie.chapters) ? serie.chapters.length : 0} capítulos
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Si no hay series */}
          {(!series || series.length === 0) && (
            <div className="rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-700" />
              <h3 className="mt-6 text-2xl font-bold">Comienza tu viaje</h3>
              <p className="mx-auto mt-2 max-w-md text-gray-400">
                Aún no hay series en la plataforma. Sé el primero en crear una.
              </p>
              <div className="mt-8">
                <Link 
                  href="/admin/series/nueva" 
                  className="inline-block rounded-lg bg-accent px-8 py-3 font-bold hover:bg-orange-600 transition"
                >
                  Crear Primera Serie
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Simplificado */}
      <footer className="mt-16 border-t border-gray-800 bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} MiManhwa - Proyecto personal</p>
          <p className="mt-1 text-sm">Desarrollado con Next.js y Supabase</p>
        </div>
      </footer>
    </div>
  )
}