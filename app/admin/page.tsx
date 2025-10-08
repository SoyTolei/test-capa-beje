import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/dashboard")
  }

  // Get statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true })

  const { count: publishedCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: totalEnrollments } = await supabase
    .from("user_course_progress")
    .select("*", { count: "exact", head: true })

  // Get recent enrollments
  const { data: recentEnrollments } = await supabase
    .from("user_course_progress")
    .select(
      `
      *,
      user:profiles!user_course_progress_user_id_fkey(*),
      course:courses(*)
    `,
    )
    .order("enrolled_at", { ascending: false })
    .limit(5)

  // Get course completion stats
  const { data: allProgress } = await supabase.from("user_course_progress").select("*")

  const completedCourses = allProgress?.filter((p) => p.completed_at).length || 0

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
                  <div className="text-2xl font-bold">{totalEnrollments || 0}</div>
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
                    {recentEnrollments.map((enrollment: any) => (
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
