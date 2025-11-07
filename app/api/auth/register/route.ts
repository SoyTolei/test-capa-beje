import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { fullName, email, password, role } = await request.json()

    // Validaciones
    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    // Validar rol (solo student o instructor)
    if (role !== 'student' && role !== 'instructor') {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    // Crear cliente de Supabase con service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ← Email confirmado automáticamente (sin verificación)
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 })
      }
      throw authError
    }

    // Esperar a que el trigger cree el perfil
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verificar que el perfil se creó con el rol correcto
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', authData.user.id)
      .single()

    if (!profile) {
      // Si el trigger no funcionó, crear perfil manualmente
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } else if (profile.role !== role) {
      // Si el trigger creó el perfil con rol incorrecto, actualizarlo
      await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', authData.user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Ya puedes iniciar sesión.',
    })
  } catch (error: any) {
    console.error('[Register] Error:', error)
    return NextResponse.json({ error: error.message || 'Error al registrarse' }, { status: 500 })
  }
}