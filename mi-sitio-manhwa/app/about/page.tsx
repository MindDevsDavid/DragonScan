import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header consistente */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">Mi<span className="text-accent">Manhwa</span></span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="font-medium hover:text-accent transition">Inicio</Link>
              <Link href="/series" className="font-medium hover:text-accent transition">Series</Link>
              <Link href="/about" className="font-medium hover:text-accent transition">Acerca de</Link>
            </nav>
            
            <Link 
              href="/" 
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-700 transition"
            >
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
            
            <h1 className="text-4xl font-bold mb-4">Acerca de este proyecto</h1>
            <p className="text-xl text-gray-300">
              Una plataforma personal para crear, organizar y leer manhwas.
            </p>
          </div>

          {/* Contenido principal - Imagen y Texto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Espacio para tu IMAGEN */}
            <div className="space-y-4">
              <img 
                src="/tu-imagen.jpg" 
                alt="Logo de DragonScan"
                className="rounded-2xl w-full h-auto"
              />
              <div className="text-sm text-gray-500 text-center">
                {/* Puedes añadir un pie de foto aquí si lo deseas */}
              </div>
            </div>

            {/* Espacio para tu TEXTO */}
            <div className="space-y-6">
              <div className="prose prose-lg prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Tu texto aquí</h2>
                <p className="text-gray-300 mb-4">
                  Este es un espacio para que agregues la descripción de tu proyecto. 
                  Puedes hablar sobre:
                </p>
                <ul className="text-gray-300 mb-6 list-disc pl-5 space-y-2">
                  <li>El propósito de esta plataforma</li>
                  <li>Tus objetivos como creador</li>
                  <li>Las tecnologías que estás aprendiendo</li>
                  <li>Tu visión para el futuro del proyecto</li>
                </ul>
                <div className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-accent">
                  <p className="text-gray-300 italic">
                    "Reemplaza este texto con tu contenido personal. 
                    Este es solo un marcador de posición para que tengas una idea 
                    de cómo se verá tu texto final."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Técnica (Opcional) */}
          <div className="mt-16 pt-12 border-t border-gray-800">
            <h2 className="text-2xl font-bold mb-8">Detalles técnicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-3 text-accent">Frontend</h3>
                <p className="text-gray-400">Next.js 14 + TypeScript</p>
                <p className="text-gray-400">Tailwind CSS para estilos</p>
              </div>
              <div className="bg-gray-800/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-3 text-accent">Backend</h3>
                <p className="text-gray-400">Supabase (PostgreSQL)</p>
                <p className="text-gray-400">Autenticación y base de datos</p>
              </div>
              <div className="bg-gray-800/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-3 text-accent">Despliegue</h3>
                <p className="text-gray-400">Vercel para hosting</p>
                <p className="text-gray-400">Despliegue automático</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-gray-800 bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Proyecto de desarrollo personal • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}