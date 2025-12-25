'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditarSeriePage() {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('ongoing')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()
  const params = useParams()
  const serieId = params.id as string

  useEffect(() => {
    cargarSerie()
  }, [serieId])

  const cargarSerie = async () => {
    const { data: serie } = await supabase
      .from('series')
      .select('*')
      .eq('id', serieId)
      .single()
    
    if (serie) {
      setTitulo(serie.title)
      setDescripcion(serie.description || '')
      setEstado(serie.status)
    }
    setLoading(false)
  }

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    
    const { error } = await supabase
      .from('series')
      .update({
        title: titulo,
        description: descripcion,
        status: estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', serieId)

    setGuardando(false)
    
    if (!error) {
      alert('¡Cambios guardados!')
      router.push(`/admin/series/${serieId}`)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="p-6">
      <Link href={`/admin/series/${serieId}`} className="flex items-center">
        <ArrowLeft className="mr-2" /> Volver
      </Link>
      
      <h1 className="text-2xl font-bold my-4">Editar Serie</h1>
      
      <form onSubmit={guardarCambios} className="space-y-4">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full p-2 border rounded"
          required
        />
        
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
          className="w-full p-2 border rounded"
          rows={4}
        />
        
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="ongoing">En curso</option>
          <option value="completed">Completada</option>
          <option value="hiatus">En pausa</option>
        </select>
        
        <button
          type="submit"
          disabled={guardando}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <Save className="inline mr-2" />
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  )
}