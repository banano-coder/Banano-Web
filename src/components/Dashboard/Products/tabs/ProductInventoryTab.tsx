import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Product, Variant, Almacen } from '@/types';
import { Loader2, ArrowRightLeft, History, Warehouse, AlertTriangle, X } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);
    const [stocks, setStocks] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);

    // Warehouses State
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('consolidado');
    const [selectedWarehouseMove, setSelectedWarehouseMove] = useState<string>('');
    const [dialogStocks, setDialogStocks] = useState<Record<number, number>>({});
    const [dialogStocksLoading, setDialogStocksLoading] = useState(false);
    const [isVendedor, setIsVendedor] = useState(false);

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
            // Get Variants (potentially filtered by warehouse)
            const queryParam = selectedWarehouseFilter !== 'consolidado' ? `?id_almacen=${selectedWarehouseFilter}` : '';
            const vResponse = await FetchData<any>(`${API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto)}${queryParam}`);
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

    const fetchWarehouses = async () => {
        try {
            const response = await FetchData<{ data: Almacen[] } | Almacen[]>(`${API_ENDPOINTS.ALMACENES.LIST}?activo=true`);
            let list: Almacen[] = [];
            if (response && 'data' in response && Array.isArray(response.data)) {
                list = response.data;
            } else if (Array.isArray(response)) {
                list = response;
            }
            setWarehouses(list);
            if (list.length > 0) {
                setSelectedWarehouseMove(list[0].id_almacen.toString());
            } else {
                setSelectedWarehouseMove('1');
            }
        } catch (error) {
            console.error("Error fetching warehouses", error);
        }
    };

    const fetchDialogStocks = async (warehouseId: string) => {
        if (!product?.id_producto || !warehouseId) return;
        setDialogStocksLoading(true);
        try {
            const queryParam = warehouseId !== 'consolidado' ? `?id_almacen=${warehouseId}` : '';
            const response = await FetchData<any>(`${API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto)}${queryParam}`);
            const data: Variant[] = response.data || [];
            const stockMap: Record<number, number> = {};
            data.forEach(v => {
                stockMap[v.id_variante_producto] = v.stock_actual || 0;
            });
            setDialogStocks(stockMap);
        } catch (error) {
            console.error("Error fetching dialog stocks", error);
        } finally {
            setDialogStocksLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && Array.isArray(user.roles)) {
                    const rolesLower = user.roles.map((r: string) => r.toLowerCase());
                    setIsVendedor(rolesLower.includes('vendedor'));
                }
            } catch (e) {
                console.error("Error parsing user roles in ProductInventoryTab", e);
            }
        }
    }, []);

    useEffect(() => {
        fetchVariantsAndStock();
    }, [product, selectedWarehouseFilter]);

    useEffect(() => {
        if (isDialogOpen && selectedWarehouseMove) {
            fetchDialogStocks(selectedWarehouseMove);
        }
    }, [isDialogOpen, selectedWarehouseMove, product]);

    useEffect(() => {
        if (isDialogOpen) {
            setError(null);
            if (selectedWarehouseFilter !== 'consolidado') {
                setSelectedWarehouseMove(selectedWarehouseFilter);
            } else if (warehouses.length > 0) {
                setSelectedWarehouseMove(warehouses[0].id_almacen.toString());
            } else {
                setSelectedWarehouseMove('1');
            }
        }
    }, [isDialogOpen, warehouses]);

    const handleMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                id_variante_producto: parseInt(selectedVariantId),
                id_almacen: parseInt(selectedWarehouseMove),
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
            if (selectedWarehouseMove) {
                fetchDialogStocks(selectedWarehouseMove);
            }

            // Reset form
            setAmount('');
            setReason('');
            setRefExt('');
            setCostUnit('');
        } catch (err: any) {
            setError(err.message || "Error registrando movimiento");
            console.error("Movement error", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pt-2">
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
            {/* Header section with Warehouse selector */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-border">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-primary" />
                        Control de Inventario
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Visualiza los niveles de stock y registra movimientos de inventario.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            Ver stock en:
                        </span>
                        <Select value={selectedWarehouseFilter} onValueChange={setSelectedWarehouseFilter}>
                            <SelectTrigger className="w-[200px] h-9 text-xs">
                                <SelectValue placeholder="Selecciona almacén" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="consolidado">Todos (Consolidado)</SelectItem>
                                {warehouses.map(w => (
                                    <SelectItem key={w.id_almacen} value={w.id_almacen.toString()}>
                                        {w.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => setIsDialogOpen(true)} disabled={variants.length === 0} size="sm">
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Registrar Movimiento
                    </Button>
                </div>
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
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5 text-primary" />
                            Registrar Movimiento de Stock
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleMovement} className="space-y-4">
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
                        <div className="grid gap-2">
                            <Label htmlFor="move-almacen" className="font-semibold text-sm">Almacén de Destino/Origen <span className="text-red-500">*</span></Label>
                            <Select value={selectedWarehouseMove} onValueChange={setSelectedWarehouseMove} required>
                                <SelectTrigger id="move-almacen">
                                    <SelectValue placeholder="Selecciona almacén" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(w => (
                                        <SelectItem key={w.id_almacen} value={w.id_almacen.toString()}>
                                            {w.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="move-variant" className="font-semibold text-sm">Variante <span className="text-red-500">*</span></Label>
                            <Select value={selectedVariantId} onValueChange={setSelectedVariantId} required>
                                <SelectTrigger id="move-variant">
                                    <SelectValue placeholder="Selecciona variante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {variants.map(v => (
                                        <SelectItem key={v.id_variante_producto} value={v.id_variante_producto.toString()}>
                                            {v.sku} (Actual: {dialogStocksLoading ? '...' : (dialogStocks[v.id_variante_producto] ?? 0)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-semibold text-sm">Tipo Movimiento</Label>
                                <Select value={moveType} onValueChange={setMoveType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="entrada">Entrada (+)</SelectItem>
                                        {!isVendedor && <SelectItem value="salida">Salida (-)</SelectItem>}
                                        {!isVendedor && <SelectItem value="ajuste">Ajuste (Manual)</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-semibold text-sm">Cantidad <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number" min="1"
                                    value={amount} onChange={e => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="font-semibold text-sm">Motivo / Descripción</Label>
                            <Input
                                value={reason} onChange={e => setReason(e.target.value)}
                                placeholder="Ej: Compra proveedor, merma..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-semibold text-sm">Ref. Externa</Label>
                                <Input
                                    value={refExt} onChange={e => setRefExt(e.target.value)}
                                    placeholder="Fac-123"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-semibold text-sm">Costo Unitario (Opcional)</Label>
                                <Input
                                    type="number" step="0.01" min="0"
                                    value={costUnit} onChange={e => setCostUnit(e.target.value)}
                                    placeholder="Auto"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
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
