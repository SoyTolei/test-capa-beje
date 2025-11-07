'use client'
  
import { Button } from '@/components/ui/button'  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'  
import { Pencil, Trash2 } from 'lucide-react'
  
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
  
interface CategoryCardProps {  
  category: Category  
  onEdit: (category: Category) => void  
  onDelete: (categoryId: string) => void  
}
  
export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {  
  return (  
    <Card>  
      <CardHeader>  
        <div className="flex items-start justify-between">  
          <div className="flex items-center gap-3">  
            {category.icon && (  
              <div  
                className="text-3xl w-12 h-12 rounded-lg flex items-center justify-center"  
                style={{ backgroundColor: `${category.color}20` }}  
              >  
                {category.icon}  
              </div>  
            )}  
            <div>  
              <CardTitle className="text-lg">{category.name}</CardTitle>  
              {category.description && (  
                <CardDescription className="text-sm mt-1">{category.description}</CardDescription>  
              )}  
            </div>  
          </div>  
        </div>  
      </CardHeader>  
      <CardContent>  
        <div className="flex items-center justify-between">  
          <div className="flex items-center gap-2">  
            {category.color && (  
              <div  
                className="w-4 h-4 rounded-full border"  
                style={{ backgroundColor: category.color }}  
              />  
            )}  
            <span className="text-xs text-muted-foreground">{category.slug}</span>  
          </div>  
          <div className="flex items-center gap-2">  
            <Button  
              variant="ghost"  
              size="sm"  
              onClick={() => onEdit(category)}  
            >  
              <Pencil className="h-4 w-4" />  
            </Button>  
            <Button  
              variant="ghost"  
              size="sm"  
              onClick={() => onDelete(category.id)}  
            >  
              <Trash2 className="h-4 w-4 text-destructive" />  
            </Button>  
          </div>  
        </div>  
      </CardContent>  
    </Card>  
  )  
}  