import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Category, Brand } from '@/types';

interface CreateProductDialogProps {
  onProductCreated: () => void;
}



export const CreateProductDialog: React.FC<CreateProductDialogProps> = ({ onProductCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form state
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  useEffect(() => {
      if (open) {
          fetchDependencies();
      }
  }, [open]);

  const fetchDependencies = async () => {
      try {
          const cats = await FetchData<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
          const brs = await FetchData<Brand[]>(API_ENDPOINTS.CATALOG.BRANDS);
          // Catalog endpoints might return { data: [...] } or just [...]
          // Assuming array for now based on pattern, but if object check data prop
          setCategories(Array.isArray(cats) ? cats : (cats as any).data || []);
          setBrands(Array.isArray(brs) ? brs : (brs as any).data || []);
      } catch (err) {
          console.error("Error fetching dependencies", err);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      if (!nombre || !categoryId || !brandId) {
          setError('Nombre, Categoría y Marca son obligatorios.');
          setLoading(false);
          return;
      }

      try {
          await FetchData(API_ENDPOINTS.PRODUCTS.CREATE, 'POST', {
              body: {
                  nombre,
                  sku_base: sku,
                  descripcion,
                  id_categoria: parseInt(categoryId),
                  id_marca: parseInt(brandId),
                  activo: true
              }
          });
          onProductCreated();
          setOpen(false);
          // Reset form
          setNombre('');
          setSku('');
          setDescripcion('');
          setCategoryId('');
          setBrandId('');
      } catch (err: any) {
          setError(err.message || 'Error creating product');
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
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
                    <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Banano Cavendish" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label>Categoría *</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => (
                                    <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>{c.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Marca *</Label>
                         <Select value={brandId} onValueChange={setBrandId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {brands.map(b => (
                                    <SelectItem key={b.id_marca} value={b.id_marca.toString()}>{b.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="sku">SKU Base</Label>
                    <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} placeholder="Ej. BN-CV-001" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea id="descripcion" value={descripcion} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)} placeholder="Detalles del producto..." />
                </div>
                
                {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear Producto'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
