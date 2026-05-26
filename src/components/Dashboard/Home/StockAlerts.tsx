import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

interface StockAlert {
    id: number | string;
    title: string;
    sku: string;
    stock: number;
    min_stock?: number;
    variant?: string;
    id_almacen?: number;
    almacen_nombre?: string;
}

export const StockAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [threshold, setThreshold] = useState(5);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // First try to get threshold from settings
            let currentThreshold = threshold;
            const settingsRes = await fetch('/api/settings');
            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                if (settings.stock?.umbral_minimo !== undefined) {
                    currentThreshold = settings.stock.umbral_minimo;
                    setThreshold(currentThreshold);
                }
            }

            const res = await fetch(`/api/reports/stock-bajo?threshold=${currentThreshold}`);
            if (res.ok) {
                const data = await res.json();
                const rawItems = Array.isArray(data) ? data : data.data || [];
                // Map backend 'producto' to 'title' if needed
                const mappedItems = rawItems.map((item: any) => ({
                    ...item,
                    title: item.title || item.producto || 'Producto sin nombre',
                    id: item.id || item.id_variante_producto
                }));
                setAlerts(mappedItems);
                setError(null);
            } else {
                setError("Error al cargar alertas");
            }
        } catch (e) {
            console.error(e);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas de Stock Bajo
                    </h3>
                    <button onClick={fetchAlerts} className="text-muted-foreground hover:text-primary transition-colors">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Productos con stock menor a {threshold} unidades.
                </p>
            </div>

            <div className="p-6 pt-0">
                {/* Threshold Slider/Input could go here */}

                <div className="space-y-4">
                    {loading && alerts.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">Cargando...</div>
                    ) : error ? (
                        <div className="text-center py-4 text-sm text-destructive">{error}</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-md">
                            ✅ Todo bien. No hay productos con stock crítico.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {alerts.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="font-medium truncate" title={item.title}>{item.title}</span>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-mono bg-background px-1.5 py-0.5 rounded border">{item.sku}</span>
                                            {item.variant && <span>• {item.variant}</span>}
                                            {item.almacen_nombre && (
                                                <span className="inline-flex items-center rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-inset ring-red-500/20">
                                                    {item.almacen_nombre}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className={`block font-bold text-lg ${item.stock === 0 ? 'text-destructive' : 'text-orange-500'}`}>
                                                {item.stock}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase">Stock</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-2 border-t mt-4">
                        <a href="/dashboard/products" className="text-sm text-primary hover:underline flex items-center justify-center gap-1 w-full">
                            Gestionar Inventario <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
