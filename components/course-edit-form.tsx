"use client"
  
import type React from "react"
  
import { useState, useEffect } from "react"  
import { useRouter } from "next/navigation"  
import { Button } from "@/components/ui/button"  
import { Input } from "@/components/ui/input"  
import { Label } from "@/components/ui/label"  
import { Textarea } from "@/components/ui/textarea"  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"  
import { Alert, AlertDescription } from "@/components/ui/alert"  
import { Switch } from "@/components/ui/switch"  
import { Checkbox } from "@/components/ui/checkbox"  
import { Loader2 } from "lucide-react"  
import { getSupabaseBrowserClient } from "@/lib/supabase/client"  
import type { Course } from "@/lib/types"  
import Link from "next/link"
  
interface CourseEditFormProps {  
  course: Course  
}
  
interface Category {  
  id: string  
  name: string  
  icon: string | null  
  color: string | null  
}
  
export function CourseEditForm({ course }: CourseEditFormProps) {  
  const [title, setTitle] = useState(course.title)  
  const [description, setDescription] = useState(course.description)  
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || "")  
  const [isPublished, setIsPublished] = useState(course.is_published)  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]) // ← NUEVO  
  const [categories, setCategories] = useState<Category[]>([]) // ← NUEVO  
  const [error, setError] = useState("")  
  const [success, setSuccess] = useState(false)  
  const [loading, setLoading] = useState(false)  
  const [loadingCategories, setLoadingCategories] = useState(true) // ← NUEVO  
  const router = useRouter()  
  const supabase = getSupabaseBrowserClient()
  
  // ← NUEVO: Cargar categorías y categorías del curso  
  useEffect(() => {  
    async function loadData() {  
      setLoadingCategories(true)
        
      // Cargar todas las categorías  
      const { data: allCategories } = await supabase  
        .from('categories')  
        .select('id, name, icon, color')  
        .eq('is_active', true)  
        .order('order_index', { ascending: true })
        
      if (allCategories) {  
        setCategories(allCategories)  
      }
  
      // Cargar categorías del curso actual  
      const { data: courseCategories } = await supabase  
        .from('course_categories')  
        .select('category_id')  
        .eq('course_id', course.id)
        
      if (courseCategories) {  
        setSelectedCategories(courseCategories.map((cc: { category_id: any }) => cc.category_id))  
      }
  
      setLoadingCategories(false)  
    }  
    loadData()  
  }, [course.id])
  
  // ← NUEVO: Manejar toggle de categorías  
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
    setSuccess(false)  
    setLoading(true)
  
    try {  
      // ← NUEVO: Validar categorías  
      if (selectedCategories.length === 0) {  
        throw new Error("Debes seleccionar al menos una categoría")  
      }
  
      // Actualizar curso  
      const { error: updateError } = await supabase  
        .from("courses")  
        .update({  
          title,  
          description,  
          thumbnail_url: thumbnailUrl || null,  
          is_published: isPublished,  
          updated_at: new Date().toISOString(),  
        })  
        .eq("id", course.id)
  
      if (updateError) throw updateError
  
      // ← NUEVO: Actualizar categorías  
      // Eliminar categorías anteriores  
      await supabase  
        .from('course_categories')  
        .delete()  
        .eq('course_id', course.id)
  
      // Insertar nuevas categorías  
      const categoryInserts = selectedCategories.map(categoryId => ({  
        course_id: course.id,  
        category_id: categoryId,  
      }))
  
      const { error: categoriesError } = await supabase  
        .from('course_categories')  
        .insert(categoryInserts)
  
      if (categoriesError) throw categoriesError
  
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
  
          {/* ← NUEVO: Selector de Categorías */}  
          <div className="space-y-2">  
            <Label>  
              Categorías <span className="text-destructive">*</span>  
            </Label>  
            <div className="border rounded-lg p-4 space-y-3">  
              {loadingCategories ? (  
                <p className="text-sm text-muted-foreground">Cargando categorías...</p>  
              ) : categories.length === 0 ? (  
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
                      id={`cat-${category.id}`}  
                      checked={selectedCategories.includes(category.id)}  
                      onCheckedChange={() => handleCategoryToggle(category.id)}  
                      disabled={loading}  
                    />  
                    <label  
                      htmlFor={`cat-${category.id}`}  
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
  
          <Button type="submit" disabled={loading || loadingCategories}>  
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