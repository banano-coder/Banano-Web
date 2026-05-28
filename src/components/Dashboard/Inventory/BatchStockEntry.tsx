import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Warehouse, Search, Filter, Save, Loader2, CheckCircle2, AlertTriangle, X, RotateCcw, PackagePlus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Almacen } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────────
interface VariantRow {
    id_variante_producto: number;
    id_producto: number;
    producto: string;
    sku: string;
    variante: Record<string, unknown> | null;
    stock: number;
    costo: number;
    precio: number;
    categoria: string | null;
    marca: string | null;
    almacen: string | null;
    // local edit state
    inputQty: string;
    dirty: boolean;
}

interface Categoria { id_categoria: number; nombre: string; }
interface Marca { id_marca: number; nombre: string; }

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatVariantLabel(atributos: Record<string, unknown> | null): string {
    if (!atributos || typeof atributos !== 'object') return 'Estándar';
    const entries = Object.entries(atributos);
    if (entries.length === 0) return 'Estándar';
    return entries.map(([k, v]) => k.toLowerCase() === 'tipo' ? String(v) : `${k}: ${v}`).join(' / ');
}

function fmt(n: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// ── Component ──────────────────────────────────────────────────────────────────
export const BatchStockEntry: React.FC = () => {
    // Warehouse / filter state
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [brands, setBrands] = useState<Marca[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
    const [selectedBrands, setSelectedBrands] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategories, selectedBrands, selectedWarehouseId]);

    // Data state
    const [rows, setRows] = useState<VariantRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Batch config
    const [globalMotivo, setGlobalMotivo] = useState('Ingreso por lote');
    const [globalRef, setGlobalRef] = useState('');

    // ── Load warehouses, categories, brands on mount ──────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [wRes, cRes, bRes] = await Promise.all([
                    FetchData<{ data: Almacen[] } | Almacen[]>(`${API_ENDPOINTS.ALMACENES.LIST}?activo=true`),
                    FetchData<any>(API_ENDPOINTS.CATEGORIES.LIST),
                    FetchData<any>(API_ENDPOINTS.BRANDS.LIST),
                ]);

                const wList: Almacen[] = Array.isArray(wRes) ? wRes : (wRes as any)?.data || [];
                setWarehouses(wList);
                if (wList.length > 0) setSelectedWarehouseId(String(wList[0].id_almacen));

                const cList: Categoria[] = Array.isArray(cRes) ? cRes : cRes?.data || [];
                setCategories(cList.filter((c: any) => c.activo !== false));

                const bList: Marca[] = Array.isArray(bRes) ? bRes : bRes?.data || [];
                setBrands(bList.filter((b: any) => b.activo !== false));
            } catch (e) {
                console.error('Error loading batch entry init data:', e);
            }
        };
        init();
    }, []);

    // ── Load product variants when warehouse changes ───────────────────────────
    useEffect(() => {
        if (!selectedWarehouseId) return;
        const fetchVariants = async () => {
            setLoading(true);
            try {
                const json = await FetchData<any[] | { data: any[] }>(`/api/reports/stock-actual?id_almacen=${selectedWarehouseId}`);
                const data: any[] = Array.isArray(json) ? json : json?.data || [];
                setRows(data.map((r: any) => ({
                    id_variante_producto: r.id_variante_producto,
                    id_producto: r.id_producto,
                    producto: r.producto,
                    sku: r.sku,
                    variante: r.variante,
                    stock: r.stock ?? 0,
                    costo: r.costo ?? 0,
                    precio: r.precio ?? 0,
                    categoria: r.categoria ?? null,
                    marca: r.marca ?? null,
                    almacen: r.almacen ?? null,
                    inputQty: '',
                    dirty: false,
                })));
            } catch (e) {
                console.error('Error loading stock for batch entry:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchVariants();
    }, [selectedWarehouseId]);

    // ── Filtered rows ──────────────────────────────────────────────────────────
    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            const matchSearch = search.trim() === '' ||
                r.producto.toLowerCase().includes(search.toLowerCase()) ||
                r.sku.toLowerCase().includes(search.toLowerCase());
            const matchCat = selectedCategories.size === 0 ||
                (r.categoria && categories.some(c => selectedCategories.has(c.id_categoria) && c.nombre === r.categoria));
            const matchBrand = selectedBrands.size === 0 ||
                (r.marca && brands.some(b => selectedBrands.has(b.id_marca) && b.nombre === r.marca));
            return matchSearch && matchCat && matchBrand;
        });
    }, [rows, search, selectedCategories, selectedBrands, categories, brands]);

    // dirty rows (quantity entered)
    const dirtyRows = useMemo(() => rows.filter(r => r.dirty && parseInt(r.inputQty, 10) > 0), [rows]);

    // Paginated and grouped data
    const paginatedAndGroupedData = useMemo(() => {
        const productGroups = new Map<number, VariantRow[]>();
        filteredRows.forEach(r => {
            if (!productGroups.has(r.id_producto)) productGroups.set(r.id_producto, []);
            productGroups.get(r.id_producto)!.push(r);
        });
        const productGroupsArray = Array.from(productGroups.entries());
        const totalPages = Math.ceil(productGroupsArray.length / ITEMS_PER_PAGE);
        const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));
        const paginatedGroups = productGroupsArray.slice(
            (activePage - 1) * ITEMS_PER_PAGE,
            activePage * ITEMS_PER_PAGE
        );
        return {
            productGroupsArray,
            totalPages,
            activePage,
            paginatedGroups
        };
    }, [filteredRows, currentPage]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleQtyChange = useCallback((id: number, val: string) => {
        setRows(prev => prev.map(r =>
            r.id_variante_producto === id
                ? { ...r, inputQty: val, dirty: val.trim() !== '' }
                : r
        ));
    }, []);

    const handleReset = useCallback(() => {
        setRows(prev => prev.map(r => ({ ...r, inputQty: '', dirty: false })));
    }, []);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = async () => {
        if (dirtyRows.length === 0) return;
        setSaving(true);
        try {
            const items = dirtyRows.map(r => ({
                id_variante_producto: r.id_variante_producto,
                cantidad: parseInt(r.inputQty, 10),
            }));

            const res = await fetch('/api/inventario/movimientos-lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_almacen: parseInt(selectedWarehouseId, 10),
                    motivo: globalMotivo || 'Ingreso por lote',
                    ref_externa: globalRef || undefined,
                    items,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                showToast('error', json.message || 'Error al guardar el lote.');
                return;
            }

            // Update local stock values and clear inputs
            const resultMap = new Map<number, number>();
            (json.resultados || []).forEach((r: any) => {
                resultMap.set(r.id_variante_producto, r.stock_despues);
            });
            setRows(prev => prev.map(r => ({
                ...r,
                stock: resultMap.has(r.id_variante_producto) ? resultMap.get(r.id_variante_producto)! : r.stock,
                inputQty: '',
                dirty: false,
            })));

            showToast('success', `✓ ${json.total_procesados} entradas registradas correctamente.`);
        } catch (e) {
            showToast('error', 'Error de conexión al guardar el lote.');
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle filters ─────────────────────────────────────────────────────────
    const toggleCategory = (id: number) => {
        setSelectedCategories(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const toggleBrand = (id: number) => {
        setSelectedBrands(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectedWarehouseName = warehouses.find(w => String(w.id_almacen) === selectedWarehouseId)?.nombre || '';

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                    {toast.msg}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
                </div>
            )}

            {/* Header Card */}
            <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                        {/* Title */}
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <PackagePlus className="h-5 w-5 text-primary" />
                                Ingreso de Stock por Lote
                            </h2>
                            <p className="text-xs text-foreground/70">
                                Selecciona una sucursal, filtra los productos si lo deseas, e ingresa las cantidades a sumar. Al guardar, todas las entradas se registran en una sola operación.
                            </p>
                        </div>

                        {/* Controls row */}
                        <div className="flex flex-wrap items-end gap-4">
                            {/* Warehouse */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1"><Warehouse className="h-3.5 w-3.5" /> Sucursal</label>
                                <select
                                    value={selectedWarehouseId}
                                    onChange={e => setSelectedWarehouseId(e.target.value)}
                                    className="min-w-[200px] px-3 py-2 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm"
                                >
                                    {warehouses.map(w => (
                                        <option key={w.id_almacen} value={String(w.id_almacen)} className="bg-card text-foreground">{w.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1"><Search className="h-3.5 w-3.5" /> Buscar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Producto o SKU..."
                                        className="pl-8 pr-3 py-2 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-52"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter pills row */}
                    <div className="mt-5 space-y-3">
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-1"><Filter className="h-3 w-3" />Categorías:</span>
                                {categories.map(c => (
                                    <button
                                        key={c.id_categoria}
                                        onClick={() => toggleCategory(c.id_categoria)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${selectedCategories.has(c.id_categoria)
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30'
                                            : 'border-foreground/15 text-foreground/70 hover:border-primary/40 hover:text-primary'
                                        }`}
                                    >
                                        {c.nombre}
                                    </button>
                                ))}
                                {selectedCategories.size > 0 && (
                                    <button onClick={() => setSelectedCategories(new Set())} className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-0.5 ml-1">
                                        <X className="h-3 w-3" /> limpiar
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Brands */}
                        {brands.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-1"><Filter className="h-3 w-3" />Marcas:</span>
                                {brands.map(b => (
                                    <button
                                        key={b.id_marca}
                                        onClick={() => toggleBrand(b.id_marca)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${selectedBrands.has(b.id_marca)
                                            ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm shadow-fuchsia-600/30'
                                            : 'border-foreground/15 text-foreground/70 hover:border-fuchsia-500/40 hover:text-fuchsia-500'
                                        }`}
                                    >
                                        {b.nombre}
                                    </button>
                                ))}
                                {selectedBrands.size > 0 && (
                                    <button onClick={() => setSelectedBrands(new Set())} className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-0.5 ml-1">
                                        <X className="h-3 w-3" /> limpiar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Batch config + save bar */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1 flex-1 min-w-[180px]">
                    <label className="text-xs font-semibold text-foreground/70">Motivo del ingreso</label>
                    <input
                        type="text"
                        value={globalMotivo}
                        onChange={e => setGlobalMotivo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Ingreso por lote"
                    />
                </div>
                <div className="space-y-1 flex-1 min-w-[140px]">
                    <label className="text-xs font-semibold text-foreground/70">Referencia (opcional)</label>
                    <input
                        type="text"
                        value={globalRef}
                        onChange={e => setGlobalRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Nro. factura, orden..."
                    />
                </div>
                <div className="flex items-center gap-3 pb-0.5">
                    <span className="text-sm font-semibold text-foreground/60">
                        {dirtyRows.length > 0 ? (
                            <span className="text-primary font-bold">{dirtyRows.length} variante{dirtyRows.length > 1 ? 's' : ''} con cambios</span>
                        ) : 'Sin cambios pendientes'}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleReset} disabled={dirtyRows.length === 0 || saving}
                        className="h-9 gap-1.5 text-xs font-semibold border-foreground/15 hover:border-primary/40">
                        <RotateCcw className="h-3.5 w-3.5" /> Limpiar
                    </Button>
                    <Button onClick={handleSave} disabled={dirtyRows.length === 0 || saving}
                        className="h-9 gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Guardando...' : `Guardar ${dirtyRows.length > 0 ? `(${dirtyRows.length})` : ''}`}
                    </Button>
                </div>
            </div>

            {/* Product table */}
            <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                        <span>
                            {loading ? 'Cargando variantes...' : `${filteredRows.length} variante${filteredRows.length !== 1 ? 's' : ''}`}
                            {selectedWarehouseName && <span className="text-muted-foreground font-normal text-xs ml-2">— {selectedWarehouseName}</span>}
                        </span>
                        {(selectedCategories.size > 0 || selectedBrands.size > 0 || search) && (
                            <span className="text-xs font-medium text-primary/80">Filtros activos</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {loading ? (
                        <div className="py-16 flex items-center justify-center gap-3 text-muted-foreground text-sm font-semibold">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando inventario de {selectedWarehouseName}...
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground text-sm font-semibold">
                            No se encontraron productos con los filtros aplicados.
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left font-bold">Producto</th>
                                    <th className="px-4 py-3 text-left font-bold">SKU</th>
                                    <th className="px-4 py-3 text-left font-bold">Variante</th>
                                    <th className="px-4 py-3 text-center font-bold">Stock actual</th>
                                    <th className="px-4 py-3 text-right font-bold">Costo</th>
                                    <th className="px-4 py-3 text-right font-bold">Precio</th>
                                    <th className="px-4 py-3 text-left font-bold">Categoría</th>
                                    <th className="px-4 py-3 text-left font-bold">Marca</th>
                                    <th className="px-4 py-3 text-center font-bold w-32">+ Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const { paginatedGroups } = paginatedAndGroupedData;
                                    const tableRows: React.ReactNode[] = [];
                                    paginatedGroups.forEach(([pid, variants]) => {
                                        if (variants.length > 1) {
                                            // Product header row
                                            tableRows.push(
                                                <tr key={`ph-${pid}`} className="bg-primary/8 border-t-2 border-primary/15">
                                                    <td colSpan={9} className="px-4 py-1.5 font-bold text-xs text-primary/80 uppercase tracking-wide">
                                                        {variants[0].producto}
                                                    </td>
                                                </tr>
                                            );

                                            variants.forEach((r, idx) => {
                                                const qty = parseInt(r.inputQty, 10);
                                                const validQty = !isNaN(qty) && qty > 0;
                                                tableRows.push(
                                                    <tr key={`v-${r.id_variante_producto}-${idx}`}
                                                        className={`border-b border-border/30 transition-colors ${r.dirty && validQty ? 'bg-emerald-500/5' : 'hover:bg-muted/20'}`}>
                                                        <td className="px-4 py-2.5 text-xs text-foreground/50 italic pl-6">↳</td>
                                                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.sku}</td>
                                                        <td className="px-4 py-2.5 text-xs text-foreground/80">{formatVariantLabel(r.variante)}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${r.stock <= 3 ? 'text-red-500 bg-red-500/10' : r.stock <= 10 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                                                                {r.stock}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right text-xs text-foreground/60 font-mono">{fmt(r.costo)}</td>
                                                        <td className="px-4 py-2.5 text-right text-xs font-semibold font-mono">{fmt(r.precio)}</td>
                                                        <td className="px-4 py-2.5 text-xs text-foreground/60">{r.categoria || '—'}</td>
                                                        <td className="px-4 py-2.5 text-xs text-foreground/60">{r.marca || '—'}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="1"
                                                                    value={r.inputQty}
                                                                    onChange={e => handleQtyChange(r.id_variante_producto, e.target.value)}
                                                                    placeholder="0"
                                                                    className={`w-24 text-center px-2 py-1.5 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 transition-all bg-background/60
                                                                        ${r.dirty && validQty
                                                                            ? 'border-emerald-500/60 text-emerald-600 ring-emerald-500/20 focus:ring-emerald-400/40'
                                                                            : 'border-foreground/10 text-foreground focus:ring-primary/30'
                                                                        }`}
                                                                />
                                                                {r.dirty && validQty && (
                                                                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        } else {
                                            const r = variants[0];
                                            const qty = parseInt(r.inputQty, 10);
                                            const validQty = !isNaN(qty) && qty > 0;
                                            tableRows.push(
                                                <tr key={`v-${r.id_variante_producto}`}
                                                    className={`border-b border-border/30 transition-colors ${r.dirty && validQty ? 'bg-emerald-500/5' : 'hover:bg-muted/20'}`}>
                                                    <td className="px-4 py-2.5 text-xs font-semibold text-foreground/80">{r.producto}</td>
                                                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.sku}</td>
                                                    <td className="px-4 py-2.5 text-xs text-foreground/80">{formatVariantLabel(r.variante)}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${r.stock <= 3 ? 'text-red-500 bg-red-500/10' : r.stock <= 10 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                                                            {r.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-xs text-foreground/60 font-mono">{fmt(r.costo)}</td>
                                                    <td className="px-4 py-2.5 text-right text-xs font-semibold font-mono">{fmt(r.precio)}</td>
                                                    <td className="px-4 py-2.5 text-xs text-foreground/60">{r.categoria || '—'}</td>
                                                    <td className="px-4 py-2.5 text-xs text-foreground/60">{r.marca || '—'}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={r.inputQty}
                                                                onChange={e => handleQtyChange(r.id_variante_producto, e.target.value)}
                                                                placeholder="0"
                                                                className={`w-24 text-center px-2 py-1.5 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 transition-all bg-background/60
                                                                    ${r.dirty && validQty
                                                                        ? 'border-emerald-500/60 text-emerald-600 ring-emerald-500/20 focus:ring-emerald-400/40'
                                                                        : 'border-foreground/10 text-foreground focus:ring-primary/30'
                                                                    }`}
                                                            />
                                                            {r.dirty && validQty && (
                                                                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    });
                                    return tableRows;
                                })()}
                            </tbody>
                        </table>
                    )}
                </CardContent>

                {/* Pagination Controls */}
                {!loading && filteredRows.length > 0 && (() => {
                    const { productGroupsArray, totalPages, activePage } = paginatedAndGroupedData;
                    if (totalPages <= 1) return null;
                    const startIdx = (activePage - 1) * ITEMS_PER_PAGE;
                    const endIdx = activePage * ITEMS_PER_PAGE;

                    return (
                        <div className="border-t border-border/30 px-6 py-3 flex items-center justify-between bg-card/10">
                            <div className="text-xs text-muted-foreground">
                                Mostrando <span className="font-semibold text-foreground">{startIdx + 1}-{Math.min(endIdx, productGroupsArray.length)}</span> de <span className="font-semibold text-foreground">{productGroupsArray.length}</span> productos
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-muted/50"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={activePage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-muted/50"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={activePage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-muted-foreground px-2 font-medium">
                                    Página <span className="font-bold text-foreground">{activePage}</span> de <span className="font-bold text-foreground">{totalPages}</span>
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-muted/50"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={activePage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-muted/50"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={activePage === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })()}

                {/* Bottom summary */}
                {!loading && filteredRows.length > 0 && (
                    <div className="border-t border-border/30 bg-card/30 px-6 py-3 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                        <span>
                            <span className="font-bold text-foreground">{filteredRows.length}</span> variantes visibles
                        </span>
                        {dirtyRows.length > 0 && (
                            <>
                                <span className="w-px h-4 bg-border" />
                                <span>
                                    <span className="font-bold text-emerald-500">{dirtyRows.length}</span> con cantidad ingresada
                                </span>
                                <span className="w-px h-4 bg-border" />
                                <span>
                                    Total a ingresar: <span className="font-bold text-primary">{dirtyRows.reduce((s, r) => s + (parseInt(r.inputQty, 10) || 0), 0)} uds</span>
                                </span>
                            </>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};
