import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, BookOpen, Award } from "lucide-react"

export default async function AdminAnalyticsPage() {
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

  // Get all courses with enrollment stats
  const { data: courses } = await supabase.from("courses").select("*").eq("is_published", true)

  const courseStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: enrollmentCount } = await supabase
        .from("user_course_progress")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { count: completedCount } = await supabase
        .from("user_course_progress")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)
        .not("completed_at", "is", null)

      const completionRate = enrollmentCount ? ((completedCount || 0) / enrollmentCount) * 100 : 0

      return {
        ...course,
        enrollmentCount: enrollmentCount || 0,
        completedCount: completedCount || 0,
        completionRate,
      }
    }),
  )

  // Sort by enrollment count
  const topCourses = courseStats.sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 5)

  // Get overall stats
  const totalEnrollments = courseStats.reduce((sum, c) => sum + c.enrollmentCount, 0)
  const totalCompletions = courseStats.reduce((sum, c) => sum + c.completedCount, 0)
  const overallCompletionRate = totalEnrollments ? (totalCompletions / totalEnrollments) * 100 : 0

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader profile={profile} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Estadísticas y Análisis</h1>
              <p className="text-muted-foreground mt-1">Métricas de rendimiento de la plataforma</p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEnrollments}</div>
                  <p className="text-xs text-muted-foreground mt-1">En todos los cursos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCompletions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Certificaciones otorgadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(overallCompletionRate)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Promedio general</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Cursos Más Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topCourses.map((course, index) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {course.enrollmentCount} inscritos • {course.completedCount} completados
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {Math.round(course.completionRate)}% finalización
                          </p>
                        </div>
                      </div>
                      <Progress value={course.completionRate} className="h-2" />
                    </div>
                  ))}
                </div>

                {topCourses.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay datos de cursos disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
