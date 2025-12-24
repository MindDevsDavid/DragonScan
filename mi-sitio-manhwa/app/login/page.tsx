'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/') // Redirige al home tras login exitoso
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-6 rounded-xl bg-gray-800 p-8 shadow-2xl">
        <h2 className="text-center text-3xl font-bold text-white">Iniciar Sesión</h2>
        {error && <div className="rounded bg-red-500/20 p-3 text-red-300">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} 
               className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white" required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} 
               className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white" required />
        <button type="submit" className="w-full rounded-lg bg-accent py-3 font-bold hover:bg-orange-600">
          Ingresar
        </button>
        <p className="text-center text-gray-400">
          ¿No tienes cuenta? <a href="/register" className="text-accent hover:underline">Regístrate</a>
        </p>
      </form>
    </div>
  )
}