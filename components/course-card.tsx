import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle2 } from "lucide-react"
import type { CourseWithProgress } from "@/lib/types"

interface CourseCardProps {
  course: CourseWithProgress
}

export function CourseCard({ course }: CourseCardProps) {
  const isCompleted = course.progress_percentage === 100
  const isStarted = course.progress_percentage > 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-muted overflow-hidden">
        <img
          src={course.thumbnail_url || "/placeholder.svg?height=200&width=400"}
          alt={course.title}
          className="object-cover w-full h-full"
        />
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          {isStarted && !isCompleted && <Badge variant="secondary">En progreso</Badge>}
          {isCompleted && <Badge className="bg-primary">Completado</Badge>}
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.total_lessons} lecciones</span>
          </div>
          {course.instructor && (
            <div className="flex items-center gap-1">
              <span>Por {course.instructor.full_name}</span>
            </div>
          )}
        </div>

        {isStarted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(course.progress_percentage)}%</span>
            </div>
            <Progress value={course.progress_percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {course.completed_lessons} de {course.total_lessons} lecciones completadas
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/course/${course.id}`} className="w-full">
          <Button className="w-full" variant={isStarted ? "default" : "outline"}>
            {isCompleted ? "Revisar curso" : isStarted ? "Continuar" : "Comenzar curso"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
