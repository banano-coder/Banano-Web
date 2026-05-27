import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, AlertTriangle, Loader2, FileDown, Box, History, Warehouse, TrendingUp, DollarSign, BarChart3, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Almacen } from '@/types';

const COLUMN_NAMES: Record<string, string> = {
    'id_producto': 'ID Prod',
    'producto': 'Producto',
    'id_variante_producto': 'ID Var',
    'sku': 'SKU',
    'stock': 'Stock',
    'total_salidas': 'Salidas',
    'variante': 'Variante',
    'id_salida': 'ID Salida',
    'fecha': 'Fecha',
    'cantidad': 'Cant',
    'motivo': 'Motivo',
    'referencia': 'Ref/Pedido',
    'autorizado_por': 'Autorizado',
    'costo_unit': 'Costo U.',
    'subtotal': 'Subtotal',
    'total_movimientos': 'Total Movs',
    'total_unidades': 'Total Unids',
    'valor_estimado_despachado': 'Valor Est. Despacho'
};

const MetricSkeleton = () => (
    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="h-4 w-28 bg-foreground/10 rounded" />
            <div className="h-8 w-8 bg-foreground/10 rounded-full" />
        </div>
        <div className="h-8 w-20 bg-foreground/10 rounded mb-2" />
        <div className="h-3 w-40 bg-foreground/10 rounded" />
    </Card>
);

const LineChart = ({ data }: { data: any[] }) => {
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; date: string } | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm font-semibold">
                No hay datos históricos disponibles
            </div>
        );
    }

    const padding = 35;
    const width = 500;
    const height = 200;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map(d => d.unidades), 5);
    const minVal = 0;

    const points = data.map((d, index) => {
        const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
        const y = padding + chartHeight - ((d.unidades - minVal) / (maxVal - minVal || 1)) * chartHeight;
        return { x, y, val: d.unidades, date: new Date(d.periodo).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
        : '';

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#db2777" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#db2777" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding + ratio * chartHeight;
                    const val = Math.round(maxVal - ratio * maxVal);
                    return (
                        <g key={i} className="opacity-20">
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                            <text x={padding - 5} y={y + 3} textAnchor="end" className="fill-foreground text-[8px] font-mono">{val}</text>
                        </g>
                    );
                })}

                {/* X Axis Labels */}
                {points.map((p, i) => {
                    const step = Math.ceil(points.length / 5) || 1;
                    if (i % step !== 0 && i !== points.length - 1) return null;
                    return (
                        <text key={i} x={p.x} y={height - padding + 12} textAnchor="middle" className="fill-foreground/60 text-[8px] font-mono">
                            {p.date}
                        </text>
                    );
                })}

                {/* Area under the line */}
                {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                {/* Glowing Line */}
                {linePath && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#db2777"
                        strokeWidth="2"
                        className="drop-shadow-[0_2px_4px_rgba(219,39,119,0.3)]"
                    />
                )}

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        className="fill-white dark:fill-card stroke-[#db2777] stroke-2 cursor-pointer hover:r-5 transition-all"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                    />
                ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
                <div
                    className="absolute bg-card border border-border text-foreground px-2 py-1 rounded text-[10px] font-bold shadow-lg pointer-events-none -translate-x-1/2 -translate-y-12"
                    style={{
                        left: `${((hoveredPoint.x - padding) / chartWidth) * 90 + 5}%`,
                        top: `${(hoveredPoint.y / height) * 100}%`,
                    }}
                >
                    <div className="text-muted-foreground font-mono text-[8px]">{hoveredPoint.date}</div>
                    <div>{hoveredPoint.val} uds</div>
                </div>
            )}
        </div>
    );
};

const BarChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm font-semibold">
                No hay datos disponibles
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => d.total_salidas), 1);

    return (
        <div className="space-y-4">
            {data.map((item, i) => {
                const percentage = (item.total_salidas / maxVal) * 100;
                return (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-foreground truncate max-w-[80%]">{item.producto} <span className="text-muted-foreground text-[10px] font-normal font-mono">({item.sku})</span></span>
                            <span className="text-primary font-mono">{item.total_salidas} uds</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden border border-foreground/5 shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(219,39,119,0.4)]"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const InventoryReports = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

    useEffect(() => {
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
            } catch (error) {
                console.error("Error loading warehouses for reports:", error);
            }
        };
        fetchWarehouses();
    }, []);

    const selectedWarehouseName = warehouses.find(w => String(w.id_almacen) === selectedWarehouseId)?.nombre || 'Todos los Almacenes';

    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [kpiData, setKpiData] = useState({ total_movimientos: 0, total_unidades: 0, valor_estimado_despachado: 0 });
    const [stockTotal, setStockTotal] = useState(0);
    const [criticalCount, setCriticalCount] = useState(0);
    const [topSales, setTopSales] = useState<any[]>([]);
    const [seriesData, setSeriesData] = useState<any[]>([]);

    // Date range default: last 30 days
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const fetchStats = async () => {
        setDashboardLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedWarehouseId) queryParams.append('id_almacen', selectedWarehouseId);
            if (fromDate) queryParams.append('from', fromDate);
            if (toDate) queryParams.append('to', toDate);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

            const stockQueryStr = selectedWarehouseId ? `?id_almacen=${selectedWarehouseId}` : '';

            // Fetch in parallel
            const [stockRes, lowStockRes, kpiRes, topSalesRes, seriesRes] = await Promise.all([
                FetchData<any>(`/api/reports/stock-actual${stockQueryStr}`),
                FetchData<any>(`/api/reports/stock-bajo${stockQueryStr}`),
                FetchData<any>(`/api/reports/movimientos-kpis${queryStr}`),
                FetchData<any>(`/api/reports/top-salidas${queryStr}`),
                FetchData<any>(`/api/reports/salidas-serie${queryStr}&granularity=day`)
            ]);

            // Calculate total stock from array
            const stockList = Array.isArray(stockRes) ? stockRes : stockRes?.data || [];
            const totalStockCount = stockList.reduce((acc: number, item: any) => acc + (item.stock || 0), 0);
            setStockTotal(totalStockCount);

            // Critical alerts count
            const lowStockList = Array.isArray(lowStockRes) ? lowStockRes : lowStockRes?.data || [];
            setCriticalCount(lowStockList.length);

            // Exit KPIs
            setKpiData(kpiRes || { total_movimientos: 0, total_unidades: 0, valor_estimado_despachado: 0 });

            // Top Sales
            const topList = Array.isArray(topSalesRes) ? topSalesRes : topSalesRes?.data || [];
            setTopSales(topList.slice(0, 5));

            // Series Data
            const seriesList = Array.isArray(seriesRes) ? seriesRes : seriesRes?.data || [];
            setSeriesData(seriesList);

        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setDashboardLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedWarehouseId, fromDate, toDate]);

    const formatHeaders = (headers: string[]) => {
        return headers.map(h => COLUMN_NAMES[h] || h.toUpperCase());
    };

    const downloadCSV = (data: any[], fileName: string, warehouseName: string) => {
        if (!data || data.length === 0) return;

        const rawHeaders = Object.keys(data[0]);
        const translatedHeaders = formatHeaders(rawHeaders);

        const csvContent = [
            translatedHeaders.join(';'),
            ...data.map(row =>
                rawHeaders.map(header => {
                    const value = row[header] ?? '';
                    if (header === 'fecha') return new Date(value as string).toLocaleString();
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(';')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const safeWarehouseName = warehouseName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}_${safeWarehouseName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = (data: any[], title: string, fileName: string, warehouseName: string) => {
        if (!data || data.length === 0) return;

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text(title, 14, 20);

        // Add Subtitle / Warehouse Info
        doc.setFontSize(12);
        doc.setTextColor(80);
        doc.text(`Almacén: ${warehouseName}`, 14, 27);

        // Add Date
        doc.setFontSize(10);
        doc.setTextColor(120);
        const date = new Date().toLocaleDateString();
        doc.text(`Fecha de generación: ${date}`, 14, 34);

        // Prepare data for autoTable
        const rawHeaders = Object.keys(data[0]);
        const translatedHeaders = formatHeaders(rawHeaders);
        const body = data.map(row => rawHeaders.map(header => {
            const val = row[header];
            if (header === 'fecha') return new Date(val as string).toLocaleDateString();
            if (header.includes('valor') || header === 'subtotal' || header === 'costo_unit') {
                return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val as number);
            }
            return val;
        }));

        autoTable(doc, {
            startY: 40,
            head: [translatedHeaders],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [219, 39, 119] }, // Fuchsia style
            styles: { fontSize: 7, cellPadding: 2 },
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        const safeWarehouseName = warehouseName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        doc.save(`${fileName}_${safeWarehouseName}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleDownloadReport = async (type: string, format: 'csv' | 'pdf') => {
        const loadingKey = `${type}-${format}`;
        setLoading(loadingKey);
        try {
            let endpoint = '';
            let fileName = '';
            let title = '';

            switch (type) {
                case 'stock':
                    endpoint = '/api/reports/stock-actual';
                    fileName = 'reporte_stock_actual';
                    title = 'Reporte de Stock Actual';
                    break;
                case 'low-stock':
                    endpoint = '/api/reports/stock-bajo';
                    fileName = 'alertas_stock_bajo';
                    title = 'Alertas de Stock Bajo';
                    break;
                case 'top-sales':
                    endpoint = '/api/reports/top-salidas';
                    fileName = 'ranking_productos_salidas';
                    title = 'Ranking de Productos (Top Salidas)';
                    break;
                case 'mov-kpis':
                    endpoint = '/api/reports/movimientos-kpis';
                    fileName = 'kpis_despachos';
                    title = 'KPIs de Despachos y Salidas';
                    break;
                case 'mov-detalle':
                    endpoint = '/api/reports/movimientos-detalle';
                    fileName = 'historial_detallado_salidas';
                    title = 'Historial Detallado de Salidas';
                    break;
            }

            const queryParams = new URLSearchParams();
            if (selectedWarehouseId) queryParams.append('id_almacen', selectedWarehouseId);
            if (fromDate) queryParams.append('from', fromDate);
            if (toDate) queryParams.append('to', toDate);
            const queryStr = queryParams.toString();
            if (queryStr) {
                endpoint += `${endpoint.includes('?') ? '&' : '?'}${queryStr}`;
            }

            const response = await fetch(endpoint);
            const result = await response.json();

            // Normalize result to an array
            let rawData: any[] = [];
            if (Array.isArray(result)) {
                rawData = result;
            } else if (result && result.data && Array.isArray(result.data)) {
                rawData = result.data;
            } else if (result && typeof result === 'object') {
                // If it's a single object (like KPIs), wrap it in an array
                rawData = [result];
            }

            // Filter out internal columns and empty objects
            const cleanData = rawData
                .filter(item => item && typeof item === 'object' && Object.keys(item).length > 0)
                .map((item: any) => {
                    const { producto_activo, variante_activa, data, ...rest } = item;
                    return rest;
                });

            if (format === 'csv') {
                downloadCSV(cleanData, fileName, selectedWarehouseName);
            } else {
                downloadPDF(cleanData, title, fileName, selectedWarehouseName);
            }
        } catch (error) {
            console.error(`Error downloading ${type} ${format} report:`, error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Filtro de Almacén y Rango de Fechas */}
            <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-primary animate-pulse" /> Generación de Reportes
                            </h2>
                            <p className="text-xs text-foreground/70">
                                Consulta estadísticas interactivas en tiempo real y descarga reportes en PDF y CSV.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">Almacén:</span>
                                <select
                                    value={selectedWarehouseId}
                                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                    className="min-w-[180px] px-3 py-1.5 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium cursor-pointer shadow-sm hover:border-primary/30"
                                >
                                    <option value="" className="bg-card text-foreground">Consolidado (Todos)</option>
                                    {warehouses.map(w => (
                                        <option key={w.id_almacen} value={w.id_almacen.toString()} className="bg-card text-foreground">
                                            {w.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">Desde:</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium cursor-pointer shadow-sm text-center"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">Hasta:</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-foreground/10 bg-background/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium cursor-pointer shadow-sm text-center"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Cards Row */}
            {dashboardLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stock Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-blue-500/30 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500/50" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Stock</CardTitle>
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                    <Box className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl font-black text-foreground">{stockTotal}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">unidades</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-foreground/60 font-medium">Suma total de unidades físicas en almacenes.</p>
                        </CardContent>
                    </Card>

                    {/* Alerts Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-red-500/30 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500/50" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-bold">Stock Crítico</CardTitle>
                                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl font-black text-foreground">{criticalCount}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">alertas</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-foreground/60 font-medium">Variantes activas con stock bajo que requieren reposición.</p>
                        </CardContent>
                    </Card>

                    {/* Exits Count Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-pink-500/30 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-pink-500/50" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Despachos</CardTitle>
                                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl font-black text-foreground">{kpiData.total_movimientos}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">transacciones</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-foreground/60 font-medium">Número de salidas/movimientos realizados en el periodo.</p>
                        </CardContent>
                    </Card>

                    {/* Exits Cost Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500/50" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Costo de Salidas</CardTitle>
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl font-black text-foreground">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(kpiData.valor_estimado_despachado)}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-foreground/60 font-medium">Valor total estimado a precio de costo de mercadería salida.</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Graphics Section */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Timeline chart takes 2 columns */}
                <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-foreground font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary animate-pulse" /> Historial de Unidades Despachadas
                        </CardTitle>
                        <CardDescription className="text-xs">Evolución temporal del número de unidades salidas en el rango seleccionado.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        {dashboardLoading ? (
                            <div className="h-48 w-full bg-foreground/5 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm font-semibold">
                                Cargando histórico...
                            </div>
                        ) : (
                            <LineChart data={seriesData} />
                        )}
                    </CardContent>
                </Card>

                {/* Top Sales bar chart takes 1 column */}
                <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-foreground font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" /> Productos Más Despachados
                        </CardTitle>
                        <CardDescription className="text-xs">Ranking de las variantes con más unidades de salidas.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        {dashboardLoading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="space-y-1">
                                        <div className="h-3 w-32 bg-foreground/10 rounded" />
                                        <div className="h-2 w-full bg-foreground/10 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <BarChart data={topSales} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Downloader Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2 mt-4">
                    <Download className="h-5 w-5 text-primary" /> Exportar Reportes Detallados
                </h3>
                
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Stock Actual Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-blue-500/30 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                            <div className="p-2.5 w-fit rounded-xl bg-blue-500/10 text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base text-foreground font-bold">Reporte de Stock</CardTitle>
                            <CardDescription className="text-xs text-foreground/70">
                                Descarga el stock actual filtrado por el almacén seleccionado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <Button
                                onClick={() => handleDownloadReport('stock', 'pdf')}
                                disabled={loading !== null}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 shadow-md text-xs font-semibold h-9"
                            >
                                {loading === 'stock-pdf' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                PDF de Stock
                            </Button>
                            <Button
                                onClick={() => handleDownloadReport('stock', 'csv')}
                                disabled={loading !== null}
                                variant="ghost"
                                className="w-full text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 border border-blue-500/20 text-xs font-semibold h-9"
                            >
                                {loading === 'stock-csv' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                CSV de Stock
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Alertas de Stock Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-red-500/30 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                            <div className="p-2.5 w-fit rounded-xl bg-red-500/10 text-red-500 mb-2 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base text-foreground font-bold">Stock Bajo (Crítico)</CardTitle>
                            <CardDescription className="text-xs text-foreground/70">
                                Exporta variantes con alertas de inventario crítico para reabastecimiento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <Button
                                onClick={() => handleDownloadReport('low-stock', 'pdf')}
                                disabled={loading !== null}
                                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-500/10 shadow-md text-xs font-semibold h-9"
                            >
                                {loading === 'low-stock-pdf' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                PDF de Alertas
                            </Button>
                            <Button
                                onClick={() => handleDownloadReport('low-stock', 'csv')}
                                disabled={loading !== null}
                                variant="ghost"
                                className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 text-xs font-semibold h-9"
                            >
                                {loading === 'low-stock-csv' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                CSV de Alertas
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Historial de Salidas Card */}
                    <Card className="bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-purple-500/30 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                            <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                                <History className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base text-foreground font-bold">Log de Salidas</CardTitle>
                            <CardDescription className="text-xs text-foreground/70">
                                Registro completo de movimientos detallados de salida y su valorización.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <Button
                                onClick={() => handleDownloadReport('mov-detalle', 'pdf')}
                                disabled={loading !== null}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/10 shadow-md text-xs font-semibold h-9"
                            >
                                {loading === 'mov-detalle-pdf' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                PDF de Salidas
                            </Button>
                            <Button
                                onClick={() => handleDownloadReport('mov-detalle', 'csv')}
                                disabled={loading !== null}
                                variant="ghost"
                                className="w-full text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 border border-purple-500/20 text-xs font-semibold h-9"
                            >
                                {loading === 'mov-detalle-csv' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                CSV de Salidas
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
