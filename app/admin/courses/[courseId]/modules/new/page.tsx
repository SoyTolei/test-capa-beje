"use client"

import type React from "react"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Loader2, ArrowLeft } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface NewModulePageProps {
  params: Promise<{ courseId: string }>
}

export default function NewModulePage({ params }: NewModulePageProps) {
  const { courseId } = use(params)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Get current max order_index
      const { data: existingModules } = await supabase
        .from("modules")
        .select("order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: false })
        .limit(1)

      const nextOrderIndex = existingModules && existingModules.length > 0 ? existingModules[0].order_index + 1 : 1

      const { error } = await supabase.from("modules").insert({
        course_id: courseId,
        title,
        description: description || null,
        order_index: nextOrderIndex,
      })

      if (error) throw error

      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear el módulo")
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
              <h1 className="text-3xl font-bold text-foreground">Crear Nuevo Módulo</h1>
              <p className="text-muted-foreground mt-1">Agrega un módulo al curso</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información del Módulo</CardTitle>
                <CardDescription>Los módulos organizan las lecciones del curso</CardDescription>
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
                      Título del Módulo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Introducción al Sistema Bejerman"
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
                      placeholder="Describe el contenido de este módulo..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Módulo"
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
