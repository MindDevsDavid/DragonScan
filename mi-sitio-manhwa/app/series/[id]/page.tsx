import { supabase } from '@/app/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Calendar, BarChart, ArrowLeft, Eye, PlayCircle, CheckCircle, PauseCircle } from 'lucide-react'

export default async function SeriePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const { data: serie } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single()

  if (!serie) {
    notFound()
  }

  const capitulos = Array.isArray(serie.chapters) ? serie.chapters : []
  const totalCapitulos = capitulos.length

  const estadoConfig = {
    ongoing: { icon: PlayCircle, color: 'text-yellow-500', label: 'En curso' },
    completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completada' },
    hiatus: { icon: PauseCircle, color: 'text-gray-500', label: 'En pausa' }
  }
  
  const config = estadoConfig[serie.status as keyof typeof estadoConfig] || estadoConfig.ongoing
  const EstadoIcono = config.icon

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
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-800 relative">
                {serie.cover_url ? (
                  // Usando img normal si no quieres optimización de Next.js
                  <img 
                    src={serie.cover_url} 
                    alt={`Portada de ${serie.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-20 w-20 text-gray-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Información */}
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center">
                <EstadoIcono className={`mr-2 h-5 w-5 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
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
                    <div>{totalCapitulos}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="rounded-lg bg-gray-800/30 p-4 inline-block">
                  <div className="text-2xl font-bold">{totalCapitulos}</div>
                  <div className="text-sm text-gray-400">Capítulos totales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Capítulos */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="mb-8 text-2xl font-bold">Capítulos</h2>
        
        {totalCapitulos > 0 ? (
          <div className="grid gap-4">
            {capitulos.map((cap: any, index: number) => (
              <Link 
                href={`/leer/${serie.id}/${index + 1}`} 
                key={index}
                className="flex items-center justify-between p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:border-accent hover:bg-gray-800/30 transition group"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-accent transition">
                    Capítulo {index + 1}: {cap.titulo || `Capítulo ${index + 1}`}
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Publicado el {cap.fecha_subida ? new Date(cap.fecha_subida).toLocaleDateString('es') : 'Fecha desconocida'}
                  </p>
                </div>
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-gray-600 group-hover:text-accent transition" />
                </div>
              </Link>
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