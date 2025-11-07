import { NextResponse } from 'next/server'  
import { getSupabaseServerClient } from '@/lib/supabase/server'
  
// PUT - Actualizar categoría  
export async function PUT(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {  
  try {  
    const { categoryId } = await params  
    const supabase = await getSupabaseServerClient()
  
    const {  
      data: { user },  
    } = await supabase.auth.getUser()
  
    if (!user) {  
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })  
    }
  
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
    if (profile?.role !== 'admin') {  
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })  
    }
  
    const { name, slug, description, icon, color } = await request.json()
  
    const { data: category, error } = await supabase  
      .from('categories')  
      .update({  
        name,  
        slug,  
        description,  
        icon,  
        color,  
        updated_at: new Date().toISOString(),  
      })  
      .eq('id', categoryId)  
      .select()  
      .single()
  
    if (error) {  
      if (error.code === '23505') {  
        return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 400 })  
      }  
      throw error  
    }
  
    return NextResponse.json({ category })  
  } catch (error: any) {  
    console.error('[Categories] Error:', error)  
    return NextResponse.json({ error: error.message }, { status: 500 })  
  }  
}
  
// DELETE - Eliminar categoría  
export async function DELETE(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {  
  try {  
    const { categoryId } = await params  
    const supabase = await getSupabaseServerClient()
  
    const {  
      data: { user },  
    } = await supabase.auth.getUser()
  
    if (!user) {  
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })  
    }
  
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
    if (profile?.role !== 'admin') {  
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })  
    }
  
    // Verificar si hay cursos usando esta categoría  
    const { count } = await supabase  
      .from('course_categories')  
      .select('*', { count: 'exact', head: true })  
      .eq('category_id', categoryId)
  
    if (count && count > 0) {  
      return NextResponse.json(  
        { error: `No se puede eliminar. Hay ${count} curso(s) usando esta categoría` },  
        { status: 400 }  
      )  
    }
  
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  
    if (error) throw error
  
    return NextResponse.json({ success: true })  
  } catch (error: any) {  
    console.error('[Categories] Error:', error)  
    return NextResponse.json({ error: error.message }, { status: 500 })  
  }  
}  