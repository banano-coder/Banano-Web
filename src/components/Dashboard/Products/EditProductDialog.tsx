import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FetchData } from '@/services/fetch'
import { API_ENDPOINTS } from '@/services/api'
import type { Product, Category, Brand } from '@/types'

// Sub-components
import { ProductVariantsTab } from './tabs/ProductVariantsTab';
import { ProductImagesTab } from './tabs/ProductImagesTab';
import { ProductInventoryTab } from './tabs/ProductInventoryTab';

interface EditProductDialogProps {
  open: boolean
  onClose: () => void
  onProductUpdated: () => void
  product: Product | null
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onClose,
  onProductUpdated,
  product
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
      if (product) {
        setNombre(product.nombre)
        setDescripcion(product.descripcion || '')

        if (product.id_producto) {
          fetchProductDetail(product.id_producto)
        }
      }
    }
  }, [open, product])

  const fetchDependencies = async () => {
    setLoading(true)
    try {
      const cats = await FetchData<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES)
      const brs = await FetchData<Brand[]>(API_ENDPOINTS.CATALOG.BRANDS)
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
      const res = await FetchData<any>(API_ENDPOINTS.CATALOG.CATEGORIES, 'POST', {
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
      const res = await FetchData<any>(API_ENDPOINTS.CATALOG.BRANDS, 'POST', {
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

  const fetchProductDetail = async (id: number) => {
    try {
      const data = await FetchData<any>(API_ENDPOINTS.PRODUCTS.DETAIL(id))
      if (data) {
        setNombre(data.nombre)
        setDescripcion(data.descripcion || '')
        setCategoryId(data.id_categoria?.toString() || '')
        setBrandId(data.id_marca?.toString() || '')
      }
    } catch (err) {
      console.error('Error fetching product details', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!product) return

    try {
      await FetchData(
        API_ENDPOINTS.PRODUCTS.UPDATE(product.id_producto),
        'PUT',
        {
          body: {
            nombre,
            descripcion,
            id_categoria: parseInt(categoryId),
            id_marca: parseInt(brandId),
            activo: product.activo
          }
        }
      )
      onProductUpdated()
      setSuccess("Producto actualizado correctamente");
    } catch (err: any) {
      setError(err.message || 'Error updating product')
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 gap-0 bg-background">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Gestionar Producto: {product.nombre}</DialogTitle>
          <DialogDescription>
            Edita información general, variantes, imágenes e inventario.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="general" className="mt-0 h-full">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Categoría</Label>
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
                      <Label>Marca</Label>
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
                  <Label htmlFor="edit-descripcion">Descripción</Label>
                  <Textarea
                    id="edit-descripcion"
                    value={descripcion}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDescripcion(e.target.value)
                    }
                    placeholder="Detalles..."
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

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Información General'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="variants" className="mt-0">
              <ProductVariantsTab product={product} />
            </TabsContent>

            <TabsContent value="images" className="mt-0">
              <ProductImagesTab product={product} />
            </TabsContent>

            <TabsContent value="inventory" className="mt-0">
              <ProductInventoryTab product={product} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
