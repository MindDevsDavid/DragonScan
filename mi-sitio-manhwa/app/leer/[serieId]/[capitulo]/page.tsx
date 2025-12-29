// app/leer/[serieId]/[capitulo]/page.tsx
import { supabase } from '@/app/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Home } from 'lucide-react'

export default async function LeerCapituloPage({ 
  params 
}: { 
  params: Promise<{ serieId: string; capitulo: string }> 
}) {
  const { serieId, capitulo } = await params
  const numeroCapitulo = parseInt(capitulo)

  // Obtener la serie
  const { data: serie } = await supabase
    .from('series')
    .select('*')
    .eq('id', serieId)
    .single()

  if (!serie) notFound()

  const capitulos = Array.isArray(serie.chapters) ? serie.chapters : []
  const capituloActual = capitulos[numeroCapitulo - 1]

  if (!capituloActual) notFound()

  const totalCapitulos = capitulos.length
  const tieneAnterior = numeroCapitulo > 1
  const tieneSiguiente = numeroCapitulo < totalCapitulos

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navegación superior */}
      <div className="bg-gray-800/50 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/series/${serieId}`}
              className="inline-flex items-center text-gray-300 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {serie.title}
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-bold">
              {capituloActual.titulo}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {tieneAnterior && (
              <Link
                href={`/leer/${serieId}/${numeroCapitulo - 1}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Link>
            )}
            
            <div className="text-sm">
              Capítulo {numeroCapitulo} de {totalCapitulos}
            </div>

            {tieneSiguiente && (
              <Link
                href={`/leer/${serieId}/${numeroCapitulo + 1}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-accent hover:bg-orange-600"
              >
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Contenido del capítulo */}
      <div className="container mx-auto p-4">
        {/* Páginas */}
        <div className="max-w-2xl mx-auto space-y-4">
          {capituloActual.paginas.map((url: string, index: number) => (
            <div key={index} className="rounded-lg overflow-hidden bg-gray-800">
              <img
                src={url}
                alt={`Página ${index + 1}`}
                className="w-full h-auto"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="p-2 text-center text-sm text-gray-400">
                Página {index + 1} de {capituloActual.paginas.length}
              </div>
            </div>
          ))}
        </div>

        {/* Navegación inferior */}
        <div className="max-w-2xl mx-auto mt-8 flex justify-between">
          {tieneAnterior && (
            <Link
              href={`/leer/${serieId}/${numeroCapitulo - 1}`}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Capítulo Anterior
            </Link>
          )}
          
          <Link
            href={`/series/${serieId}`}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            <Home className="mr-2 h-4 w-4" />
            Volver a la serie
          </Link>

          {tieneSiguiente && (
            <Link
              href={`/leer/${serieId}/${numeroCapitulo + 1}`}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-accent hover:bg-orange-600"
            >
              Siguiente Capítulo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}