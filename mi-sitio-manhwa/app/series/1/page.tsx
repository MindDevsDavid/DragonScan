import { supabase } from '@/app/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Calendar, BarChart, ArrowLeft } from 'lucide-react'

// Esta función se ejecuta en el servidor
export default async function SeriePage({ params }: { params: { id: string } }) {
  // Obtener la serie de la base de datos
  const { data: serie } = await supabase
    .from('series')
    .select('*')
    .eq('id', params.id)
    .single()

  // Si no existe, mostrar 404
  if (!serie) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {/* Portada */}
            <div className="md:col-span-1">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-800">
                {serie.cover_url ? (
                  <div className="h-full w-full bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-20 w-20 text-gray-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Información */}
            <div className="md:col-span-2">
              <div className="mb-2 inline-flex items-center rounded-full bg-gray-800 px-4 py-1">
                <span className="text-sm capitalize">{serie.status}</span>
              </div>
              <h1 className="text-4xl font-bold">{serie.title}</h1>
              
              <p className="mt-6 text-gray-300">{serie.description}</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-gray-400">Publicación</div>
                    <div>{new Date(serie.created_at).toLocaleDateString('es')}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-gray-400">Capítulos</div>
                    <div>{Array.isArray(serie.chapters) ? serie.chapters.length : 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Capítulos */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="mb-8 text-2xl font-bold">Capítulos</h2>
        
        {Array.isArray(serie.chapters) && serie.chapters.length > 0 ? (
          <div className="grid gap-4">
            {serie.chapters.map((cap: any) => (
              <div 
                key={cap.number}
                className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Capítulo {cap.number}: {cap.title}
                    </h3>
                    <p className="mt-1 text-gray-400">
                      {cap.pages?.length || 0} páginas • Publicado el {new Date(cap.uploaded_at).toLocaleDateString('es')}
                    </p>
                  </div>
                  <Link
                    href={`/leer/${serie.id}/${cap.number}`}
                    className="rounded-lg bg-accent px-6 py-2 font-bold hover:bg-orange-600"
                  >
                    Leer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/30 p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-700" />
            <h3 className="mt-4 text-xl font-bold">Aún no hay capítulos</h3>
            <p className="mt-2 text-gray-400">
              El autor aún no ha publicado capítulos para esta serie.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}