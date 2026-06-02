import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Search, ChevronLeft, ChevronRight, Eye,
    Loader2, Package, User, ShoppingBag, X,
    Calendar, DollarSign, Filter, Hash, AlertTriangle
} from 'lucide-react';

// Interfaces
interface OrderItem {
    id_pedido_item?: number;
    id_variante_producto?: number;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Warehouse {
    id_almacen: number;
    nombre: string;
    activo: boolean;
}

interface Order {
    id?: number;
    id_pedido: number;
    estado: 'nuevo' | 'contactado' | 'concretado' | 'cancelado' | 'anulado';
    total?: number;
    total_estimado: number;
    created_at: string;
    cliente_nombre?: string;
    cliente_email?: string;
    cliente_telefono?: string;
    cedula_cliente?: string;
    usuario?: {
        nombre: string;
        email: string;
        telefono?: string;
    };
    items?: OrderItem[];
    // Nuevos campos
    id_almacen?: number;
    almacen_nombre?: string;
    id_cuenta?: number;
    cuenta_nombre?: string;
    id_usuario?: number;
    vendedor_nombre?: string;
    moneda_pago?: string;
    tasa_cambio?: number;
    monto_pago_real?: number;
    origen?: string;
    transacciones?: Array<{
        id_transaccion: number;
        id_cuenta: number;
        cuenta_nombre: string;
        cuenta_moneda: string;
        tipo: string;
        monto_usd: number;
        tasa_cambio: number;
        monto_real: number;
        concepto: string;
    }>;
}


// Simple Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    componentDidCatch(error: any, errorInfo: any) { console.error("OrdersManager Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 border border-red-500 bg-red-50 text-red-900 rounded-lg shadow-md m-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2">🚨 Algo salió mal.</h2>
                    <p className="mb-4">Se produjo un error al mostrar este componente.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                        Recargar Página
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        nuevo: "bg-blue-100 text-blue-800 border-blue-200",
        contactado: "bg-yellow-100 text-yellow-800 border-yellow-200",
        concretado: "bg-green-100 text-green-800 border-green-200",
        cancelado: "bg-red-100 text-red-800 border-red-200",
        anulado: "bg-purple-100 text-purple-800 border-purple-200"
    };
    const labels: Record<string, string> = {
        nuevo: "Nuevo",
        contactado: "Contactado",
        concretado: "Concretado",
        cancelado: "Cancelado",
        anulado: "Anulado"
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-800"}`}>
            {labels[status] || status}
        </span>
    );
};

const OrdersManagerContent: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // User roles for voiding sales
    const [isVendedor, setIsVendedor] = useState(false);
    const [isAdminOrManager, setIsAdminOrManager] = useState(false);

    // Void Sale Dialog States
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [voidReason, setVoidReason] = useState('');
    const [voidDeductMoney, setVoidDeductMoney] = useState(true);
    const [voidSubmitting, setVoidSubmitting] = useState(false);
    const [voidSuccess, setVoidSuccess] = useState<string | null>(null);
    const [voidError, setVoidError] = useState<string | null>(null);

    useEffect(() => {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            try {
                const u = JSON.parse(userRaw);
                if (u && Array.isArray(u.roles)) {
                    const rolesLower = u.roles.map((r: string) => r.toLowerCase());
                    setIsVendedor(rolesLower.includes('vendedor') && !rolesLower.includes('admin') && !rolesLower.includes('manager'));
                    setIsAdminOrManager(rolesLower.some((r: string) => ['admin', 'manager'].includes(r)));
                }
            } catch (e) {
                console.error("Error parseando usuario en OrdersManager", e);
            }
        }
    }, []);

    const handleVoidOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !voidReason.trim()) return;
        setVoidSubmitting(true);
        setVoidError(null);
        setVoidSuccess(null);

        const id = Number(selectedOrder.id || selectedOrder.id_pedido);

        try {
            if (isAdminOrManager) {
                const res = await fetch(`/api/pedidos/${id}/anular`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        motivo: voidReason.trim(),
                        descontar_dinero: voidDeductMoney
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    setVoidSuccess("Venta anulada correctamente.");
                    fetchOrders();
                    fetchOrderDetails(id);
                    setTimeout(() => {
                        setShowVoidDialog(false);
                        setVoidReason('');
                        setVoidSuccess(null);
                    }, 2000);
                } else {
                    setVoidError(data.message || "Error al anular la venta.");
                }
            } else {
                // Vendedor: crear solicitud de autorización
                const res = await fetch('/api/solicitudes-autorizacion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipo_accion: 'ANULAR_VENTA',
                        target_id: id,
                        target_nombre: `Pedido #${id}`,
                        motivo: voidReason.trim(),
                        payload: {
                            descontar_dinero: voidDeductMoney
                        }
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    setVoidSuccess("Solicitud de anulación enviada a auditoría.");
                    setTimeout(() => {
                        setShowVoidDialog(false);
                        setVoidReason('');
                        setVoidSuccess(null);
                    }, 2000);
                } else {
                    setVoidError(data.message || "Error al crear solicitud de anulación.");
                }
            }
        } catch (err: any) {
            console.error("Error en anulación:", err);
            setVoidError(err.message || "Error de conexión.");
        } finally {
            setVoidSubmitting(false);
        }
     };

    // Filters
    const [search, setSearch] = useState('');
    const [orderIdFilter, setOrderIdFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Warehouses list state
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch('/api/almacenes?activo=true');
                if (res.ok) {
                    const data = await res.json();
                    setWarehouses(data.data || []);
                }
            } catch (err) {
                console.error("Error al cargar almacenes:", err);
            }
        };
        fetchWarehouses();
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            // If we have an ID filter, we might want to prioritize it
            if (orderIdFilter) params.append('id', orderIdFilter);
            if (search) params.append('search', search);
            if (statusFilter) params.append('estado', statusFilter);
            if (dateFrom) params.append('from', dateFrom);
            if (dateTo) params.append('to', dateTo);
            if (minAmount) params.append('min_amount', minAmount);
            if (maxAmount) params.append('max_amount', maxAmount);
            if (warehouseFilter) params.append('id_almacen', warehouseFilter);

            const res = await fetch(`/api/pedidos?${params.toString()}`);
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Respuesta inválida del servidor (No es JSON).");
            }

            const data = await res.json();
            if (res.ok) {
                let list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

                // CLIENT-SIDE FILTER FALLBACK: 
                // In case the backend ignores query params, we filter the results here.
                if (orderIdFilter) {
                    list = list.filter((o: Order) =>
                        String(o.id) === orderIdFilter ||
                        String(o.id_pedido) === orderIdFilter ||
                        String(o.id).includes(orderIdFilter)
                    );
                }
                if (search) {
                    const s = search.toLowerCase();
                    list = list.filter((o: Order) =>
                        o.usuario?.nombre?.toLowerCase().includes(s) ||
                        o.usuario?.email?.toLowerCase().includes(s)
                    );
                }
                if (statusFilter) {
                    list = list.filter((o: Order) => o.estado === statusFilter);
                }
                if (warehouseFilter) {
                    list = list.filter((o: Order) => String(o.id_almacen) === warehouseFilter);
                }

                setOrders(list);
            } else {
                setErrorMsg(data.error || "Error al cargar pedidos");
            }
        } catch (error: any) {
            console.error("Fetch Error:", error);
            setErrorMsg(error.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, [page, limit, orderIdFilter, search, statusFilter, dateFrom, dateTo, minAmount, maxAmount, warehouseFilter]);

    // Auto-fetch when filters change (with small delay for text inputs could be added, but here reactive is fine)
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 300); // Small debounce for typing
        return () => clearTimeout(timeout);
    }, [fetchOrders]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const clearFilters = () => {
        setSearch('');
        setOrderIdFilter('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setMinAmount('');
        setMaxAmount('');
        setWarehouseFilter('');
        setPage(1);
    };

    const fetchOrderDetails = async (id: number) => {
        try {
            const res = await fetch(`/api/pedidos/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedOrder(data);
            }
        } catch (error) { console.error(error); }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        setErrorMsg(null);
        try {
            const res = await fetch(`/api/pedidos/${id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newStatus })
            });
            if (res.ok) {
                fetchOrders();
                if (selectedOrder && (selectedOrder.id === id || selectedOrder.id_pedido === id)) {
                    setSelectedOrder(prev => prev ? { ...prev, estado: newStatus as any } : null);
                }
            } else { setErrorMsg("Error al actualizar estado"); }
        } catch (e) { console.error(e); setErrorMsg("Error de conexión"); }
    };

    return (
        <div className="space-y-6">
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 animate-pulse flex-shrink-0" />
                        <span className="text-xs font-semibold">{errorMsg}</span>
                    </div>
                    <button type="button" onClick={() => setErrorMsg(null)} className="h-6 w-6 text-red-500 hover:bg-red-500/10 rounded-md flex items-center justify-center transition-colors flex-shrink-0">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            <div className="flex flex-col gap-4">
                {!hideHeader && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-primary">Gestión de Pedidos</h2>
                            <p className="text-muted-foreground">Administra y da seguimiento a los pedidos de clientes.</p>
                        </div>
                    </div>
                )}

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Order ID Filter */}
                            <div className="w-full lg:w-24 relative">
                                <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="ID"
                                    className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={orderIdFilter}
                                    onChange={(e) => { setOrderIdFilter(e.target.value); setPage(1); }}
                                />
                            </div>

                            {/* Search Name/Email */}
                            <div className="w-full lg:flex-1 relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar por cliente..."
                                    className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div className="w-full lg:w-48">
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">Todos los Estados</option>
                                    <option value="nuevo">Nuevos</option>
                                    <option value="contactado">Contactados</option>
                                    <option value="concretado">Concretados</option>
                                    <option value="cancelado">Cancelados</option>
                                </select>
                            </div>

                            <div className="w-full lg:w-48">
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={warehouseFilter}
                                    onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">Todas las Sucursales</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id_almacen} value={w.id_almacen}>
                                            {w.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`h-10 px-4 flex-1 lg:flex-none rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${showFilters ? 'bg-secondary text-secondary-foreground' : 'bg-background hover:bg-accent'}`}
                                >
                                    <Filter className="h-4 w-4" /> Filtros
                                </button>

                                <button type="submit" className="h-10 px-6 flex-1 lg:flex-none bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Buscar
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-md animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> Fecha Desde</label>
                                    <input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> Fecha Hasta</label>
                                    <input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3 w-3" /> Monto Mín.</label>
                                    <input type="number" min="0" placeholder="0.00" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1); }} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3 w-3" /> Monto Máx.</label>
                                    <input type="number" min="0" placeholder="Sin límite" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }} />
                                </div>
                                <div className="md:col-span-4 flex justify-end">
                                    <button type="button" onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground underline">Limpiar Filtros</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b bg-muted/40">
                            <tr className="border-b">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Cliente</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Sucursal</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Fecha</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Estado</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Total</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr><td colSpan={7} className="h-24 text-center text-muted-foreground"><div className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando pedidos...</div></td></tr>
                            ) : errorMsg ? (
                                <tr><td colSpan={7} className="h-24 text-center text-destructive font-medium">Error: {errorMsg}</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="h-24 text-center text-muted-foreground">No se encontraron pedidos.</td></tr>
                            ) : (
                                orders.map((order) => {
                                    const displayId = order.id || order.id_pedido || '?';
                                    const nombre = order.usuario?.nombre || (order as any).cliente_nombre || 'Desconocido';
                                    const email = order.usuario?.email || (order as any).cliente_email;
                                    const total = Number(order.total || (order as any).total_estimado || 0);

                                    return (
                                        <tr key={displayId} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-bold text-primary">#{displayId}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{nombre}</span>
                                                    <div className="flex flex-col text-xs text-muted-foreground">
                                                        {order.cedula_cliente && <span>CID: {order.cedula_cliente}</span>}
                                                        {email && <span>{email}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-muted-foreground/10">
                                                    {order.almacen_nombre || 'Principal'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {order.created_at ? format(new Date(order.created_at), "d 'de' MMM, yyyy", { locale: es }) : '-'}
                                            </td>
                                            <td className="p-4 align-middle"><StatusBadge status={order.estado} /></td>
                                            <td className="p-4 align-middle text-right font-medium">
                                                ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <button onClick={() => fetchOrderDetails(Number(displayId))} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-9 w-9"><Eye className="h-4 w-4" /></button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pb-4">
                <button className="h-9 px-4 py-2 border border-input bg-background hover:bg-accent inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}><ChevronLeft className="h-4 w-4 mr-2" /> Anterior</button>
                <span className="text-sm font-medium">Página {page}</span>
                <button className="h-9 px-4 py-2 border border-input bg-background hover:bg-accent inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50" onClick={() => setPage(p => p + 1)} disabled={orders.length < limit || loading}>Siguiente <ChevronRight className="h-4 w-4 ml-2" /></button>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col border">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Pedido #{selectedOrder.id || selectedOrder.id_pedido}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-muted-foreground font-bold uppercase mb-1">Cliente</p>
                                    <p className="font-medium text-lg leading-tight">{selectedOrder.usuario?.nombre || (selectedOrder as any).cliente_nombre || 'Desconocido'}</p>
                                    <p className="text-sm font-bold text-primary my-1">{selectedOrder.cedula_cliente ? `C.I. ${selectedOrder.cedula_cliente}` : 'Sin Cédula'}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.usuario?.email || (selectedOrder as any).cliente_email}</p>
                                    {(selectedOrder.usuario?.telefono || (selectedOrder as any).cliente_telefono) && (
                                        <p className="text-sm text-muted-foreground mt-1">{selectedOrder.usuario?.telefono || (selectedOrder as any).cliente_telefono}</p>
                                    )}

                                    {/* Sucursal y Cajero */}
                                    <div className="mt-4 pt-4 border-t border-border/60">
                                        <p className="text-sm text-muted-foreground font-bold uppercase mb-1">Sucursal y Venta</p>
                                        <p className="text-sm text-foreground"><span className="font-semibold text-muted-foreground">Sucursal:</span> {selectedOrder.almacen_nombre || 'Almacén Principal'}</p>
                                        {selectedOrder.vendedor_nombre && (
                                            <p className="text-sm text-foreground mt-1"><span className="font-semibold text-muted-foreground">Vendedor:</span> {selectedOrder.vendedor_nombre}</p>
                                        )}
                                        <p className="text-sm text-foreground mt-1"><span className="font-semibold text-muted-foreground">Origen:</span> {selectedOrder.origen || 'Tienda'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-bold uppercase mb-2">Estado</p>
                                    <StatusBadge status={selectedOrder.estado} />
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {['nuevo', 'contactado', 'concretado', 'cancelado'].map(s => (
                                            <button
                                                key={s}
                                                className={`text-[10px] md:text-xs px-2 py-1.5 rounded-md border transition-colors ${selectedOrder.estado === s ? 'bg-primary text-primary-foreground border-primary opacity-50 cursor-default' : 'hover:bg-accent hover:border-primary/50'}`}
                                                onClick={() => updateStatus(Number(selectedOrder.id || selectedOrder.id_pedido), s)}
                                                disabled={selectedOrder.estado === s}
                                             >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                                        ))}
                                    </div>
                                    
                                    {selectedOrder.estado !== 'anulado' && selectedOrder.estado !== 'cancelado' && (
                                        <div className="mt-4 pt-3 border-t border-border/40">
                                            <button
                                                onClick={() => {
                                                    setVoidReason('');
                                                    setVoidDeductMoney(true);
                                                    setVoidError(null);
                                                    setVoidSuccess(null);
                                                    setShowVoidDialog(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors animate-pulse hover:animate-none"
                                            >
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {isAdminOrManager ? 'Anular Venta' : 'Solicitar Anulación de Venta'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Detalles del pago (Caja y Divisas) */}
                                    {selectedOrder.transacciones && selectedOrder.transacciones.length > 0 ? (
                                        <div className="mt-4 pt-4 border-t border-border/60">
                                            <p className="text-sm text-muted-foreground font-bold uppercase mb-2">Desglose de Pago (Dividido)</p>
                                            <div className="space-y-2">
                                                {selectedOrder.transacciones.map((t: any, idx: number) => (
                                                    <div key={idx} className="text-xs p-2.5 bg-muted/40 rounded-lg border border-border flex flex-col gap-1 shadow-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold text-foreground">{t.cuenta_nombre} ({t.cuenta_moneda})</span>
                                                            <span className="font-bold text-primary">
                                                                {t.cuenta_moneda === 'USD' ? '$' : ''}
                                                                {Number(t.monto_real).toLocaleString('es-CO', { minimumFractionDigits: 2 })}{' '}
                                                                {t.cuenta_moneda}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-muted-foreground text-[10px]">
                                                            <span>Equivalente USD: ${Number(t.monto_usd).toFixed(2)}</span>
                                                            {Number(t.tasa_cambio) !== 1 && <span>Tasa: {Number(t.tasa_cambio).toFixed(4)}</span>}
                                                        </div>
                                                        {t.concepto && <span className="text-[10px] text-muted-foreground/60 italic truncate mt-0.5">{t.concepto}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        (selectedOrder.cuenta_nombre || (selectedOrder.moneda_pago && selectedOrder.moneda_pago !== 'USD')) && (
                                            <div className="mt-4 pt-4 border-t border-border/60">
                                                <p className="text-sm text-muted-foreground font-bold uppercase mb-1">Detalles de Caja y Pago</p>
                                                {selectedOrder.cuenta_nombre && (
                                                    <p className="text-sm text-foreground"><span className="font-semibold text-muted-foreground">Caja Destino:</span> {selectedOrder.cuenta_nombre}</p>
                                                )}
                                                {selectedOrder.moneda_pago && (
                                                    <p className="text-sm text-foreground mt-1"><span className="font-semibold text-muted-foreground">Moneda Pago:</span> {selectedOrder.moneda_pago}</p>
                                                )}
                                                {selectedOrder.tasa_cambio && Number(selectedOrder.tasa_cambio) !== 1 && (
                                                    <p className="text-sm text-foreground mt-1"><span className="font-semibold text-muted-foreground">Tasa de Cambio:</span> {Number(selectedOrder.tasa_cambio).toFixed(4)}</p>
                                                )}
                                                {selectedOrder.monto_pago_real && (
                                                    <p className="text-sm text-foreground mt-1">
                                                        <span className="font-semibold text-muted-foreground">Monto Real Cobrado:</span>{' '}
                                                        <span className="font-bold text-primary">
                                                            {selectedOrder.moneda_pago === 'USD' ? '$' : ''}
                                                            {Number(selectedOrder.monto_pago_real).toLocaleString('es-CO', { minimumFractionDigits: 2 })}{' '}
                                                            {selectedOrder.moneda_pago}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <h4 className="font-bold mb-3 flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Productos</h4>
                            <div className="border rounded-md overflow-x-auto">
                                <table className="w-full text-sm min-w-[500px]">
                                    <thead className="bg-muted">
                                        <tr><th className="p-3 text-left font-medium">Producto</th><th className="p-3 text-center font-medium">Cant</th><th className="p-3 text-right font-medium">Precio Unit.</th><th className="p-3 text-right font-medium">Total</th></tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-muted/10">
                                                <td className="p-3">{item.nombre_producto}</td>
                                                <td className="p-3 text-center">{item.cantidad}</td>
                                                <td className="p-3 text-right">${(item.precio_unitario || 0).toLocaleString('es-CO')}</td>
                                                <td className="p-3 text-right font-medium">${(item.subtotal || 0).toLocaleString('es-CO')}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-muted/20">
                                            <td colSpan={3} className="p-3 text-right font-bold">Total General</td>
                                            <td className="p-3 text-right font-bold text-primary text-lg">${(Number(selectedOrder.total || (selectedOrder as any).total_estimado) || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showVoidDialog && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-xl shadow-lg w-full max-w-md border p-6 animate-in zoom-in-95 duration-200 text-foreground">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                {isAdminOrManager ? 'Anular Venta' : 'Solicitar Anulación'}
                            </h3>
                            <button onClick={() => setShowVoidDialog(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <form onSubmit={handleVoidOrder} className="space-y-4">
                            {voidError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-semibold">
                                    {voidError}
                                </div>
                            )}
                            
                            {voidSuccess && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-xs font-semibold">
                                    {voidSuccess}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground uppercase">
                                    {isAdminOrManager ? 'Especifica el motivo de la anulación *' : 'Motivo / Explicación para la auditoría *'}
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Escribe aquí el motivo detallado..."
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-border/80"
                                    value={voidReason}
                                    onChange={(e) => setVoidReason(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2.5 bg-muted/40 border border-border/40 p-3 rounded-lg select-none">
                                <input
                                    type="checkbox"
                                    id="void-deduct-money"
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring shrink-0 cursor-pointer"
                                    checked={voidDeductMoney}
                                    onChange={(e) => setVoidDeductMoney(e.target.checked)}
                                />
                                <label htmlFor="void-deduct-money" className="text-xs font-medium cursor-pointer leading-tight">
                                    {isAdminOrManager 
                                        ? 'Descontar el dinero ya ingresado en caja/cuenta' 
                                        : '¿Se devolvió el dinero al cliente? (Para descontar de caja)'}
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowVoidDialog(false)}
                                    className="px-3.5 py-2 border rounded-lg text-xs font-bold hover:bg-muted transition-colors"
                                    disabled={voidSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                    disabled={voidSubmitting}
                                >
                                    {voidSubmitting ? 'Procesando...' : (isAdminOrManager ? 'Anular Venta' : 'Enviar Solicitud')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const OrdersManager: React.FC<{ hideHeader?: boolean }> = ({ hideHeader }) => { return <ErrorBoundary><OrdersManagerContent hideHeader={hideHeader} /></ErrorBoundary>; };
