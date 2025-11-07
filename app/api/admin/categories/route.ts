import { NextResponse } from 'next/server'  
import { getSupabaseServerClient } from '@/lib/supabase/server'
  
// GET - Listar categorías  
export async function GET() {  
  try {  
    const supabase = await getSupabaseServerClient()
  
    const { data: categories, error } = await supabase  
      .from('categories')  
      .select('*')  
      .order('order_index', { ascending: true })
  
    if (error) throw error
  
    return NextResponse.json({ categories })  
  } catch (error: any) {  
    console.error('[Categories] Error:', error)  
    return NextResponse.json({ error: error.message }, { status: 500 })  
  }  
}
  
// POST - Crear categoría  
export async function POST(request: Request) {  
  try {  
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
  
    if (!name || !slug) {  
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })  
    }
  
    // Get max order_index  
    const { data: maxOrder } = await supabase  
      .from('categories')  
      .select('order_index')  
      .order('order_index', { ascending: false })  
      .limit(1)  
      .single()
  
    const nextOrder = maxOrder ? maxOrder.order_index + 1 : 1
  
    const { data: category, error } = await supabase  
      .from('categories')  
      .insert({  
        name,  
        slug,  
        description,  
        icon,  
        color,  
        order_index: nextOrder,  
        is_active: true,  
      })  
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