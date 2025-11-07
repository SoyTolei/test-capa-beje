"use client"
  
import { useState, useEffect } from "react"  
import { useRouter } from "next/navigation"  
import Link from "next/link"  
import { AdminSidebar } from "@/components/admin-sidebar"  
import { Button } from "@/components/ui/button"  
import { Input } from "@/components/ui/input"  
import { Label } from "@/components/ui/label"  
import { Textarea } from "@/components/ui/textarea"  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"  
import { Alert, AlertDescription } from "@/components/ui/alert"  
import { Switch } from "@/components/ui/switch"  
import { Checkbox } from "@/components/ui/checkbox"  
import { Loader2, ArrowLeft } from "lucide-react"  
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
  
interface Category {  
  id: string  
  name: string  
  icon: string | null  
  color: string | null  
}
  
export default function NewCoursePage() {  
  const [title, setTitle] = useState("")  
  const [description, setDescription] = useState("")  
  const [thumbnailUrl, setThumbnailUrl] = useState("")  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])  
  const [categories, setCategories] = useState<Category[]>([])  
  const [isPublished, setIsPublished] = useState(false)  
  const [error, setError] = useState("")  
  const [loading, setLoading] = useState(false)  
  const router = useRouter()  
  const supabase = getSupabaseBrowserClient()
  
  // Cargar categorías  
  useEffect(() => {  
    async function loadCategories() {  
      const { data } = await supabase  
        .from('categories')  
        .select('id, name, icon, color')  
        .eq('is_active', true)  
        .order('order_index', { ascending: true })
        
      if (data) {  
        setCategories(data)  
      }  
    }  
    loadCategories()  
  }, [])
  
  const handleCategoryToggle = (categoryId: string) => {  
    setSelectedCategories(prev =>  
      prev.includes(categoryId)  
        ? prev.filter(id => id !== categoryId)  
        : [...prev, categoryId]  
    )  
  }
  
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
  
      if (selectedCategories.length === 0) {  
        throw new Error("Debes seleccionar al menos una categoría")  
      }
  
      // Crear curso  
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
  
      // Crear relaciones con categorías  
      const categoryInserts = selectedCategories.map(categoryId => ({  
        course_id: data.id,  
        category_id: categoryId,  
      }))
  
      const { error: categoriesError } = await supabase  
        .from('course_categories')  
        .insert(categoryInserts)
  
      if (categoriesError) throw categoriesError
  
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
  
                  {/* Selector de Categorías */}  
                  <div className="space-y-2">  
                    <Label>  
                      Categorías <span className="text-destructive">*</span>  
                    </Label>  
                    <div className="border rounded-lg p-4 space-y-3">  
                      {categories.length === 0 ? (  
                        <p className="text-sm text-muted-foreground">  
                          No hay categorías disponibles.{' '}  
                          <Link href="/admin/categories" className="text-primary hover:underline">  
                            Crear categoría  
                          </Link>  
                        </p>  
                      ) : (  
                        categories.map((category) => (  
                          <div key={category.id} className="flex items-center space-x-3">  
                            <Checkbox  
                              id={category.id}  
                              checked={selectedCategories.includes(category.id)}  
                              onCheckedChange={() => handleCategoryToggle(category.id)}  
                              disabled={loading}  
                            />  
                            <label  
                              htmlFor={category.id}  
                              className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"  
                            >  
                              {category.icon && (  
                                <span  
                                  className="text-lg w-8 h-8 rounded flex items-center justify-center"  
                                  style={{ backgroundColor: `${category.color}20` }}  
                                >  
                                  {category.icon}  
                                </span>  
                              )}  
                              {category.name}  
                            </label>  
                          </div>  
                        ))  
                      )}  
                    </div>  
                    <p className="text-xs text-muted-foreground">  
                      Selecciona una o más categorías para este curso  
                    </p>  
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