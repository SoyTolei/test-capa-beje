import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { CourseCard } from "@/components/course-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, Award, Clock } from "lucide-react"
import type { CourseWithProgress, CourseCategory } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  tecnico: "Técnico",
  flex: "FLEX",
  saas: "SAAS",
  sueldos_jornales: "Sueldos y Jornales",
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError) {
    if (profileError.code === "PGRST205") {
      // Tables don't exist
      redirect("/setup-admin")
    }
    if (profileError.code === "PGRST116") {
      // Profile doesn't exist - redirect to setup
      redirect("/setup-admin?error=no-profile")
    }
    redirect("/login")
  }

  if (!profile) {
    redirect("/setup-admin?error=no-profile")
  }

  // Get all published courses with progress
  const { data: coursesData } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(*)
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const courses = coursesData || []

  const { data: progressData } = await supabase.from("user_course_progress").select("*").eq("user_id", user.id)
  const userProgress = progressData || []

  // Get lesson counts and completed lessons for each course
  const coursesWithProgress: CourseWithProgress[] = await Promise.all(
    courses.map(async (course) => {
      // Get module IDs for this course
      const { data: modulesData } = await supabase.from("modules").select("id").eq("course_id", course.id)
      const moduleIds = modulesData?.map((m) => m.id) || []

      // Get total lessons count
      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true)
        .in("module_id", moduleIds)

      // Get lesson IDs for progress tracking
      const { data: lessonsData } = await supabase.from("lessons").select("id").in("module_id", moduleIds)
      const lessonIds = lessonsData?.map((l) => l.id) || []

      // Get completed lessons count
      const { count: completedLessons } = await supabase
        .from("user_lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("lesson_id", lessonIds)

      const progress = userProgress?.find((p) => p.course_id === course.id)

      return {
        ...course,
        total_lessons: totalLessons || 0,
        completed_lessons: completedLessons || 0,
        progress_percentage: totalLessons ? ((completedLessons || 0) / totalLessons) * 100 : 0,
        enrolled_at: progress?.enrolled_at,
      }
    }),
  )

  // Calculate stats
  const enrolledCourses = coursesWithProgress.filter((c) => c.enrolled_at)
  const completedCourses = enrolledCourses.filter((c) => c.progress_percentage === 100)
  const inProgressCourses = enrolledCourses.filter((c) => c.progress_percentage > 0 && c.progress_percentage < 100)
  const totalLessonsCompleted = enrolledCourses.reduce((sum, c) => sum + c.completed_lessons, 0)

  const coursesByCategory = coursesWithProgress.reduce(
    (acc, course) => {
      if (!acc[course.category]) {
        acc[course.category] = []
      }
      acc[course.category].push(course)
      return acc
    },
    {} as Record<CourseCategory, CourseWithProgress[]>,
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">Bienvenido, {profile.full_name}</h2>
          <p className="text-muted-foreground">Continúa tu capacitación profesional</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
              <p className="text-xs text-muted-foreground">Total de cursos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCourses.length}</div>
              <p className="text-xs text-muted-foreground">Cursos en desarrollo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses.length}</div>
              <p className="text-xs text-muted-foreground">Cursos finalizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lecciones</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLessonsCompleted}</div>
              <p className="text-xs text-muted-foreground">Lecciones completadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning Section */}
        {inProgressCourses.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Continuar Aprendiendo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* All Courses Section with Category Tabs */}
        <section>
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            {enrolledCourses.length > 0 ? "Todos los Cursos" : "Cursos Disponibles"}
          </h3>
          {coursesWithProgress.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay cursos disponibles en este momento</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {Object.keys(coursesByCategory).map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {CATEGORY_LABELS[category as CourseCategory]}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesWithProgress.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </TabsContent>

              {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </section>
      </main>
    </div>
  )
}
