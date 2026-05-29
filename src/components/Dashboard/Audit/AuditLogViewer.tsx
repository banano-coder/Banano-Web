import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    Loader2, Search, Filter, ChevronLeft, ChevronRight, X,
    FileJson, Package, ShoppingCart, User, ShieldCheck,
    RefreshCcw, Plus, Minus, AlertTriangle, Key, Layers, Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AuditLog {
    id: number;
    action: string;
    action_label?: string;
    actor_id?: number | string;
    actor_name?: string;
    target_type?: string;
    target_id?: number | string;
    target_usuario_id?: number | string;
    target_pedido_id?: number | string;
    target_producto_id?: number | string;
    target_variant_id?: number | string;
    details?: string;
    detail?: string;
    payload?: any;
    created_at: string;
    target_pedido_cliente?: string;
    target_producto_nombre?: string;
    target_variante_sku?: string;
    target_label?: string;
    [key: string]: any;
}

interface AuditResponse {
    data: AuditLog[];
    page: number;
    limit: number;
    total: number;
}

interface UserData {
    id: string | number;
    nombre: string;
    email: string;
}

export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedLotes, setExpandedLotes] = useState<Record<number, boolean>>({});

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [targetType, setTargetType] = useState('');
    const [action, setAction] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showDates, setShowDates] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetch('/api/users?limit=1000');
                if (res.ok) {
                    const responseData = await res.json();
                    let usersList: UserData[] = [];
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
        loadUsers();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (targetType) params.append('target_tipo', targetType);
            if (action) params.append('action', action);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const res = await fetch(`/api/auditoria?${params.toString()}`);
            if (!res.ok) throw new Error("Error al cargar movimientos");
            const data: AuditResponse = await res.json();
            setLogs(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, targetType, action, dateFrom, dateTo]);

    const getActorInfo = (log: AuditLog) => {
        const name = log.actor_nombre || log.actor?.nombre || (log.actor_id ? usersMap[String(log.actor_id)] : null) || 'Sistema';
        const initials = name === 'Sistema' ? 'S' : name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
        return { name, initials };
    };

    const getEventIcon = (action: string) => {
        if (action.includes('PRODUCT') || action.includes('VARIANT')) return <Package className="w-3.5 h-3.5 text-blue-400" />;
        if (action.includes('PEDIDO')) return <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />;
        if (action.includes('INV')) return <Plus className="w-3.5 h-3.5 text-amber-400" />;
        if (action.includes('PASSWORD') || action.includes('ROLE') || action === 'ENABLE' || action === 'DISABLE') return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
        if (action.includes('UPDATE')) return <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />;
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    };

    const getEventCategory = (action: string) => {
        if (action.includes('PRODUCT') || action.includes('VARIANT')) return 'Producto';
        if (action.includes('PEDIDO')) return 'Pedido';
        if (action.includes('INV')) return 'Inventario';
        if (action.includes('PASSWORD') || action.includes('ROLE') || action === 'ENABLE' || action === 'DISABLE') return 'Seguridad';
        return 'Sistema';
    };

    const renderEventText = (log: AuditLog) => {
        const { name: actorName } = getActorInfo(log);
        const action = log.action;
        const payload = typeof log.payload === 'string' ? JSON.parse(log.payload || '{}') : (log.payload || {});

        const boldActor = <span className="font-bold text-foreground brightness-110">{actorName}</span>;

        const productName = log.target_producto_nombre || (log.target_label ? log.target_label.replace(/^Producto:\s*/i, '') : 'un producto');
        const variantName = log.target_variante_sku || (log.target_label ? log.target_label.replace(/^Variante:\s*/i, '') : 'una variante');
        const catName = log.target_label ? log.target_label.replace(/^Categoría:\s*/i, '') : 'una categoría';
        const brandName = log.target_label ? log.target_label.replace(/^Marca:\s*/i, '') : 'una marca';
        const userName = log.target_usuario_nombre || (log.target_label ? log.target_label.replace(/^Usuario:\s*/i, '') : 'un usuario');
        const warehouseName = log.target_label ? log.target_label.replace(/^Almacén:\s*/i, '') : 'un almacén';

        switch (action) {
            case 'PRODUCT_CREATE':
            case 'PRODUCT_CREATE_WITH_VARIANT':
                return <>{boldActor} creó el producto <span className="font-semibold">{productName}</span></>;
            case 'PRODUCT_UPDATE':
                return <>{boldActor} actualizó el producto <span className="font-semibold">{productName}</span></>;
            case 'PRODUCT_SOFT_DELETE':
            case 'PRODUCT_DISABLE':
                return <>{boldActor} <span className="text-red-500">desactivó/eliminó</span> el producto <span className="font-semibold">{productName}</span></>;
            case 'VARIANT_CREATE':
                return <>{boldActor} creó la variante <span className="font-semibold">{variantName}</span></>;
            case 'VARIANT_UPDATE':
                return <>{boldActor} actualizó la variante <span className="font-semibold">{variantName}</span></>;
            case 'INV_ENTRADA':
                return <>{boldActor} registró <span className="text-green-600 font-medium">entrada (+{payload.cantidad || ''})</span> para <span className="font-semibold">{variantName}</span></>;
            case 'INV_SALIDA':
                return <>{boldActor} registró <span className="text-red-600 font-medium">salida (-{payload.cantidad || ''})</span> para <span className="font-semibold">{variantName}</span></>;
            case 'INV_AJUSTE':
                return <>{boldActor} realizó un <span className="text-amber-600 font-medium">ajuste de stock</span> para <span className="font-semibold">{variantName}</span></>;
            case 'INV_ENTRADA_LOTE':
                return <>{boldActor} registró <span className="text-green-600 font-bold">ingreso de stock por lote</span> ({payload.total_items || (payload.items?.length || 0)} ítems) en <span className="font-semibold">{payload.almacen_nombre || 'Almacén'}</span></>;
            case 'VARIANT_PRICE_CHANGE':
                return <>{boldActor} <span className="text-blue-600 font-medium">modificó precios</span> de la variante <span className="font-semibold">{variantName}</span></>;
            case 'VARIANT_DISABLE':
                return <>{boldActor} <span className="text-red-500 font-medium">desactivó</span> la variante <span className="font-semibold">{variantName}</span></>;
            case 'PEDIDO_CREAR':
                return <>{boldActor} registró el <span className="font-semibold text-primary">Pedido #{log.target_pedido_id}</span></>;
            case 'PEDIDO_CAMBIAR_ESTADO':
                return <>{boldActor} cambió el estado del <span className="font-semibold">Pedido #{log.target_pedido_id}</span> a <span className="font-bold underline">{payload.estado}</span></>;
            case 'USUARIO_UPDATE_PASSWORD':
                return <>{boldActor} <span className="text-purple-600">cambió su propia contraseña</span></>;
            case 'USUARIO_UPDATE_PERFIL':
                return <>{boldActor} actualizó su perfil</>;
            case 'RESET_PASSWORD':
                return <>{boldActor} <span className="text-rose-600 font-medium">reseteó la contraseña</span> de <span className="font-medium">{userName}</span></>;
            case 'REPLACE_ROLES':
                return <>{boldActor} <span className="text-indigo-600 font-medium">actualizó los roles</span> de <span className="font-medium">{userName}</span></>;
            case 'CREATE_USER':
                return <>{boldActor} <span className="text-green-600 font-medium">creó al usuario</span> <span className="font-medium">{userName}</span></>;
            case 'CREATE_USER_SIGNUP':
                return <>{boldActor} <span className="text-emerald-600 font-medium">se registró</span> en el sistema</>;
            case 'ENABLE':
                return <>{boldActor} <span className="text-green-500">activó</span> al usuario <span className="font-medium">{userName}</span></>;
            case 'DISABLE':
                return <>{boldActor} <span className="text-red-500">desactivó</span> al usuario <span className="font-medium">{userName}</span></>;
            case 'SOFT_DELETE_USER':
                return <>{boldActor} <span className="text-red-600 font-bold">eliminó</span> al usuario <span className="font-medium">{userName}</span></>;
            case 'CAT_CREATE':
                return <>{boldActor} creó la categoría <span className="font-semibold">{catName}</span></>;
            case 'CAT_UPDATE':
                return <>{boldActor} actualizó la categoría <span className="font-semibold">{catName}</span></>;
            case 'CAT_DISABLE':
            case 'CAT_SOFT_DELETE':
                return <>{boldActor} <span className="text-red-500">eliminó</span> la categoría <span className="font-semibold">{catName}</span></>;
            case 'BRAND_CREATE':
                return <>{boldActor} creó la marca <span className="font-semibold">{brandName}</span></>;
            case 'BRAND_UPDATE':
                return <>{boldActor} actualizó la marca <span className="font-semibold">{brandName}</span></>;
            case 'BRAND_SOFT_DELETE':
            case 'BRAND_DISABLE':
                return <>{boldActor} <span className="text-red-500">eliminó</span> la marca <span className="font-semibold">{brandName}</span></>;
            case 'ALMACEN_CREATE':
                return <>{boldActor} creó el almacén <span className="font-semibold">{warehouseName}</span></>;
            case 'ALMACEN_UPDATE':
                return <>{boldActor} actualizó el almacén <span className="font-semibold">{warehouseName}</span></>;
            case 'ALMACEN_SOFT_DELETE':
                return <>{boldActor} <span className="text-red-500">eliminó</span> el almacén <span className="font-semibold">{warehouseName}</span></>;
            default:
                return <>
                    {boldActor} realizó la acción <span className="font-semibold">{log.action_label || log.action}</span>
                    {log.target_label && <> en <span className="font-semibold">{log.target_label}</span></>}
                </>;
        }
    };

    const formatVariantLabelLocal = (atributos: any): string => {
        if (!atributos || typeof atributos !== 'object') return 'Estándar';
        const entries = Object.entries(atributos);
        if (entries.length === 0) return 'Estándar';
        return entries.map(([k, v]) => k.toLowerCase() === 'tipo' ? String(v) : `${k}: ${v}`).join(' / ');
    };

    const toggleLote = (logId: number) => {
        setExpandedLotes(prev => ({ ...prev, [logId]: !prev[logId] }));
    };

    const renderBatchLoteDetails = (log: AuditLog) => {
        const payload = typeof log.payload === 'string' ? JSON.parse(log.payload || '{}') : (log.payload || {});
        const isExpanded = !!expandedLotes[log.id];
        const items = payload.items || [];

        return (
            <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-4 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/40 justify-between">
                    <div className="flex gap-4">
                        {payload.motivo && (
                            <div>
                                <span className="text-muted-foreground font-medium">Motivo: </span>
                                <span className="text-foreground/80 font-semibold">{payload.motivo}</span>
                            </div>
                        )}
                        {payload.ref_externa && (
                            <div>
                                <span className="text-muted-foreground font-medium">Referencia: </span>
                                <span className="text-foreground/80 font-semibold">{payload.ref_externa}</span>
                            </div>
                        )}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleLote(log.id)}
                        className="h-7 text-xs font-bold text-primary hover:bg-primary/5 px-2 bg-background/40 hover:bg-background/60 shadow-sm border border-border/20 rounded-md transition-all active:scale-95"
                    >
                        {isExpanded ? 'Ocultar Detalle' : `Visualizar Detalle (${items.length} prod)`}
                    </Button>
                </div>

                {isExpanded && items.length > 0 && (
                    <div className="border border-border/40 rounded-lg overflow-hidden bg-background/50 shadow-sm animate-in slide-in-from-top-1 duration-200">
                        <table className="w-full text-[11px] border-collapse text-left">
                            <thead>
                                <tr className="bg-muted text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                                    <th className="px-3 py-2">Producto</th>
                                    <th className="px-3 py-2">SKU</th>
                                    <th className="px-3 py-2">Variante</th>
                                    <th className="px-3 py-2 text-center">Cantidad</th>
                                    <th className="px-3 py-2 text-center">Antes</th>
                                    <th className="px-3 py-2 text-center">Después</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any, idx: number) => {
                                    return (
                                        <tr key={idx} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                                            <td className="px-3 py-1.5 font-semibold text-foreground/80">{item.producto || '—'}</td>
                                            <td className="px-3 py-1.5 font-mono text-muted-foreground">{item.sku || '—'}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{formatVariantLabelLocal(item.variante)}</td>
                                            <td className="px-3 py-1.5 text-center font-bold text-emerald-600">+{item.cantidad}</td>
                                            <td className="px-3 py-1.5 text-center text-muted-foreground">{item.stock_antes ?? '—'}</td>
                                            <td className="px-3 py-1.5 text-center text-foreground font-semibold">{item.stock_despues ?? '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderPayloadDetails = (payload: any) => {
        if (!payload) return null;
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

        return (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2 rounded-md border border-border/40">
                {Object.entries(data).map(([key, value]) => {
                    if (key.includes('id') || key === 'changes') return null;
                    return (
                        <div key={key} className="flex gap-2">
                            <span className="text-muted-foreground capitalize font-medium">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-foreground/80 truncate">
                                {typeof value === 'object' ? JSON.stringify(value).replace(/[{}"]/g, '') : String(value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Registro de Movimientos
                    </h2>
                    <p className="text-base text-muted-foreground font-medium">
                        Historial de actividad reciente.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="h-10 pl-9 bg-background border-border/60 rounded-lg text-sm focus-visible:ring-primary/20"
                            value={action}
                            onChange={e => setAction(e.target.value)}
                        />
                    </div>

                    <Select
                        value={targetType || "all"}
                        onValueChange={(val) => {
                            setTargetType(val === "all" ? "" : val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-10 text-sm rounded-lg border-border/40 focus:ring-primary/20 bg-background font-semibold">
                            <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5 opacity-60" />
                                    <span>Todo</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="pedido">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-3.5 h-3.5 text-green-500/70" />
                                    <span>Pedidos</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="usuario">
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-blue-500/70" />
                                    <span>Usuarios</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="producto">
                                <div className="flex items-center gap-2">
                                    <Package className="w-3.5 h-3.5 text-orange-500/70" />
                                    <span>Productos</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="inventario">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5 text-purple-500/70" />
                                    <span>Inventario</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-lg border border-border/40 transition-colors ${showDates ? 'bg-primary/5 text-primary border-primary/20' : 'text-muted-foreground'}`}
                        onClick={() => setShowDates(!showDates)}
                        title="Filtrar por fecha"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </header>

            {showDates && (
                <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/15 rounded-xl border border-border/30 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">Desde</span>
                        <input
                            type="date"
                            className="h-9 px-3 bg-background border border-border/40 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">Hasta</span>
                        <input
                            type="date"
                            className="h-9 px-3 bg-background border border-border/40 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                        />
                    </div>
                    {(dateFrom || dateTo) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-[11px] font-black text-primary hover:bg-primary/5 uppercase tracking-wider"
                            onClick={() => { setDateFrom(''); setDateTo(''); }}
                        >
                            Limpiar fechas
                        </Button>
                    )}
                </div>
            )}

            <div className="divide-y divide-border/40 border-t border-b border-border/40">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
                        <p className="text-xs">Sincronizando...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-xs">
                        No hay movimientos para mostrar.
                    </div>
                ) : (
                    logs.map((log) => {
                        const { name, initials } = getActorInfo(log);
                        return (
                            <div key={log.id} className="py-5 flex gap-4 items-start hover:bg-muted/10 transition-colors px-2">
                                <Avatar className="w-9 h-9 border border-border/20 shadow-sm shrink-0">
                                    <AvatarFallback className={`${name === 'Sistema' ? 'bg-slate-100 text-slate-400' : 'bg-primary/5 text-primary'} text-[10px] font-bold`}>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-base text-foreground leading-relaxed">
                                            {renderEventText(log)}
                                        </div>
                                        <time className="text-xs font-bold text-muted-foreground/80 shrink-0 ml-4 tabular-nums">
                                            {format(new Date(log.created_at), 'HH:mm')}
                                        </time>
                                    </div>

                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-[11px] text-muted-foreground border border-border/30 shadow-sm">
                                            {getEventIcon(log.action)}
                                            <span className="font-black uppercase tracking-widest leading-none">{getEventCategory(log.action)}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                            {format(new Date(log.created_at), 'dd MMM yyyy')}
                                        </span>
                                    </div>

                                     {/* Collapsible detail view for batch stock entry */}
                                     {log.action === 'INV_ENTRADA_LOTE' && renderBatchLoteDetails(log)}
                                     {/* Small Preview for other inventory/prices */}
                                     {log.action !== 'INV_ENTRADA_LOTE' && (log.action.includes('INV') || log.action.includes('PRICE')) && renderPayloadDetails(log.payload)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <footer className="flex items-center justify-between py-4 border-t border-border/20">
                <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                    Página {page}
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="h-9 px-5 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={logs.length < limit || loading}
                        className="h-9 px-5 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                    >
                        Siguiente
                    </Button>
                </div>
            </footer>
        </div>
    );
};
