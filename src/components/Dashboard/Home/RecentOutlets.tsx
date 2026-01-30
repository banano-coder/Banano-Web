import React, { useState, useEffect } from 'react';
import { ArrowDownRight, RefreshCw, ArrowRight, Package, User, Clock, Info, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface OutletItem {
    id: number | string;
    action: string;
    target_label: string;
    target_variante_sku?: string;
    target_producto_nombre?: string;
    payload: any;
    created_at: string;
    actor_name?: string;
}

export const RecentOutlets: React.FC = () => {
    const [outlets, setOutlets] = useState<OutletItem[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<OutletItem | null>(null);

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users?limit=1000');
            if (res.ok) {
                const responseData = await res.json();
                let usersList: any[] = [];
                if (Array.isArray(responseData)) usersList = responseData;
                else if (responseData.data) usersList = responseData.data;

                const map: Record<string, string> = {};
                usersList.forEach(u => {
                    map[String(u.id)] = u.nombre || u.email;
                });
                setUsersMap(map);
            }
        } catch (e) {
            console.error("Failed to load users for mapping", e);
        }
    };

    const fetchOutlets = async () => {
        setLoading(true);
        try {
            // We fetch audit logs filtered by INV_SALIDA (Inventory Outlets)
            const res = await fetch('/api/auditoria?action=INV_SALIDA&limit=5');
            if (res.ok) {
                const data = await res.json();
                setOutlets(data.data || []);
                setError(null);
            } else {
                setError("Error al cargar salidas");
            }
        } catch (e) {
            console.error(e);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        fetchOutlets();
    }, []);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold leading-none tracking-tight flex items-center gap-2 text-primary">
                        <ArrowDownRight className="h-5 w-5" />
                        Salidas Recientes
                    </h3>
                    <button onClick={fetchOutlets} className="text-muted-foreground hover:text-primary transition-colors">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                    Últimos movimientos de salida registrados.
                </p>
            </div>

            <div className="p-6 pt-0 flex-1">
                <div className="space-y-3">
                    {loading && outlets.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">Sincronizando...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-sm text-destructive font-medium bg-destructive/5 rounded-lg border border-destructive/10">
                            {error}
                        </div>
                    ) : outlets.length === 0 ? (
                        <div className="text-center py-10 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
                            No se han registrado salidas recientemente.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {outlets.map((item) => {
                                const payload = typeof item.payload === 'string' ? JSON.parse(item.payload || '{}') : (item.payload || {});
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedOutlet(item)}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0 group-hover:bg-primary/10 transition-colors">
                                                <Package className="w-4 h-4 text-primary opacity-70" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-sm truncate text-foreground/90">
                                                    {item.target_label || item.target_variante_sku || 'Producto'}
                                                </span>
                                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                    {format(new Date(item.created_at), 'dd MMM, HH:mm')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 ml-3">
                                            <span className="block font-black text-rose-500 text-base">
                                                -{payload.cantidad || 0}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">unidades</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {!loading && outlets.length > 0 && (
                    <div className="pt-4 border-t border-border/20 mt-4">
                        <a href="/dashboard/audit?target_tipo=inventario" className="text-xs font-black text-primary hover:underline flex items-center justify-center gap-1.5 uppercase tracking-widest group">
                            Ver todo el historial
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedOutlet} onOpenChange={(open) => !open && setSelectedOutlet(null)}>
                <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-border/40 shadow-2xl p-0 overflow-hidden">
                    {selectedOutlet && (
                        <>
                            <div className="p-6 pb-4">
                                <DialogHeader className="mb-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">
                                        <Info className="w-3 h-3" />
                                        Detalle de Movimiento
                                    </div>
                                    <DialogTitle className="text-2xl font-extrabold tracking-tight">
                                        Salida de Inventario
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                                        Información detallada sobre este registro de auditoría.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    {/* Primary Info Card */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-primary/20 shrink-0">
                                            <Package className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-primary/60 uppercase tracking-widest leading-none mb-1">Producto / Variante</span>
                                            <div className="text-lg font-black text-foreground truncate leading-tight">
                                                {(() => {
                                                    const p = typeof selectedOutlet.payload === 'string' ? JSON.parse(selectedOutlet.payload) : (selectedOutlet.payload || {});
                                                    const rawName = p.nombre_producto || p.producto_nombre || p.nombre_variante || p.variante_nombre || p.nombre || selectedOutlet.target_producto_nombre;
                                                    const sku = p.sku || p.variante_sku || selectedOutlet.target_variante_sku;

                                                    // Clean names that look like "inventario #3" to just "Inventario"
                                                    const cleanLabel = (text: string) => {
                                                        if (!text) return '';
                                                        return text.split(' #')[0].split('#')[0];
                                                    };

                                                    const displayName = cleanLabel(rawName || selectedOutlet.target_label);

                                                    if (displayName) {
                                                        return (
                                                            <div className="flex flex-col">
                                                                <span className="truncate">{displayName}</span>
                                                                {sku && (
                                                                    <span className="text-xs font-bold text-muted-foreground mt-0.5">SKU: {sku}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return <span>{sku || 'Sin nombre'}</span>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Secondary Details Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg border border-border/40 bg-muted/5">
                                            <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                                                <User className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Registrado por</span>
                                            </div>
                                            <div className="font-bold text-sm text-foreground/90">
                                                {selectedOutlet.actor_name || (selectedOutlet as any).actor?.nombre || ((selectedOutlet as any).actor_id ? usersMap[String((selectedOutlet as any).actor_id)] : null) || 'Sistema'}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-border/40 bg-muted/5">
                                            <div className="flex items-center gap-2 mb-1.5 grayscale opacity-60">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Fecha y Hora</span>
                                            </div>
                                            <div className="font-bold text-sm text-foreground/90">
                                                {format(new Date(selectedOutlet.created_at), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity Highlight */}
                                    <div className="p-4 rounded-xl border-2 border-rose-500/10 bg-rose-500/[0.02] flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest block mb-0.5">Cantidad Extraída</span>
                                            <span className="text-2xl font-black text-rose-500 leading-none">
                                                -{typeof selectedOutlet.payload === 'string' ? JSON.parse(selectedOutlet.payload).cantidad : (selectedOutlet.payload?.cantidad || 0)}
                                            </span>
                                            <span className="ml-1.5 text-xs font-bold text-rose-400 uppercase tracking-tighter">unidades</span>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                            <ArrowDownRight className="w-6 h-6 text-rose-500" />
                                        </div>
                                    </div>

                                    {/* Additional Payload Details */}
                                    {(() => {
                                        const p = typeof selectedOutlet.payload === 'string' ? JSON.parse(selectedOutlet.payload) : (selectedOutlet.payload || {});

                                        // Define custom sort order for fields
                                        const fieldOrder = [
                                            'tipo', 'motivo', 'ref_externa',
                                            'costo_unitario', 'stock_antes', 'stock_despues'
                                        ];

                                        const extraFields = Object.entries(p).filter(([key]) =>
                                            !['cantidad', 'id', 'producto_id', 'variante_id', 'nombre', 'sku', 'nombre_producto', 'producto_nombre', 'nombre_variante', 'variante_nombre', 'variante_sku', 'id_variante_producto', 'id_movimiento_inventario'].includes(key)
                                        ).sort(([a], [b]) => {
                                            const indexA = fieldOrder.indexOf(a);
                                            const indexB = fieldOrder.indexOf(b);
                                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                                            if (indexA !== -1) return -1;
                                            if (indexB !== -1) return 1;
                                            return a.localeCompare(b);
                                        });

                                        if (extraFields.length === 0) return null;

                                        return (
                                            <div className="mt-2 pt-2 border-t border-border/20">
                                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-2">Detalles Adicionales</span>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                                    {extraFields.map(([key, value]) => (
                                                        <div key={key} className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-muted-foreground/60 capitalize">{key.replace(/_/g, ' ')}</span>
                                                            <span className="text-[11px] font-bold text-foreground/80 truncate">
                                                                {key.includes('costo') ? `$${Number(value).toLocaleString()}` : String(value)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-muted/30 border-t border-border/40 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Movimiento ID: #{selectedOutlet.id}</span>
                                <a
                                    href={`/dashboard/audit?search=${selectedOutlet.id}`}
                                    className="text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:underline flex items-center gap-1.5"
                                >
                                    Ver en auditoría
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
