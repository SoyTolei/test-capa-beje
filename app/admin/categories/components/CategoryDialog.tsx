'use client'
  
import { useState, useEffect } from 'react'  
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'  
import { Button } from '@/components/ui/button'  
import { Input } from '@/components/ui/input'  
import { Label } from '@/components/ui/label'  
import { Textarea } from '@/components/ui/textarea'  
import { Alert, AlertDescription } from '@/components/ui/alert'
  
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
  
interface CategoryDialogProps {  
  isOpen: boolean  
  onClose: () => void  
  category: Category | null  
  onSave: (category: Category) => void  
}
  
export function CategoryDialog({ isOpen, onClose, category, onSave }: CategoryDialogProps) {  
  const [name, setName] = useState('')  
  const [description, setDescription] = useState('')  
  const [icon, setIcon] = useState('')  
  const [color, setColor] = useState('#3B82F6')  
  const [loading, setLoading] = useState(false)  
  const [error, setError] = useState('')
  
  useEffect(() => {  
    if (category) {  
      setName(category.name)  
      setDescription(category.description || '')  
      setIcon(category.icon || '')  
      setColor(category.color || '#3B82F6')  
    } else {  
      setName('')  
      setDescription('')  
      setIcon('')  
      setColor('#3B82F6')  
    }  
    setError('')  
  }, [category, isOpen])
  
  const generateSlug = (text: string) => {  
    return text  
      .toLowerCase()  
      .normalize('NFD')  
      .replace(/[\u0300-\u036f]/g, '')  
      .replace(/[^a-z0-9]+/g, '-')  
      .replace(/(^-|-$)/g, '')  
  }
  
  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault()  
    setError('')  
    setLoading(true)
  
    try {  
      const slug = generateSlug(name)  
      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories'  
      const method = category ? 'PUT' : 'POST'
  
      const response = await fetch(url, {  
        method,  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          name,  
          slug,  
          description: description || null,  
          icon: icon || null,  
          color: color || null,  
        }),  
      })
  
      const data = await response.json()
  
      if (!response.ok) {  
        throw new Error(data.error || 'Error al guardar')  
      }
  
      onSave(data.category)  
      onClose()  
    } catch (err: any) {  
      setError(err.message)  
    } finally {  
      setLoading(false)  
    }  
  }
  
  return (  
    <Dialog open={isOpen} onOpenChange={onClose}>  
      <DialogContent>  
        <DialogHeader>  
          <DialogTitle>{category ? 'Editar Categoría' : 'Crear Categoría'}</DialogTitle>  
          <DialogDescription>  
            {category ? 'Modifica los datos de la categoría' : 'Completa los datos de la nueva categoría'}  
          </DialogDescription>  
        </DialogHeader>
  
        <form onSubmit={handleSubmit} className="space-y-4">  
          {error && (  
            <Alert variant="destructive">  
              <AlertDescription>{error}</AlertDescription>  
            </Alert>  
          )}
  
          <div className="space-y-2">  
            <Label htmlFor="name">Nombre *</Label>  
            <Input  
              id="name"  
              placeholder="Ej: Técnico"  
              value={name}  
              onChange={(e) => setName(e.target.value)}  
              required  
              disabled={loading}  
            />  
          </div>
  
          <div className="space-y-2">  
            <Label htmlFor="description">Descripción</Label>  
            <Textarea  
              id="description"  
              placeholder="Descripción de la categoría..."  
              value={description}  
              onChange={(e) => setDescription(e.target.value)}  
              disabled={loading}  
              rows={3}  
            />  
          </div>
  
          <div className="grid grid-cols-2 gap-4">  
            <div className="space-y-2">  
              <Label htmlFor="icon">Icono (Emoji)</Label>  
              <Input  
                id="icon"  
                placeholder="🔧"  
                value={icon}  
                onChange={(e) => setIcon(e.target.value)}  
                disabled={loading}  
                maxLength={2}  
              />  
            </div>
  
            <div className="space-y-2">  
              <Label htmlFor="color">Color</Label>  
              <div className="flex gap-2">  
                <Input  
                  id="color"  
                  type="color"  
                  value={color}  
                  onChange={(e) => setColor(e.target.value)}  
                  disabled={loading}  
                  className="w-20 h-10"  
                />  
                <Input  
                  type="text"  
                  value={color}  
                  onChange={(e) => setColor(e.target.value)}  
                  disabled={loading}  
                  placeholder="#3B82F6"  
                />  
              </div>  
            </div>  
          </div>
  
          <div className="flex gap-2 justify-end">  
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>  
              Cancelar  
            </Button>  
            <Button type="submit" disabled={loading}>  
              {loading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}  
            </Button>  
          </div>  
        </form>  
      </DialogContent>  
    </Dialog>  
  )  
}  