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
import { Loader2, Plus, Trash, Edit, ArrowRightLeft, Copy, AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea'; // For JSON/attributes if needed
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from '@/components/ui/alert-dialog';

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
    const [error, setError] = useState<string | null>(null);
    const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);

    // Create/Edit Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCloneMode, setIsCloneMode] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [formData, setFormData] = useState({
        sku: '',
        precio_lista: '',
        costo: '',
        codigo_barras: '',
        activo: true,
        atributos: [] as { key: string; value: string }[]
    });
    const [saving, setSaving] = useState(false);
    const [registeringStock, setRegisteringStock] = useState(false);
    const [quickStock, setQuickStock] = useState({
        cantidad: '',
        tipo: 'entrada',
        motivo: ''
    });

    const handleRegisterQuickStock = async () => {
        if (!editingVariant || !quickStock.cantidad) return;
        const cantNum = parseInt(quickStock.cantidad);
        if (isNaN(cantNum) || cantNum <= 0) {
            setError("La cantidad debe ser un número mayor a cero.");
            return;
        }

        setRegisteringStock(true);
        setError(null);
        try {
            await FetchData(API_ENDPOINTS.INVENTORY.MOVEMENTS, 'POST', {
                body: {
                    id_variante_producto: editingVariant.id_variante_producto,
                    tipo: quickStock.tipo,
                    cantidad: parseInt(quickStock.cantidad),
                    motivo: quickStock.motivo || 'Ajuste rápido desde edición'
                }
            });
            // Reset stock form
            setQuickStock({ cantidad: '', tipo: 'entrada', motivo: '' });
            // Refresh to see new stock
            await fetchVariants();
            setIsDialogOpen(false);
        } catch (err: any) {
            setError(err.message || "Error al registrar stock");
            console.error("Error registering quick stock", err);
        } finally {
            setRegisteringStock(false);
        }
    };

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

    const handleOpenDialog = (variant?: Variant, isClone = false) => {
        setError(null);
        setIsCloneMode(isClone);
        if (variant) {
            setEditingVariant(isClone ? null : variant); // If clone, we are creating a NEW one, so editingVariant is null
            setFormData({
                sku: isClone ? '[ GENERACIÓN AUTOMÁTICA ]' : (variant.sku || ''),
                precio_lista: (variant.precio_lista ?? '').toString(),
                costo: (variant.costo ?? '').toString(),
                codigo_barras: variant.codigo_barras || '',
                activo: variant.activo ?? true,
                atributos: variant.atributos_json && typeof variant.atributos_json === 'object'
                    ? Object.entries(variant.atributos_json).map(([key, value]) => ({ key, value: String(value) }))
                    : []
            });
        } else {
            setEditingVariant(null);
            // Pre-fill with a placeholder indicating it's system-generated
            setFormData({ sku: '[ GENERACIÓN AUTOMÁTICA ]', precio_lista: '', costo: '', codigo_barras: '', activo: true, atributos: [] });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                sku: formData.sku === '[ GENERACIÓN AUTOMÁTICA ]' ? undefined : formData.sku,
                precio_lista: parseFloat(formData.precio_lista) || 0,
                costo: parseFloat(formData.costo) || 0,
                codigo_barras: formData.codigo_barras,
                activo: formData.activo,
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
        } catch (err: any) {
            setError(err.message || "Error al guardar variante");
            console.error("Error saving variant", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVariant = (variant: Variant) => {
        setError(null);
        setVariantToDelete(variant);
    };

    const handleDeleteConfirm = async () => {
        if (!variantToDelete) return;
        setError(null);
        try {
            await FetchData(API_ENDPOINTS.VARIANTS.ITEM(variantToDelete.id_variante_producto), 'DELETE');
            fetchVariants();
        } catch (err: any) {
            setError(err.message || "Error al eliminar variante");
            console.error("Error deleting variant", err);
        } finally {
            setVariantToDelete(null);
        }
    };

    return (
        <div className="space-y-4 pt-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 animate-pulse flex-shrink-0" />
                        <span className="text-xs font-semibold">{error}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 text-red-500 hover:bg-red-500/10 flex-shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
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
                            <TableHead>Stock</TableHead>
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
                                    <TableCell>
                                        <span className={`font-bold ${variant.stock_actual <= 5 ? 'text-red-500' : ''}`}>
                                            {variant.stock_actual ?? 0}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.activo ? 'default' : 'destructive'}>
                                            {variant.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(variant)} title="Editar">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(variant, true)} title="Duplicar" className="text-blue-500 hover:text-blue-600">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteVariant(variant)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            title="Eliminar"
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
                <DialogContent className="sm:max-w-[500px] bg-card/95 border border-border backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingVariant ? 'Editar Variante' : (isCloneMode ? 'Duplicar Variante' : 'Nueva Variante')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex justify-between items-center animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 animate-pulse flex-shrink-0" />
                                    <span className="text-xs font-semibold">{error}</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => setError(null)} className="h-5 w-5 text-red-500 hover:bg-red-500/10 flex-shrink-0">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <form onSubmit={handleSave} className="space-y-4">
                            {editingVariant && (
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">SKU (Código de Referencia)</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        readOnly
                                        className="bg-muted font-mono cursor-not-allowed opacity-80"
                                    />
                                    <p className="text-[10px] text-muted-foreground font-medium italic">
                                        Código asignado por el sistema. No editable para mantener la secuencia.
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Precio Lista</Label>
                                    <Input
                                        type="number" step="0.01" min="0"
                                        value={formData.precio_lista}
                                        onChange={e => setFormData({ ...formData, precio_lista: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Costo Unitario</Label>
                                    <Input
                                        type="number" step="0.01" min="0"
                                        value={formData.costo}
                                        onChange={e => setFormData({ ...formData, costo: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Código de Barras (Opcional)</Label>
                                <Input
                                    value={formData.codigo_barras}
                                    onChange={e => setFormData({ ...formData, codigo_barras: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center space-x-2 border-t pt-4">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={formData.activo}
                                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                />
                                <Label htmlFor="activo" className="text-sm font-semibold cursor-pointer">
                                    Variante Activa (Disponible para venta)
                                </Label>
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
                                                        newAttrs[index].key = val;
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

                            <div className="pt-2">
                                <Button type="submit" disabled={saving} className="w-full">
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingVariant ? 'Guardar Cambios' : 'Crear Variante'}
                                </Button>
                            </div>
                        </form>

                        {/* QUICK STOCK SECTION (Only for existing variants) */}
                        {editingVariant && (
                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                                        <ArrowRightLeft className="h-4 w-4" /> Gestión Rápida de Stock
                                    </h4>
                                    <Badge variant="outline" className="font-mono">
                                        Actual: {editingVariant.stock_actual ?? 0}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs">Tipo</Label>
                                        <Select
                                            value={quickStock.tipo}
                                            onValueChange={(val: any) => setQuickStock({ ...quickStock, tipo: val })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="entrada">Entrada (+)</SelectItem>
                                                <SelectItem value="salida">Salida (-)</SelectItem>
                                                <SelectItem value="ajuste">Ajuste (Manual)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs">Cantidad</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            className="h-8 text-xs"
                                            value={quickStock.cantidad}
                                            onChange={e => setQuickStock({ ...quickStock, cantidad: e.target.value })}
                                            placeholder="Ej: 10"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs">Motivo / Referencia</Label>
                                    <Input
                                        className="h-8 text-xs"
                                        value={quickStock.motivo}
                                        onChange={e => setQuickStock({ ...quickStock, motivo: e.target.value })}
                                        placeholder="Ej: Ajuste inicial, Entrada pedido..."
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="w-full h-8 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                    disabled={registeringStock || !quickStock.cantidad}
                                    onClick={handleRegisterQuickStock}
                                >
                                    {registeringStock ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                                    Registrar Stock
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs">
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Custom confirmation dialog for deletion */}
            <AlertDialog open={!!variantToDelete} onOpenChange={(open) => !open && setVariantToDelete(null)}>
                <AlertDialogContent className="bg-card/95 border border-border backdrop-blur-md shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground font-bold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" /> ¿Eliminar variante?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-xs">
                            Esta acción realizará un **borrado lógico** de la variante con SKU <strong className="font-mono">{variantToDelete?.sku}</strong>. El historial de inventario y movimientos se conservará para auditoría.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="border-t pt-3 mt-2">
                        <AlertDialogCancel className="border-border text-foreground hover:bg-muted text-xs h-9 px-4 rounded-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm} 
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 px-4 rounded-lg active:scale-95 transition-all"
                        >
                            Eliminar Variante
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
