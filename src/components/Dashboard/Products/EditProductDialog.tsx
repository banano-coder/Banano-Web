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

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Form state
  const [nombre, setNombre] = useState('')
  const [sku, setSku] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')

  useEffect(() => {
    if (open) {
      fetchDependencies()
      if (product) {
        setNombre(product.nombre)
        setSku(product.sku_base || '')
        setDescripcion(product.descripcion || '')
        
        if (product.id_producto) {
          fetchProductDetail(product.id_producto)
        }
      }
    }
  }, [open, product])

  const fetchDependencies = async () => {
    try {
      const cats = await FetchData<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES)
      const brs = await FetchData<Brand[]>(API_ENDPOINTS.CATALOG.BRANDS)
      setCategories(Array.isArray(cats) ? cats : (cats as any).data || [])
      setBrands(Array.isArray(brs) ? brs : (brs as any).data || [])
    } catch (err) {
      console.error('Error fetching dependencies', err)
    }
  }

  const fetchProductDetail = async (id: number) => {
    try {
      const data = await FetchData<any>(API_ENDPOINTS.PRODUCTS.DETAIL(id))
      if (data) {
        setNombre(data.nombre)
        setSku(data.sku_base || '')
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
            sku_base: sku,
            descripcion,
            id_categoria: parseInt(categoryId),
            id_marca: parseInt(brandId),
            activo: product.activo
          }
        }
      )
      onProductUpdated()
      // onClose() // Don't close, user might want to edit variants next
      alert("Producto actualizado correctamente");
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
                                <Label>Categoría</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
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
                            </div>
                            <div className="grid gap-2">
                                <Label>Marca</Label>
                                <Select value={brandId} onValueChange={setBrandId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
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
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-sku">SKU Base</Label>
                            <Input
                                id="edit-sku"
                                value={sku}
                                onChange={e => setSku(e.target.value)}
                                placeholder="SKU"
                            />
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

                        {error && (
                            <div className="text-red-500 text-sm font-medium">{error}</div>
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
