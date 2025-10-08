"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react"
import { VideoPlayer } from "./video-player"
import { PDFViewer } from "./pdf-viewer"
import type { Lesson, UserLessonProgress } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LessonContentProps {
  lesson: Lesson
  userId: string
  courseId: string
  nextLesson?: Lesson
  userProgress?: UserLessonProgress
}

export function LessonContent({ lesson, userId, courseId, nextLesson, userProgress }: LessonContentProps) {
  const [isCompleted, setIsCompleted] = useState(userProgress?.completed || false)
  const [isMarking, setIsMarking] = useState(false)
  const [lastPosition, setLastPosition] = useState(userProgress?.last_position_seconds || 0)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    setIsCompleted(userProgress?.completed || false)
    setLastPosition(userProgress?.last_position_seconds || 0)
  }, [userProgress])

  const handleMarkComplete = async () => {
    setIsMarking(true)
    try {
      // Upsert lesson progress
      const { error } = await supabase.from("user_lesson_progress").upsert(
        {
          user_id: userId,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
          last_position_seconds: 0,
        },
        {
          onConflict: "user_id,lesson_id",
        },
      )

      if (error) throw error

      // Update course progress last_accessed_at
      await supabase.from("user_course_progress").upsert(
        {
          user_id: userId,
          course_id: courseId,
          last_accessed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,course_id",
        },
      )

      setIsCompleted(true)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error marking lesson complete:", error)
    } finally {
      setIsMarking(false)
    }
  }

  const handleVideoProgress = async (seconds: number) => {
    // Save progress every 10 seconds
    if (Math.abs(seconds - lastPosition) > 10) {
      setLastPosition(seconds)
      try {
        await supabase.from("user_lesson_progress").upsert(
          {
            user_id: userId,
            lesson_id: lesson.id,
            last_position_seconds: Math.floor(seconds),
            completed: isCompleted,
          },
          {
            onConflict: "user_id,lesson_id",
          },
        )
      } catch (error) {
        console.error("[v0] Error saving video progress:", error)
      }
    }
  }

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/course/${courseId}?lesson=${nextLesson.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold text-foreground text-balance">{lesson.title}</h1>
          {isCompleted && (
            <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Completada</span>
            </div>
          )}
        </div>
        {lesson.description && <p className="text-muted-foreground text-lg leading-relaxed">{lesson.description}</p>}
      </div>

      {/* Lesson Content */}
      {lesson.type === "youtube" || lesson.type === "video" ? (
        <VideoPlayer url={lesson.content_url || ""} onProgress={handleVideoProgress} initialPosition={lastPosition} />
      ) : lesson.type === "pdf" ? (
        <PDFViewer url={lesson.content_url || ""} title={lesson.title} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contenido no disponible</CardTitle>
            <CardDescription>El contenido de esta lección aún no está disponible.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              {!isCompleted && (
                <Button onClick={handleMarkComplete} disabled={isMarking} size="lg">
                  {isMarking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marcando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Marcar como Completada
                    </>
                  )}
                </Button>
              )}
            </div>
            {nextLesson && (
              <Button onClick={handleNextLesson} variant={isCompleted ? "default" : "outline"} size="lg">
                Siguiente Lección
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
