"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Loader2, ArrowLeft } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type LessonType = "youtube" | "pdf" | "text"

export default function NewLessonPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const moduleId = params.moduleId as string
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<LessonType>("youtube")
  const [contentUrl, setContentUrl] = useState("")
  const [textContent, setTextContent] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Get current max order_index for this module
      const { data: existingLessons } = await supabase
        .from("lessons")
        .select("order_index")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: false })
        .limit(1)

      const nextOrderIndex = existingLessons && existingLessons.length > 0 ? existingLessons[0].order_index + 1 : 1

      const lessonData: any = {
        module_id: moduleId,
        title,
        description: description || null,
        type,
        order_index: nextOrderIndex,
      }

      if (type === "text") {
        lessonData.content = textContent
      } else {
        lessonData.content_url = contentUrl
      }

      const { error } = await supabase.from("lessons").insert(lessonData)

      if (error) throw error

      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear la lección")
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
            <Link href={`/admin/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Curso
              </Button>
            </Link>
          </div>
        </div>

        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Crear Nueva Lección</h1>
              <p className="text-muted-foreground mt-1">Agrega contenido al módulo</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información de la Lección</CardTitle>
                <CardDescription>Elige el tipo de contenido y completa los detalles</CardDescription>
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
                      Título de la Lección <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Cómo acceder al sistema"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el contenido de esta lección..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">
                      Tipo de Contenido <span className="text-destructive">*</span>
                    </Label>
                    <Select value={type} onValueChange={(value: LessonType) => setType(value)} disabled={loading}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">Video de YouTube</SelectItem>
                        <SelectItem value="pdf">Documento PDF</SelectItem>
                        <SelectItem value="text">Texto / HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {type === "text" ? (
                    <div className="space-y-2">
                      <Label htmlFor="textContent">
                        Contenido de Texto <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="textContent"
                        placeholder="Escribe el contenido de la lección..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        required
                        disabled={loading}
                        rows={10}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Puedes usar HTML básico para formato</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="contentUrl">
                        {type === "youtube" ? "URL de YouTube" : "URL del PDF"}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contentUrl"
                        type="url"
                        placeholder={
                          type === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://ejemplo.com/archivo.pdf"
                        }
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Lección"
                      )}
                    </Button>
                    <Link href={`/admin/courses/${courseId}`} className="flex-1">
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