"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, FileText, PlayCircle } from "lucide-react"
import type { Module, Lesson } from "@/lib/types"

interface ModuleListProps {
  modules: (Module & { lessons: Lesson[] })[]
  courseId: string
}

export function ModuleList({ modules, courseId }: ModuleListProps) {
  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay módulos creados todavía</p>
        <Link href={`/admin/courses/${courseId}/modules/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Módulo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {modules.map((module, index) => (
        <Card key={module.id} className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{module.title}</h3>
                {module.description && <p className="text-sm text-muted-foreground mt-1">{module.description}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons/new`}>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <Plus className="h-4 w-4 mr-1" />
                  Lección
                </Button>
              </Link>
              <Link href={`/admin/courses/${courseId}/modules/${module.id}/edit`}>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {module.lessons.length > 0 ? (
            <div className="space-y-2 ml-11">
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{lessonIndex + 1}.</span>
                    {lesson.type === "pdf" ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={lesson.is_published ? "default" : "secondary"} className="text-xs">
                          {lesson.is_published ? "Publicada" : "Borrador"}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{lesson.type}</span>
                        {lesson.duration_minutes && (
                          <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-11 p-4 border border-dashed rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">No hay lecciones en este módulo</p>
              <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons/new`}>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Lección
                </Button>
              </Link>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
