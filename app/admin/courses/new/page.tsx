"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function NewCoursePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No autenticado")
      }

      const { data, error } = await supabase
        .from("courses")
        .insert({
          title,
          description,
          thumbnail_url: thumbnailUrl || null,
          instructor_id: user.id,
          is_published: isPublished,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/admin/courses/${data.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear el curso")
    } finally {
      setLoading(false)
    }
  }

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
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Crear Nuevo Curso</h1>
              <p className="text-muted-foreground mt-1">Completa la información básica del curso</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
                <CardDescription>Los campos marcados son obligatorios</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Título del Curso <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Capacitación Sistema Bejerman - Nivel Básico"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el contenido y objetivos del curso..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={loading}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">URL de Imagen (opcional)</Label>
                    <Input
                      id="thumbnail"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Puedes usar una URL de imagen o dejar en blanco para usar el placeholder
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="published">Publicar Curso</Label>
                      <p className="text-sm text-muted-foreground">
                        Los cursos publicados serán visibles para los estudiantes
                      </p>
                    </div>
                    <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} disabled={loading} />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Curso"
                      )}
                    </Button>
                    <Link href="/admin/courses" className="flex-1">
                      <Button type="button" variant="outline" disabled={loading} className="w-full bg-transparent">
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
