import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen } from "lucide-react"

// ✅ Tipos explícitos
interface Module {
  id: string
  lessons: { id: string }[]
}

interface CourseWithRelations {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  is_published: boolean
  created_at: string
  instructor_id: string
  instructor: {
    full_name: string
  } | null
  modules: Module[]
  enrollments: { id: string }[]
}

export default async function AdminCoursesPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile (solo campos necesarios)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    redirect("/dashboard")
  }

  // ✅ OPTIMIZACIÓN: Una sola query con JOINs anidados
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      is_published,
      created_at,
      instructor_id,
      instructor:profiles!courses_instructor_id_fkey(full_name),
      modules(
        id,
        lessons(id)
      ),
      enrollments:user_course_progress(id)
    `)
    .order("created_at", { ascending: false })
    .returns<CourseWithRelations[]>()

  // ✅ Procesar stats en memoria (instantáneo)
  const coursesWithStats = (courses || []).map(course => {
    const lessonCount = course.modules?.reduce((total, module) => {
      return total + (module.lessons?.length || 0)
    }, 0) || 0

    return {
      ...course,
      enrollmentCount: course.enrollments?.length || 0,
      lessonCount,
    }
  })

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
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
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