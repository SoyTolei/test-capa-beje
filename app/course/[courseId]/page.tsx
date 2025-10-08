import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { LessonSidebar } from "@/components/lesson-sidebar"
import { LessonContent } from "@/components/lesson-content"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import type { Module, Lesson } from "@/lib/types"

interface CoursePageProps {
  params: Promise<{ courseId: string }>
  searchParams: Promise<{ lesson?: string }>
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { courseId } = await params
  const { lesson: lessonId } = await searchParams
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/login")
  }

  // Get course details
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (!course) {
    redirect("/dashboard")
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
    lessons: (module.lessons as Lesson[]).filter((l) => l.is_published).sort((a, b) => a.order_index - b.order_index),
  })) as (Module & { lessons: Lesson[] })[]

  // Get all lessons for the course
  const allLessons = modulesWithLessons.flatMap((m) => m.lessons)

  // Determine current lesson
  const currentLesson = lessonId ? allLessons.find((l) => l.id === lessonId) : allLessons[0]

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader profile={profile} />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay lecciones disponibles en este curso</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Get user progress for all lessons
  const { data: userProgress } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .in(
      "lesson_id",
      allLessons.map((l) => l.id),
    )

  // Enroll user in course if not already enrolled
  await supabase.from("user_course_progress").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      last_accessed_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,course_id",
    },
  )

  // Find next lesson
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id)
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : undefined

  // Get current lesson progress
  const currentLessonProgress = userProgress?.find((p) => p.lesson_id === currentLesson.id)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader profile={profile} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 hidden lg:block">
          <LessonSidebar
            modules={modulesWithLessons}
            currentLessonId={currentLesson.id}
            courseId={courseId}
            userProgress={userProgress || []}
            onLessonSelect={(lessonId) => {
              // This will be handled by client component
            }}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <LessonContent
              lesson={currentLesson}
              userId={user.id}
              courseId={courseId}
              nextLesson={nextLesson}
              userProgress={currentLessonProgress}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
