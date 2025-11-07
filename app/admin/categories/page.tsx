import { redirect } from 'next/navigation'  
import { getSupabaseServerClient } from '@/lib/supabase/server'  
import { AdminSidebar } from '@/components/admin-sidebar'  
import { DashboardHeader } from '@/components/dashboard-header'  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'  
import { CategoryList } from './components/CategoryList'
  
export default async function CategoriesPage() {  
  const supabase = await getSupabaseServerClient()
  
  const {  
    data: { user },  
  } = await supabase.auth.getUser()
  
  if (!user) {  
    redirect('/login')  
  }
  
  // Get user profile  
  const { data: profile } = await supabase  
    .from('profiles')  
    .select('id, role, full_name, email, avatar_url, created_at, updated_at')  
    .eq('id', user.id)  
    .single()
  
  if (!profile || profile.role !== 'admin') {  
    redirect('/dashboard')  
  }
  
  // Get all categories  
  const { data: categories } = await supabase  
    .from('categories')  
    .select('*')  
    .order('order_index', { ascending: true })
  
  return (  
    <div className="min-h-screen bg-background flex">  
      <AdminSidebar />
  
      <div className="flex-1 flex flex-col">  
        <DashboardHeader profile={profile} />
  
        <main className="flex-1 p-8">  
          <div className="max-w-5xl mx-auto space-y-8">  
            {/* Header */}  
            <div className="flex items-center justify-between">  
              <div>  
                <h1 className="text-3xl font-bold text-foreground">Gestión de Categorías</h1>  
                <p className="text-muted-foreground mt-1">Administra las categorías de los cursos</p>  
              </div>  
            </div>
  
            {/* Categories */}  
            <Card>  
              <CardHeader>  
                <div className="flex items-center justify-between">  
                  <div>  
                    <CardTitle>Categorías ({categories?.length || 0})</CardTitle>  
                    <CardDescription>Organiza tus cursos por categorías</CardDescription>  
                  </div>  
                </div>  
              </CardHeader>  
              <CardContent>  
                <CategoryList categories={categories || []} />  
              </CardContent>  
            </Card>  
          </div>  
        </main>  
      </div>  
    </div>  
  )  
}  