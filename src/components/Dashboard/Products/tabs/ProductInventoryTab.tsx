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
import { Loader2, ArrowRightLeft, History, Warehouse, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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
    const [selectedWarehouseDest, setSelectedWarehouseDest] = useState<string>('');
    const [dialogStocks, setDialogStocks] = useState<Record<number, number>>({});
    const [dialogStocksLoading, setDialogStocksLoading] = useState(false);
    const [isVendedor, setIsVendedor] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // Movement Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [moveType, setMoveType] = useState<string>('entrada');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [refExt, setRefExt] = useState('');
    const [costUnit, setCostUnit] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Request Dialog State
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [requestReason, setRequestReason] = useState('');
    const [requestSubmitting, setRequestSubmitting] = useState(false);

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
                if (list.length > 1) {
                    setSelectedWarehouseDest(list[1].id_almacen.toString());
                } else {
                    setSelectedWarehouseDest(list[0].id_almacen.toString());
                }
            } else {
                setSelectedWarehouseMove('1');
                setSelectedWarehouseDest('1');
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
                    const seller = rolesLower.includes('vendedor') && !rolesLower.includes('admin') && !rolesLower.includes('manager');
                    setIsVendedor(seller);
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
            let defaultMove = '1';
            let defaultDest = '1';
            if (selectedWarehouseFilter !== 'consolidado') {
                defaultMove = selectedWarehouseFilter;
            } else if (warehouses.length > 0) {
                defaultMove = warehouses[0].id_almacen.toString();
            }
            setSelectedWarehouseMove(defaultMove);
            
            if (warehouses.length > 1) {
                const otherWh = warehouses.find(w => w.id_almacen.toString() !== defaultMove);
                if (otherWh) {
                    defaultDest = otherWh.id_almacen.toString();
                } else {
                    defaultDest = warehouses[1].id_almacen.toString();
                }
            } else if (warehouses.length > 0) {
                defaultDest = warehouses[0].id_almacen.toString();
            }
            setSelectedWarehouseDest(defaultDest);
        }
    }, [isDialogOpen, warehouses]);

    useEffect(() => {
        if (selectedWarehouseMove === selectedWarehouseDest && warehouses.length > 1) {
            const alternative = warehouses.find(w => w.id_almacen.toString() !== selectedWarehouseMove);
            if (alternative) {
                setSelectedWarehouseDest(alternative.id_almacen.toString());
            }
        }
    }, [selectedWarehouseMove, selectedWarehouseDest, warehouses]);

    const handleMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isVendedor && moveType === 'salida') {
            setIsRequestDialogOpen(true);
            return;
        }
        if (isVendedor && moveType === 'transferencia') {
            setIsRequestDialogOpen(true);
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            if (moveType === 'transferencia') {
                const payload = {
                    id_variante_producto: parseInt(selectedVariantId),
                    id_almacen_origen: parseInt(selectedWarehouseMove),
                    id_almacen_destino: parseInt(selectedWarehouseDest),
                    cantidad: parseInt(amount),
                    motivo: reason,
                    ref_externa: refExt
                };
                await FetchData(API_ENDPOINTS.INVENTORY.TRANSFER, 'POST', { body: payload });
            } else {
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
            }

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

    const handleRequestStockOutput = async () => {
        if (!product?.id_producto || !selectedVariantId || !requestReason.trim()) return;
        setRequestSubmitting(true);
        setError(null);
        try {
            const variantIdNum = parseInt(selectedVariantId);
            const variant = variants.find(v => v.id_variante_producto === variantIdNum);
            const sku = variant ? variant.sku : `Variante #${selectedVariantId}`;

            if (moveType === 'transferencia') {
                const payload = {
                    id_almacen_origen: parseInt(selectedWarehouseMove),
                    id_almacen_destino: parseInt(selectedWarehouseDest),
                    cantidad: parseInt(amount),
                    motivo: reason || 'Transferencia de stock entre sucursales'
                };

                await FetchData(API_ENDPOINTS.SOLICITUDES.CREATE, 'POST', {
                    body: {
                        tipo_accion: 'TRANSFERIR_STOCK',
                        target_id: variantIdNum,
                        target_nombre: sku,
                        motivo: requestReason.trim(),
                        payload
                    }
                });
                setSuccess("Solicitud de transferencia de stock enviada a auditoría.");
            } else {
                const payload = {
                    cantidades: {
                        [selectedWarehouseMove]: parseInt(amount)
                    },
                    motivo: reason || 'Salida de stock desde movimiento de inventario'
                };

                await FetchData(API_ENDPOINTS.SOLICITUDES.CREATE, 'POST', {
                    body: {
                        tipo_accion: 'REGISTRAR_SALIDA',
                        target_id: variantIdNum,
                        target_nombre: sku,
                        motivo: requestReason.trim(),
                        payload
                    }
                });
                setSuccess("Solicitud de salida de stock enviada a auditoría.");
            }

            setIsRequestDialogOpen(false);
            setRequestReason('');
            // Reset form
            setAmount('');
            setReason('');
            setRefExt('');
            setCostUnit('');
            setIsDialogOpen(false);
        } catch (err: any) {
            setError(err.message || "Error al solicitar acción de stock");
            console.error("Error sending stock request", err);
        } finally {
            setRequestSubmitting(false);
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
            {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3.5 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 text-green-500 flex-shrink-0" />
                        <span className="text-xs font-semibold">{success}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSuccess(null)} className="h-6 w-6 text-green-500 hover:bg-green-500/10 flex-shrink-0">
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
                            <Label htmlFor="move-almacen" className="font-semibold text-sm font-medium">
                                {moveType === 'transferencia' ? 'Almacén de Origen' : 'Almacén de Destino/Origen'} <span className="text-red-500">*</span>
                            </Label>
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

                        {moveType === 'transferencia' && (
                            <div className="grid gap-2">
                                <Label htmlFor="move-almacen-dest" className="font-semibold text-sm font-medium">Almacén de Destino <span className="text-red-500">*</span></Label>
                                <Select value={selectedWarehouseDest} onValueChange={setSelectedWarehouseDest} required>
                                    <SelectTrigger id="move-almacen-dest">
                                        <SelectValue placeholder="Selecciona almacén de destino" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses
                                            .filter(w => w.id_almacen.toString() !== selectedWarehouseMove)
                                            .map(w => (
                                                <SelectItem key={w.id_almacen} value={w.id_almacen.toString()}>
                                                    {w.nombre}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

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
                                        <SelectItem value="salida">Salida (-)</SelectItem>
                                        <SelectItem value="transferencia">Transferencia (entre almacenes)</SelectItem>
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

                        {moveType !== 'transferencia' ? (
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
                        ) : (
                            <div className="grid gap-2">
                                <Label className="font-semibold text-sm">Ref. Externa</Label>
                                <Input
                                    value={refExt} onChange={e => setRefExt(e.target.value)}
                                    placeholder="Ej: Trans-123"
                                />
                            </div>
                        )}

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

            {/* Request Stock Output Dialog */}
            <Dialog open={isRequestDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsRequestDialogOpen(false);
                    setRequestReason('');
                }
            }}>
                <DialogContent className="sm:max-w-[480px] bg-card border border-border backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                            <AlertTriangle className="h-5 w-5 text-primary animate-pulse" />
                            {moveType === 'transferencia' ? 'Solicitar Transferencia de Inventario' : 'Solicitar Salida de Inventario'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            {moveType === 'transferencia' 
                                ? 'No tienes permisos para realizar transferencias de inventario directamente. Se enviará una solicitud al equipo de administración/auditoría.'
                                : 'No tienes permisos para realizar salidas de inventario directamente. Se enviará una solicitud al equipo de administración/auditoría.'}
                        </p>
                        <div className="bg-muted/30 p-3.5 rounded-xl border border-border/40 text-xs space-y-1.5">
                            <span className="font-semibold text-muted-foreground">Variante SKU:</span>
                            <div className="font-mono font-bold text-foreground">
                                {(() => {
                                    const variant = variants.find(v => v.id_variante_producto === parseInt(selectedVariantId));
                                    return variant ? variant.sku : `Variante #${selectedVariantId}`;
                                })()}
                            </div>
                            <div className="border-t border-border/40 pt-1.5 mt-1.5">
                                <span className="font-semibold text-muted-foreground">
                                    {moveType === 'transferencia' ? 'Detalle de transferencia:' : 'Detalle de salida:'}
                                </span>
                                <div className="mt-1 space-y-1">
                                    {moveType === 'transferencia' ? (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-muted-foreground">Origen:</span>
                                                <span className="font-bold text-foreground/90">
                                                    {warehouses.find(w => w.id_almacen === parseInt(selectedWarehouseMove))?.nombre || `Almacén #${selectedWarehouseMove}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-muted-foreground">Destino:</span>
                                                <span className="font-bold text-foreground/90">
                                                    {warehouses.find(w => w.id_almacen === parseInt(selectedWarehouseDest))?.nombre || `Almacén #${selectedWarehouseDest}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs border-t border-border/40 pt-1 mt-1">
                                                <span className="font-semibold text-muted-foreground">Cantidad:</span>
                                                <span className="font-bold text-indigo-500">
                                                    {amount} unidades
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-foreground/90">
                                                {warehouses.find(w => w.id_almacen === parseInt(selectedWarehouseMove))?.nombre || `Almacén #${selectedWarehouseMove}`}
                                            </span>
                                            <span className="font-bold text-red-500">
                                                -{amount} unidades
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground">Motivo / Explicación de la solicitud *</label>
                            <Textarea 
                                placeholder="Escribe el motivo detallado de la salida de stock..."
                                value={requestReason}
                                onChange={e => setRequestReason(e.target.value)}
                                rows={3}
                                className="text-sm bg-background border-border/60"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row justify-end gap-2 border-t pt-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => {
                                setIsRequestDialogOpen(false);
                                setRequestReason('');
                            }}
                            disabled={requestSubmitting}
                            className="text-xs"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-xs"
                            disabled={requestSubmitting || !requestReason.trim()}
                            onClick={handleRequestStockOutput}
                        >
                            {requestSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
