import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen } from "lucide-react"

export default async function AdminCoursesPage() {
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

  // Get all courses
  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(*)
    `,
    )
    .order("created_at", { ascending: false })

  // Get stats for each course
  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      // Get enrollment count
      const { count: enrollmentCount } = await supabase
        .from("user_course_progress")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      // Get total lessons count
      const moduleIds =
        (await supabase.from("modules").select("id").eq("course_id", course.id)).data?.map((m) => m.id) || []

      const { count: lessonCount } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .in("module_id", moduleIds)

      return {
        ...course,
        enrollmentCount: enrollmentCount || 0,
        lessonCount: lessonCount || 0,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader profile={profile} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Cursos</h1>
                <p className="text-muted-foreground mt-1">Administra los cursos de la plataforma</p>
              </div>
              <Link href="/admin/courses/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Curso
                </Button>
              </Link>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesWithStats.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative bg-muted overflow-hidden">
                    <img
                      src={course.thumbnail_url || "/placeholder.svg?height=200&width=400"}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.is_published ? "default" : "secondary"}>
                        {course.is_published ? "Publicado" : "Borrador"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.lessonCount} lecciones</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount} inscritos</span>
                      </div>
                    </div>

                    {course.instructor && (
                      <p className="text-xs text-muted-foreground">Instructor: {course.instructor.full_name}</p>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/admin/courses/${course.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Link href={`/course/${course.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {coursesWithStats.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay cursos creados todavía</p>
                  <Link href="/admin/courses/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Curso
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
