import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Product, Variant } from '@/types';
import { Loader2, Plus, Trash, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea'; // For JSON/attributes if needed

interface ProductVariantsTabProps {
    product: Product;
}

const PREDEFINED_ATTRIBUTES = [
    "Talla",
    "Tamaño",
    "Color",
    "Material",
    "Peso",
    "Dimensiones",
    "Sabor",
    "Estilo",
    "Género"
];

export const ProductVariantsTab: React.FC<ProductVariantsTabProps> = ({ product }) => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Create/Edit Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [formData, setFormData] = useState({
        sku: '',
        precio_lista: '',
        costo: '',
        codigo_barras: '',
        atributos: [] as { key: string; value: string }[]
    });
    const [saving, setSaving] = useState(false);

    const fetchVariants = async () => {
        if (!product?.id_producto) return;
        setLoading(true);
        try {
            const response = await FetchData<any>(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto));
            const data = response.data || [];
            setVariants(data);
        } catch (error) {
            console.error("Error fetching variants", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [product]);

    const handleOpenDialog = (variant?: Variant) => {
        if (variant) {
            setEditingVariant(variant);
            setFormData({
                sku: variant.sku,
                precio_lista: variant.precio_lista.toString(),
                costo: variant.costo.toString(),
                codigo_barras: variant.codigo_barras || '',
                atributos: variant.atributos_json 
                    ? Object.entries(variant.atributos_json).map(([key, value]) => ({ key, value: String(value) }))
                    : []
            });
        } else {
            setEditingVariant(null);
            setFormData({ sku: '', precio_lista: '', costo: '', codigo_barras: '', atributos: [] });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                sku: formData.sku,
                precio_lista: parseFloat(formData.precio_lista) || 0,
                costo: parseFloat(formData.costo) || 0,
                codigo_barras: formData.codigo_barras,
                atributos_json: formData.atributos.reduce((acc, curr) => {
                    if (curr.key) acc[curr.key] = curr.value;
                    return acc;
                }, {} as Record<string, string>)
            };

            if (editingVariant) {
                await FetchData(API_ENDPOINTS.VARIANTS.ITEM(editingVariant.id_variante_producto), 'PATCH', { body: payload });
            } else {
                await FetchData(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto), 'POST', { body: payload });
            }
            setIsDialogOpen(false);
            fetchVariants();
        } catch (error) {
            console.error("Error saving variant", error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (variant: Variant) => {
        if(!confirm(`¿Seguro que deseas ${variant.activo ? 'desactivar' : 'activar'} esta variante?`)) return;
        try {
            await FetchData(API_ENDPOINTS.VARIANTS.ITEM(variant.id_variante_producto), 'PATCH', { 
                body: { activo: !variant.activo } 
            });
            fetchVariants();
        } catch (error) {
            console.error("Error toggling variant", error);
        }
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Variantes del Producto</h3>
                <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Variante
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Costo</TableHead>
                            <TableHead>Barras</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando...</TableCell>
                            </TableRow>
                        ) : variants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay variantes registradas.</TableCell>
                            </TableRow>
                        ) : (
                            variants.map(variant => (
                                <TableRow key={variant.id_variante_producto}>
                                    <TableCell className="font-medium">{variant.sku}</TableCell>
                                    <TableCell>${variant.precio_lista}</TableCell>
                                    <TableCell>${variant.costo}</TableCell>
                                    <TableCell>{variant.codigo_barras || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={variant.activo ? 'default' : 'destructive'}>
                                            {variant.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(variant)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleToggleStatus(variant)}
                                            className={variant.activo ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingVariant ? 'Editar Variante' : 'Nueva Variante'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>SKU</Label>
                            <Input 
                                value={formData.sku} 
                                onChange={e => setFormData({...formData, sku: e.target.value})} 
                                required 
                                placeholder="Ej: BAN-XS-001"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Precio Lista</Label>
                                <Input 
                                    type="number" step="0.01"
                                    value={formData.precio_lista} 
                                    onChange={e => setFormData({...formData, precio_lista: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Costo Unitario</Label>
                                <Input 
                                    type="number" step="0.01"
                                    value={formData.costo} 
                                    onChange={e => setFormData({...formData, costo: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                             <Label>Código de Barras (Opcional)</Label>
                             <Input 
                                 value={formData.codigo_barras} 
                                 onChange={e => setFormData({...formData, codigo_barras: e.target.value})} 
                             />
                         </div>

                        {/* Atributos Section */}
                        <div className="grid gap-2 border-t pt-4">
                            <Label className="flex justify-between items-center">
                                Características / Atributos
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setFormData(prev => ({ 
                                        ...prev, 
                                        atributos: [...prev.atributos, { key: '', value: '' }] 
                                    }))}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Agregar
                                </Button>
                            </Label>
                            
                            {formData.atributos.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">No hay atributos definidos (ej: Talla, Color).</p>
                            )}

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {formData.atributos.map((input, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="w-[140px]">
                                            <Select
                                                value={PREDEFINED_ATTRIBUTES.includes(input.key) ? input.key : (input.key ? 'otro' : '')}
                                                onValueChange={(val) => {
                                                    const newAttrs = [...formData.atributos];
                                                    if (val === 'otro') {
                                                        newAttrs[index].key = ''; // Reset for manual input if we were to support it, but for now just switching logic
                                                        // Actually, if 'otro' allow typing? The user just asked for a select.
                                                        // Let's stick to the list for now to satisfy "change field for a select".
                                                        // If they want custom, they might need a combobox.
                                                        // I'll assume just the list + a way to switch to custom if needed, or just the list.
                                                        // Let's implement the Select directly updating the key.
                                                    } else {
                                                        newAttrs[index].key = val;
                                                    }
                                                    setFormData({ ...formData, atributos: newAttrs });
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Atributo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PREDEFINED_ATTRIBUTES.map(attr => (
                                                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <Input
                                            placeholder="Valor (ej: Rojo)"
                                            value={input.value}
                                            onChange={e => {
                                                const newAttrs = [...formData.atributos];
                                                newAttrs[index].value = e.target.value;
                                                setFormData({ ...formData, atributos: newAttrs });
                                            }}
                                            className="h-8 text-xs flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newAttrs = formData.atributos.filter((_, i) => i !== index);
                                                setFormData({ ...formData, atributos: newAttrs });
                                            }}
                                            className="h-8 w-8 text-destructive hover:text-red-600 p-0"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                         <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
