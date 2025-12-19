import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Product, Category, Brand } from '@/types';

interface EditProductDialogProps {
    open: boolean;
    onClose: () => void;
    onProductUpdated: () => void;
    product: Product | null;
}



export const EditProductDialog: React.FC<EditProductDialogProps> = ({ open, onClose, onProductUpdated, product }) => {
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
            if (product) {
                setNombre(product.nombre);
                setSku(product.sku_base || '');
                setDescripcion(product.descripcion || '');
                // Assuming product has Categoria/Marca objects with names, but we need IDs to update.
                // If the product object doesn't have IDs directly, we might need a DETAIL fetch or rely on what's available.
                // API GET /products list usually returns full objects with joined tables.
                // Assuming product has id_categoria/id_marca OR we extract from nested if possible?
                // The provided interface for ProductList has Categoria: { nombre }. It might not have ID.
                // Let's check "User Request": GET /api/products returns list.
                // If list doesn't have IDs, we should fetch DETAIL.
                // Plan: Fetch DETAIL first to be safe, or just use what we have if we update the interface to include IDs.
                // I will add id_categoria and id_marca to the Product interface in ProductList if they are returned.
                // FOR NOW, I will try to fetch DETAIL to get IDs if I can't find them.
                // Actually, I'll assume they are present in the product object even if not displayed, 
                // but types might block me.
                // Let's fetch Detail content to be sure.
                if (product.id_producto) {
                    fetchProductDetail(product.id_producto);
                }
            }
        }
    }, [open, product]);

    const fetchDependencies = async () => {
        try {
            const cats = await FetchData<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
            const brs = await FetchData<Brand[]>(API_ENDPOINTS.CATALOG.BRANDS);
            setCategories(Array.isArray(cats) ? cats : (cats as any).data || []);
            setBrands(Array.isArray(brs) ? brs : (brs as any).data || []);
        } catch (err) {
            console.error("Error fetching dependencies", err);
        }
    };

    const fetchProductDetail = async (id: number) => {
        try {
            const data = await FetchData<any>(API_ENDPOINTS.PRODUCTS.DETAIL(id)); // any to bypass strict checks for now
            if (data) {
                // Assuming data returned has the fields
                setNombre(data.nombre);
                setSku(data.sku_base || '');
                setDescripcion(data.descripcion || '');
                setCategoryId(data.id_categoria?.toString() || '');
                setBrandId(data.id_marca?.toString() || '');
            }
        } catch (err) {
            console.error("Error fetching product details", err);
        }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (!product) return;

        try {
            await FetchData(API_ENDPOINTS.PRODUCTS.UPDATE(product.id_producto), 'PUT', {
                body: {
                    nombre,
                    sku_base: sku,
                    descripcion,
                    id_categoria: parseInt(categoryId),
                    id_marca: parseInt(brandId),
                    activo: product.activo // preserve active status
                }
            });
            onProductUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error updating product');
        } finally {
            setLoading(false);
        }
    };
  
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                         <DialogDescription>
                            Modifica los detalles del producto <strong>{product?.nombre}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label htmlFor="edit-nombre">Nombre</Label>
                            <Input id="edit-nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del producto" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label>Categoría</Label>
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
                                <Label>Marca</Label>
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
                            <Label htmlFor="edit-sku">SKU Base</Label>
                            <Input id="edit-sku" value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU" />
                        </div>
        
                        <div className="grid gap-2">
                            <Label htmlFor="edit-descripcion">Descripción</Label>
                            <Textarea id="edit-descripcion" value={descripcion} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)} placeholder="Detalles..." />
                        </div>
                        
                        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                         <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
