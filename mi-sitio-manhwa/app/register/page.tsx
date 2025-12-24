'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient' // Misma ruta que en login
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0] // Usa el email como fallback
          }
        }
      })

      if (authError) throw authError

      // 2. EL TRIGGER automáticamente crea el perfil con role='lector'
      // No necesitas hacer nada más aquí
      
      // 3. Feedback al usuario
      if (authData.user) {
        alert('¡Registro exitoso! Por favor, verifica tu email si es necesario.')
        router.push('/login') // Redirige al login tras registro
      }
    } catch (err: any) {
      setError(err.message || 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-gray-400">
            Únete para leer y seguir tus manhwas favoritos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/20 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Campo Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="ej: lectormanhwa"
            />
          </div>

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="tu@email.com"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Contraseña (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="••••••••"
            />
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="••••••••"
            />
          </div>

          {/* Botón de Registro */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-bold transition ${
              loading
                ? 'cursor-not-allowed bg-gray-600'
                : 'bg-accent hover:bg-orange-600'
            }`}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          {/* Enlace a Login */}
          <div className="text-center text-sm">
            <span className="text-gray-400">¿Ya tienes cuenta? </span>
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </form>

        {/* Nota sobre roles */}
        <div className="rounded-lg bg-gray-900/30 p-4 text-sm text-gray-400">
          <p className="text-center">
            ⓘ Todos los nuevos usuarios son <strong>lectores</strong> por defecto.
            <br />
            El rol <strong>administrador</strong> se asigna manualmente.
          </p>
        </div>
      </div>
    </div>
  )
}