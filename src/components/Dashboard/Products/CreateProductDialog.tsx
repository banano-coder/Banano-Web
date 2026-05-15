import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { FetchData } from '@/services/fetch'
import { API_ENDPOINTS } from '@/services/api'
import type { Category, Brand } from '@/types'

interface CreateProductDialogProps {
  onProductCreated: () => void
}

export const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  onProductCreated
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Form state
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')

  useEffect(() => {
    if (open) {
      fetchDependencies()
    }
  }, [open])

  const fetchDependencies = async () => {
    setLoading(true)
    try {
      const cats = await FetchData<Category[]>(API_ENDPOINTS.CATEGORIES.LIST)
      const brs = await FetchData<Brand[]>(API_ENDPOINTS.BRANDS.LIST)
      setCategories(Array.isArray(cats) ? cats : (cats as any).data || [])
      setBrands(Array.isArray(brs) ? brs : (brs as any).data || [])
    } catch (err) {
      console.error('Error fetching dependencies', err)
    } finally {
      setLoading(false)
    }
  }

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingBrand, setIsAddingBrand] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')

  const handleSaveNewCategory = async () => {
    if (!newCategoryName || newCategoryName.trim() === '') return;
    setLoading(true);
    try {
      const res = await FetchData<any>(API_ENDPOINTS.CATEGORIES.LIST, 'POST', {
        body: { nombre: newCategoryName.trim() }
      });
      const catId = res.id_categoria || res.category?.id_categoria;
      if (res && catId) {
        await fetchDependencies();
        setCategoryId(catId.toString());
        setIsAddingCategory(false);
        setNewCategoryName('');
      }
    } catch (err: any) {
      setError(err.message || "Error al crear categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewBrand = async () => {
    if (!newBrandName || newBrandName.trim() === '') return;
    setLoading(true);
    try {
      const res = await FetchData<any>(API_ENDPOINTS.BRANDS.LIST, 'POST', {
        body: { nombre: newBrandName.trim() }
      });
      const brId = res.id_marca || res.brand?.id_marca;
      if (res && brId) {
        await fetchDependencies();
        setBrandId(brId.toString());
        setIsAddingBrand(false);
        setNewBrandName('');
      }
    } catch (err: any) {
      setError(err.message || "Error al crear marca");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!nombre || !categoryId || !brandId) {
      setError('Nombre, Categoría y Marca son obligatorios.')
      setLoading(false)
      return
    }

    try {
      await FetchData(API_ENDPOINTS.PRODUCTS.CREATE, 'POST', {
        body: {
          nombre,
          descripcion,
          id_categoria: parseInt(categoryId),
          id_marca: parseInt(brandId),
          activo: true
        }
      })
      setSuccess("Producto creado correctamente");
      setTimeout(() => {
        onProductCreated()
        setOpen(false)
        // Reset form
        setNombre('')
        setDescripcion('')
        setCategoryId('')
        setBrandId('')
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error creating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Producto</DialogTitle>
            <DialogDescription>
              Agrega un nuevo producto al catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Banano Cavendish"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Categoría *</Label>
                </div>
                {!isAddingCategory ? (
                  <div className="space-y-2">
                    <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(c => c.id_categoria != null)
                          .map(c => (
                            <SelectItem
                              key={c.id_categoria}
                              value={c.id_categoria.toString()}>
                              {c.nombre || 'Sin nombre'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="px-0 h-auto text-xs"
                      onClick={() => setIsAddingCategory(true)}
                    >
                      + Agregar categoría
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 border p-2 rounded-md bg-muted/30">
                    <Input
                      placeholder="Nueva categoría..."
                      className="h-8 text-xs"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" className="h-7 text-[10px] flex-1" onClick={handleSaveNewCategory} disabled={loading}>
                        Aceptar
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => setIsAddingCategory(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Marca *</Label>
                </div>
                {!isAddingBrand ? (
                  <div className="space-y-2">
                    <Select value={brandId} onValueChange={setBrandId} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands
                          .filter(b => b.id_marca != null)
                          .map(b => (
                            <SelectItem
                              key={b.id_marca}
                              value={b.id_marca.toString()}>
                              {b.nombre || 'Sin nombre'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="px-0 h-auto text-xs"
                      onClick={() => setIsAddingBrand(true)}
                    >
                      + Agregar marca
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 border p-2 rounded-md bg-muted/30">
                    <Input
                      placeholder="Nueva marca..."
                      className="h-8 text-xs"
                      value={newBrandName}
                      onChange={e => setNewBrandName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" className="h-7 text-[10px] flex-1" onClick={handleSaveNewBrand} disabled={loading}>
                        Aceptar
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => setIsAddingBrand(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescripcion(e.target.value)
                }
                placeholder="Detalles del producto..."
              />
            </div>

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
