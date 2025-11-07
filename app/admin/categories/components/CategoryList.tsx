'use client'
  
import { useState } from 'react'  
import { Button } from '@/components/ui/button'  
import { Plus } from 'lucide-react'  
import { CategoryCard } from './CategoryCard'  
import { CategoryDialog } from './CategoryDialog'
  
interface Category {  
  id: string  
  name: string  
  slug: string  
  description: string | null  
  icon: string | null  
  color: string | null  
  order_index: number  
  is_active: boolean  
}
  
interface CategoryListProps {  
  categories: Category[]  
}
  
export function CategoryList({ categories: initialCategories }: CategoryListProps) {  
  const [categories, setCategories] = useState(initialCategories)  
  const [isDialogOpen, setIsDialogOpen] = useState(false)  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const handleCreate = () => {  
    setEditingCategory(null)  
    setIsDialogOpen(true)  
  }
  
  const handleEdit = (category: Category) => {  
    setEditingCategory(category)  
    setIsDialogOpen(true)  
  }
  
  const handleDelete = async (categoryId: string) => {  
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
  
    try {  
      const response = await fetch(`/api/admin/categories/${categoryId}`, {  
        method: 'DELETE',  
      })
  
      if (!response.ok) {  
        const data = await response.json()  
        throw new Error(data.error || 'Error al eliminar')  
      }
  
      setCategories(categories.filter((c) => c.id !== categoryId))  
    } catch (error: any) {  
      alert(error.message)  
    }  
  }
  
  const handleSave = (savedCategory: Category) => {  
    if (editingCategory) {  
      // Update existing  
      setCategories(categories.map((c) => (c.id === savedCategory.id ? savedCategory : c)))  
    } else {  
      // Add new  
      setCategories([...categories, savedCategory])  
    }  
    setIsDialogOpen(false)  
    setEditingCategory(null)  
  }
  
  return (  
    <div className="space-y-4">  
      <div className="flex justify-end">  
        <Button onClick={handleCreate}>  
          <Plus className="h-4 w-4 mr-2" />  
          Crear Categoría  
        </Button>  
      </div>
  
      {categories.length === 0 ? (  
        <div className="text-center py-12">  
          <p className="text-muted-foreground">No hay categorías creadas</p>  
          <Button onClick={handleCreate} className="mt-4">  
            Crear Primera Categoría  
          </Button>  
        </div>  
      ) : (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
          {categories.map((category) => (  
            <CategoryCard  
              key={category.id}  
              category={category}  
              onEdit={handleEdit}  
              onDelete={handleDelete}  
            />  
          ))}  
        </div>  
      )}
  
      <CategoryDialog  
        isOpen={isDialogOpen}  
        onClose={() => {  
          setIsDialogOpen(false)  
          setEditingCategory(null)  
        }}  
        category={editingCategory}  
        onSave={handleSave}  
      />  
    </div>  
  )  
}  