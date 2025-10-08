"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, Circle, FileText, PlayCircle, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Module, Lesson, UserLessonProgress } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LessonSidebarProps {
  modules: (Module & { lessons: Lesson[] })[]
  currentLessonId: string
  courseId: string
  userProgress: UserLessonProgress[]
  onLessonSelect: (lessonId: string) => void
}

export function LessonSidebar({
  modules,
  currentLessonId,
  courseId,
  userProgress,
  onLessonSelect,
}: LessonSidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>(modules.map((m) => m.id))
  const router = useRouter()

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some((p) => p.lesson_id === lessonId && p.completed)
  }

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.type === "pdf") {
      return <FileText className="h-4 w-4" />
    }
    return <PlayCircle className="h-4 w-4" />
  }

  const handleLessonClick = (lessonId: string) => {
    router.push(`/course/${courseId}?lesson=${lessonId}`)
    onLessonSelect(lessonId)
  }

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 border-b">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="font-semibold mb-4 text-foreground">Contenido del Curso</h3>
          <Accordion type="multiple" value={openModules} onValueChange={setOpenModules} className="space-y-2">
            {modules.map((module, moduleIndex) => {
              const completedLessons = module.lessons.filter((l) => isLessonCompleted(l.id)).length
              const totalLessons = module.lessons.length

              return (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-start gap-3 text-left">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {moduleIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2 text-foreground">{module.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {completedLessons}/{totalLessons} lecciones
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-1 mt-2">
                      {module.lessons.map((lesson) => {
                        const isCompleted = isLessonCompleted(lesson.id)
                        const isCurrent = lesson.id === currentLessonId

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson.id)}
                            className={cn(
                              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                              isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                            )}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2
                                  className={cn("h-4 w-4", isCurrent ? "text-primary-foreground" : "text-primary")}
                                />
                              ) : (
                                <Circle
                                  className={cn(
                                    "h-4 w-4",
                                    isCurrent ? "text-primary-foreground" : "text-muted-foreground",
                                  )}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium line-clamp-2",
                                  isCurrent ? "text-primary-foreground" : "text-foreground",
                                )}
                              >
                                {lesson.title}
                              </p>
                              <div
                                className={cn(
                                  "flex items-center gap-2 mt-1 text-xs",
                                  isCurrent ? "text-primary-foreground/80" : "text-muted-foreground",
                                )}
                              >
                                {getLessonIcon(lesson)}
                                <span>
                                  {lesson.type === "pdf"
                                    ? "PDF"
                                    : lesson.duration_minutes
                                      ? `${lesson.duration_minutes} min`
                                      : "Video"}
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  )
}
