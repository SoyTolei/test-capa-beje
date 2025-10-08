import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    // Validar datos
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Crear cliente de Supabase con service role para crear usuarios
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    try {
      const { data, error: checkError } = await supabaseAdmin.from("profiles").select("id").eq("role", "admin").limit(1)

      // Si la tabla no existe (error PGRST205 o mensaje específico)
      if (checkError) {
        if (checkError.code === "PGRST205" || checkError.message?.includes("Could not find the table")) {
          return NextResponse.json(
            {
              error:
                "La base de datos no está configurada. Por favor ejecuta primero los scripts SQL (001_create_tables.sql y 002_seed_data.sql) desde la carpeta /scripts.",
              needsSetup: true,
            },
            { status: 400 },
          )
        }
        // Otro tipo de error de Postgres
        throw checkError
      }

      // Si ya existe un admin
      if (data && data.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un usuario administrador. Use la función de crear usuarios desde el panel admin." },
          { status: 400 },
        )
      }
    } catch (error: any) {
      // Capturar errores de fetch (404, etc)
      if (error.message?.includes("Could not find the table") || error.code === "PGRST205") {
        return NextResponse.json(
          {
            error:
              "La base de datos no está configurada. Por favor ejecuta primero los scripts SQL (001_create_tables.sql y 002_seed_data.sql) desde la carpeta /scripts.",
            needsSetup: true,
          },
          { status: 400 },
        )
      }
      throw error
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: `Error al crear usuario: ${authError.message}` }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 })
    }

    // Crear perfil con rol de admin
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: "admin",
    })

    if (profileError) {
      // Intentar eliminar el usuario de auth si falla la creación del perfil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Error al crear perfil: ${profileError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuario administrador creado exitosamente",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
