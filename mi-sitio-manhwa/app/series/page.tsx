import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

interface Serie {
  id: number
  title: string
  description: string
  status: string
  cover_url: string
  chapters: any[]
  created_at: string
}

export default async function SeriesPublicPage() {
  // Obtener todas las series (público)
  const { data: series, error } = await supabase
    .from('series')
    .select('*')
    .order('title', { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white">
        <div className="container mx-auto">
          <p>Error cargando las series. Intenta recargar la página.</p>
        </div>
      </div>
    )
  }

  const totalSeries = series?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header público */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold">Mi<span className="text-accent">Manhwa</span></span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="font-medium hover:text-accent transition">Inicio</Link>
              <Link href="/series" className="font-medium text-accent border-b-2 border-accent transition">Series</Link>
              <Link href="/about" className="font-medium hover:text-accent transition">Acerca de</Link>
            </nav>
            
            <Link 
              href="/" 
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-700 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Encabezado simple */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Catálogo de Series</h1>
          <p className="text-gray-300">
            Explora todas las series disponibles ({totalSeries} series)
          </p>
        </div>

        {/* Lista de series (solo lectura) */}
        {series && series.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((serie: Serie) => {
              const chapterCount = Array.isArray(serie.chapters) ? serie.chapters.length : 0
              
              return (
                <Link href={`/series/${serie.id}`} key={serie.id} className="group">
                  <div className="h-full rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-accent hover:bg-gray-800/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{serie.title}</h3>
                        <div className={`text-sm font-medium ${
                          serie.status === 'ongoing' ? 'text-yellow-500' :
                          serie.status === 'completed' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {serie.status === 'ongoing' ? 'En curso' :
                           serie.status === 'completed' ? 'Completada' : 'En pausa'}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-accent group-hover:translate-x-1 transition" />
                    </div>
                    
                    <p className="text-gray-400 mb-6 line-clamp-3 min-h-[60px]">
                      {serie.description || 'Esta serie no tiene descripción aún.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <BookOpen className="mr-1 h-4 w-4" />
                        {chapterCount} capítulo{chapterCount !== 1 ? 's' : ''}
                      </div>
                      <span className="text-accent font-medium group-hover:underline">
                        Ver detalles
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-700" />
            <h3 className="mt-6 text-2xl font-bold">Aún no hay series</h3>
            <p className="mx-auto mt-2 max-w-md text-gray-400">
              El catálogo está vacío. Vuelve más tarde.
            </p>
          </div>
        )}

        {/* Enlace para volver */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-accent hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-800 bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} MiManhwa • Catálogo público</p>
        </div>
      </footer>
    </div>
  )
}