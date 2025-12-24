import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Crea una respuesta que podemos modificar
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Crea un cliente Supabase usando cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Actualizar sesión si es necesario
  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  // 1. Rutas PÚBLICAS (no requieren autenticación)
  const publicPaths = ['/', '/login', '/register', '/about']
  if (publicPaths.includes(path)) {
    return response
  }

  // 2. Verificar autenticación para rutas protegidas
  if (!session) {
    // Redirigir al login si no está autenticado
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Verificar rol ADMIN para rutas /admin
  if (path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Redirigir al inicio si no es admin
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}