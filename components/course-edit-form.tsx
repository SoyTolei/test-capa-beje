"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Course } from "@/lib/types"

interface CourseEditFormProps {
  course: Course
}

export function CourseEditForm({ course }: CourseEditFormProps) {
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || "")
  const [isPublished, setIsPublished] = useState(course.is_published)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title,
          description,
          thumbnail_url: thumbnailUrl || null,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq("id", course.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Error al actualizar el curso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Curso actualizado exitosamente</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título del Curso</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">URL de Imagen</Label>
            <Input
              id="thumbnail"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="published">Publicar Curso</Label>
              <p className="text-sm text-muted-foreground">Los cursos publicados serán visibles para estudiantes</p>
            </div>
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} disabled={loading} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
