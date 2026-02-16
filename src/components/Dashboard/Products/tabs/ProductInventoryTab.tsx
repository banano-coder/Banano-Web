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
import { Loader2, ArrowRightLeft, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductInventoryTabProps {
    product: Product;
}

interface StockInfo {
    id_variante: number;
    stock: number;
}

export const ProductInventoryTab: React.FC<ProductInventoryTabProps> = ({ product }) => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [stocks, setStocks] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    // Movement Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [moveType, setMoveType] = useState<string>('entrada');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [refExt, setRefExt] = useState('');
    const [costUnit, setCostUnit] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchVariantsAndStock = async () => {
        if (!product?.id_producto) return;
        setLoading(true);
        try {
            // Get Variants (now includes stock_actual)
            const vResponse = await FetchData<any>(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto));
            const vData: Variant[] = vResponse.data || [];
            setVariants(vData);

            // Populate stocks map directly from variant data
            const stockMap: Record<number, number> = {};
            vData.forEach(v => {
                stockMap[v.id_variante_producto] = v.stock_actual || 0;
            });
            setStocks(stockMap);

        } catch (error) {
            console.error("Error fetching inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariantsAndStock();
    }, [product]);

    const handleMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                id_variante_producto: parseInt(selectedVariantId),
                tipo: moveType,
                cantidad: parseInt(amount),
                motivo: reason,
                ref_externa: refExt,
                costo_unitario: costUnit ? parseFloat(costUnit) : undefined
            };

            await FetchData(API_ENDPOINTS.INVENTORY.MOVEMENTS, 'POST', { body: payload });

            // Refresh
            setIsDialogOpen(false);
            fetchVariantsAndStock();

            // Reset form
            setAmount('');
            setReason('');
            setRefExt('');
            setCostUnit('');
        } catch (error: any) {
            alert(error.message || "Error registrando movimiento");
            console.error("Movement error", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pt-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Control de Inventario</h3>
                <Button onClick={() => setIsDialogOpen(true)} disabled={variants.length === 0}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Registrar Movimiento
                </Button>
            </div>

            {variants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                    No hay variantes configuradas. Crea variantes primero para gestionar inventario.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {variants.map(v => (
                        <Card key={v.id_variante_producto}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    SKU: {v.sku}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stocks[v.id_variante_producto] ?? '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">Unidades Disponibles</p>
                                <div className="text-xs flex gap-2">
                                    <Badge variant="outline">Cost: ${v.costo}</Badge>
                                    <Badge variant="outline">Price: ${v.precio_lista}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleMovement} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Variante</Label>
                            <Select value={selectedVariantId} onValueChange={setSelectedVariantId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona variante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {variants.map(v => (
                                        <SelectItem key={v.id_variante_producto} value={v.id_variante_producto.toString()}>
                                            {v.sku} (Actual: {stocks[v.id_variante_producto]})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tipo Movimiento</Label>
                                <Select value={moveType} onValueChange={setMoveType}>
                                    <SelectTrigger>
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
                                <Label>Cantidad</Label>
                                <Input
                                    type="number" min="1"
                                    value={amount} onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Motivo / Descripción</Label>
                            <Input
                                value={reason} onChange={e => setReason(e.target.value)}
                                placeholder="Ej: Compra proveedor, merma..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Ref. Externa</Label>
                                <Input
                                    value={refExt} onChange={e => setRefExt(e.target.value)}
                                    placeholder="Fac-123"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Costo Unitario (Opcional)</Label>
                                <Input
                                    type="number" step="0.01" min="0"
                                    value={costUnit} onChange={e => setCostUnit(e.target.value)}
                                    placeholder="Auto"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
