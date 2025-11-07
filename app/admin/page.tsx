import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"

// ✅ Tipos explícitos
interface RecentEnrollment {
  id: string
  enrolled_at: string
  user: {
    full_name: string
  } | null
  course: {
    title: string
  } | null
}

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/dashboard")
  }

  // ✅ OPTIMIZACIÓN: Queries en paralelo con Promise.all
  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: publishedCourses },
    { data: allProgress },
    { data: recentEnrollments }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("user_course_progress").select("completed_at"),
    supabase
      .from("user_course_progress")
      .select(`
        id,
        enrolled_at,
        user:profiles!user_course_progress_user_id_fkey(full_name),
        course:courses(title)
      `)
      .order("enrolled_at", { ascending: false })
      .limit(5)
      .returns<RecentEnrollment[]>()
  ])

  // ✅ Calcula completados en memoria
  const completedCourses = allProgress?.filter((p) => p.completed_at).length || 0
  const totalEnrollments = allProgress?.length || 0

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader profile={profile} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
              <p className="text-muted-foreground mt-1">Vista general de la plataforma de capacitación</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Usuarios registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cursos Totales</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">{publishedCourses || 0} publicados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEnrollments}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total de inscripciones</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCourses}</div>
                  <p className="text-xs text-muted-foreground mt-1">Cursos finalizados</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle>Inscripciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {recentEnrollments && recentEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {recentEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {enrollment.user?.full_name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{enrollment.user?.full_name || "Usuario"}</p>
                            <p className="text-sm text-muted-foreground">{enrollment.course?.title || "Curso"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(enrollment.enrolled_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No hay inscripciones recientes</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}