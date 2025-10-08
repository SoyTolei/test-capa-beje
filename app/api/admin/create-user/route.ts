import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Get request body
    const { email, password, fullName, role } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Create user using Supabase Admin API
    // Note: This requires service role key which should be set in environment variables
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (createError) {
      throw createError
    }

    // Update profile with role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        full_name: fullName,
      })
      .eq("id", newUser.user.id)

    if (profileError) {
      throw profileError
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        fullName,
        role,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: error.message || "Error al crear usuario" }, { status: 500 })
  }
}
