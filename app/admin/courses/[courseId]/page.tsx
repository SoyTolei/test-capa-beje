import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus } from "lucide-react"
import { CourseEditForm } from "@/components/course-edit-form"
import { ModuleList } from "@/components/module-list"

interface CourseEditPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  const { courseId } = await params
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

  // Get course details
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (!course) {
    redirect("/admin/courses")
  }

  // Get modules with lessons
  const { data: modules } = await supabase
    .from("modules")
    .select(
      `
      *,
      lessons(*)
    `,
    )
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })

  const modulesWithLessons = (modules || []).map((module) => ({
    ...module,
    lessons: (module.lessons as any[]).sort((a, b) => a.order_index - b.order_index),
  }))

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Cursos
              </Button>
            </Link>
          </div>
        </div>

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">Editar Curso</h1>
                  <Badge variant={course.is_published ? "default" : "secondary"}>
                    {course.is_published ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{course.title}</p>
              </div>
              <Link href={`/course/${courseId}`}>
                <Button variant="outline" className="bg-transparent">
                  Vista Previa
                </Button>
              </Link>
            </div>

            {/* Course Info Form */}
            <CourseEditForm course={course} />

            {/* Modules Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Módulos y Lecciones</CardTitle>
                    <CardDescription>Organiza el contenido del curso en módulos</CardDescription>
                  </div>
                  <Link href={`/admin/courses/${courseId}/modules/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Módulo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <ModuleList modules={modulesWithLessons} courseId={courseId} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
