import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, FileText, Loader2, FileDown, Warehouse, TrendingUp, 
  DollarSign, Activity, ShoppingCart, Percent, ArrowUpRight, ArrowDownRight, Info, X 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Almacen } from '@/types';

// Interactive SVG Line Chart for daily sales and costs
const SalesProfitLineChart = ({ data }: { data: any[] }) => {
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; yIng: number; yCos: number; ing: number; cos: number; gan: number; date: string } | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex h-56 items-center justify-center text-muted-foreground text-sm font-semibold italic">
                No hay datos de rentabilidad diaria en el rango seleccionado
            </div>
        );
    }

    const padding = 35;
    const width = 500;
    const height = 220;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map(d => Math.max(d.ingresos, d.costos)), 10);
    const minVal = 0;

    const points = data.map((d, index) => {
        const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
        const yIng = padding + chartHeight - ((d.ingresos - minVal) / (maxVal - minVal || 1)) * chartHeight;
        const yCos = padding + chartHeight - ((d.costos - minVal) / (maxVal - minVal || 1)) * chartHeight;
        return { 
            x, 
            yIng, 
            yCos, 
            ing: d.ingresos, 
            cos: d.costos, 
            gan: d.ingresos - d.costos, 
            date: new Date(d.periodo).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
        };
    });

    const ingPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yIng}`).join(' ');
    const cosPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yCos}`).join(' ');

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="cosGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding + ratio * chartHeight;
                    const val = Math.round(maxVal - ratio * maxVal);
                    return (
                        <g key={i} className="opacity-10 dark:opacity-20">
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                            <text x={padding - 5} y={y + 3} textAnchor="end" className="fill-foreground text-[8px] font-mono font-semibold">${val}</text>
                        </g>
                    );
                })}

                {/* X Axis Labels */}
                {points.map((p, i) => {
                    const step = Math.ceil(points.length / 6) || 1;
                    if (i % step !== 0 && i !== points.length - 1) return null;
                    return (
                        <text key={i} x={p.x} y={height - padding + 12} textAnchor="middle" className="fill-foreground/60 text-[8px] font-mono font-bold">
                            {p.date}
                        </text>
                    );
                })}

                {/* Revenue Areas and Lines */}
                {points.length > 0 && (
                    <>
                        <path d={`${ingPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#ingGrad)" />
                        <path d={`${cosPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#cosGrad)" />
                    </>
                )}

                {ingPath && (
                    <path
                        d={ingPath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        className="drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]"
                    />
                )}

                {cosPath && (
                    <path
                        d={cosPath}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]"
                    />
                )}

                {/* Interactive Points */}
                {points.map((p, i) => (
                    <g key={i} className="group">
                        <circle
                            cx={p.x}
                            cy={p.yIng}
                            r="3"
                            className="fill-card stroke-[#3b82f6] stroke-2 hover:r-4.5 cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPoint(p)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-3 text-[10px] font-bold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-3 bg-[#3b82f6] rounded-full inline-block" />
                    <span>Ingresos de Ventas</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-3 bg-[#f59e0b] rounded-full inline-block border-dashed border border-amber-500" />
                    <span>Costo de Productos (COGS)</span>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredPoint && (
                <div
                    className="absolute bg-card/95 border border-border text-foreground p-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-none -translate-x-1/2 -translate-y-20 transition-all duration-150 backdrop-blur-md"
                    style={{
                        left: `${((hoveredPoint.x - padding) / chartWidth) * 90 + 5}%`,
                        top: `${(hoveredPoint.yIng / height) * 100}%`,
                    }}
                >
                    <div className="text-muted-foreground font-mono text-[8px] mb-1 font-bold">{hoveredPoint.date}</div>
                    <div className="text-blue-500 flex justify-between gap-4"><span>Ingreso:</span> <span>${hoveredPoint.ing.toFixed(2)}</span></div>
                    <div className="text-amber-500 flex justify-between gap-4"><span>Costo:</span> <span>${hoveredPoint.cos.toFixed(2)}</span></div>
                    <div className="text-emerald-500 border-t border-border/80 mt-1 pt-1 flex justify-between gap-4"><span>Ganancia:</span> <span>${hoveredPoint.gan.toFixed(2)}</span></div>
                </div>
            )}
        </div>
    );
};

export const SalesProfitReports = () => {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
    const [kpiData, setKpiData] = useState({ total_ingresos: 0, total_costo: 0, ganancia_bruta: 0, total_gastos: 0, ganancia_neta: 0 });
    const [salesReport, setSalesReport] = useState<any[]>([]);
    const [seriesData, setSeriesData] = useState<any[]>([]);
    const [weeklySalesSummary, setWeeklySalesSummary] = useState<any>(null);
    const [loadingWeeklySales, setLoadingWeeklySales] = useState(false);
    
    // Details Modal
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [orderDetails, setOrderDetails] = useState<any | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Date range defaults to last 30 days
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

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
        fetchWeeklySalesSummary();
    }, []);

    const fetchWeeklySalesSummary = async () => {
        setLoadingWeeklySales(true);
        try {
            const res = await FetchData<any>('/api/reports/sales-weekly-summary', 'GET');
            if (res && res.summary) {
                setWeeklySalesSummary(res.summary);
            }
        } catch (error) {
            console.error("Error loading weekly sales summary:", error);
        } finally {
            setLoadingWeeklySales(false);
        }
    };

    const fetchSalesReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedWarehouseId) queryParams.append('id_almacen', selectedWarehouseId);
            if (fromDate) queryParams.append('from', fromDate);
            if (toDate) queryParams.append('to', toDate);
            
            const res = await FetchData<any>(`/api/reports/sales-profit?${queryParams.toString()}`);
            if (res) {
                setKpiData(res.kpis || { total_ingresos: 0, total_costo: 0, ganancia_bruta: 0, total_gastos: 0, ganancia_neta: 0 });
                setSalesReport(res.sales || []);
                setSeriesData(res.series || []);
            }
        } catch (error) {
            console.error("Error fetching sales profit report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesReport();
    }, [selectedWarehouseId, fromDate, toDate]);

    const loadOrderDetails = async (order: any) => {
        setSelectedOrder(order);
        setLoadingDetails(true);
        try {
            const res = await FetchData<any>(`/api/pedidos/${order.id_pedido}`);
            if (res) {
                setOrderDetails(res);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDetailsModal = () => {
        setSelectedOrder(null);
        setOrderDetails(null);
    };

    const selectedWarehouseName = warehouses.find(w => String(w.id_almacen) === selectedWarehouseId)?.nombre || 'Todos los Almacenes';

    const activeWeek = React.useMemo(() => {
        const day = new Date().getDate();
        if (day >= 1 && day <= 7) return 1;
        if (day >= 8 && day <= 14) return 2;
        if (day >= 15 && day <= 21) return 3;
        return 4;
    }, []);

    const monthlySalesTotal = React.useMemo(() => {
        if (!weeklySalesSummary) return 0;
        return (
            (weeklySalesSummary.week1_total || 0) +
            (weeklySalesSummary.week2_total || 0) +
            (weeklySalesSummary.week3_total || 0) +
            (weeklySalesSummary.week4_total || 0)
        );
    }, [weeklySalesSummary]);

    // Export CSV Report
    const handleDownloadCSV = () => {
        if (salesReport.length === 0) return;
        setExporting('csv');
        try {
            const headers = ['ID Pedido', 'Cliente', 'Fecha', 'Sucursal', 'Origen', 'Ingreso (USD)', 'Costo Prod. (USD)', 'Ganancia (USD)', 'Moneda Pago', 'Monto Pago Real'];
            const dataRows = salesReport.map(r => [
                r.id_pedido,
                `"${r.cliente_nombre || ''}"`,
                new Date(r.fecha).toLocaleString(),
                `"${r.almacen_nombre || 'Online'}"`,
                `"${r.origen || ''}"`,
                r.total_ingreso.toFixed(2),
                r.total_costo.toFixed(2),
                r.ganancia.toFixed(2),
                r.moneda_pago || 'USD',
                r.monto_pago_real ? r.monto_pago_real.toFixed(2) : '0.00'
            ]);

            // Totals Row
            dataRows.push([]);
            dataRows.push([
                '"TOTAL GENERAL"',
                '""',
                '""',
                '""',
                '""',
                kpiData.total_ingresos.toFixed(2),
                kpiData.total_costo.toFixed(2),
                kpiData.ganancia_bruta.toFixed(2),
                '""',
                '""'
            ]);

            // Profit metrics
            dataRows.push([]);
            dataRows.push(['"Resumen del Periodo"', '""', '""', '""', '""', '""', '""', '""', '""', '""']);
            dataRows.push([`"Ganancia Bruta: $${kpiData.ganancia_bruta.toFixed(2)}"`]);
            dataRows.push([`"Gastos Operativos: $${kpiData.total_gastos.toFixed(2)}"`]);
            dataRows.push([`"Ganancia Neta (Utilidad): $${kpiData.ganancia_neta.toFixed(2)}"`]);

            const csvContent = '\uFEFF' + [headers.join(';'), ...dataRows.map(r => r.join(';'))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.setAttribute('href', URL.createObjectURL(blob));
            link.setAttribute('download', `reporte_ventas_ganancias_${selectedWarehouseName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating CSV:", error);
        } finally {
            setExporting(null);
        }
    };

    // Export PDF Report
    const handleDownloadPDF = () => {
        if (salesReport.length === 0) return;
        setExporting('pdf');
        try {
            const doc = new jsPDF();
            
            // Header Title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Reporte de Ventas y Ganancias', 14, 20);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80);
            doc.text(`Almacén: ${selectedWarehouseName}`, 14, 27);
            doc.text(`Rango: ${fromDate} hasta ${toDate}`, 14, 33);
            doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 39);

            // KPIs Grid inside PDF
            doc.setFillColor(245, 247, 250);
            doc.rect(14, 45, 182, 28, 'F');
            
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('INGRESOS (VENTAS)', 18, 52);
            doc.text('COSTO DE VENTAS', 58, 52);
            doc.text('GANANCIA BRUTA', 98, 52);
            doc.text('GASTOS', 138, 52);
            doc.text('UTILIDAD NETA', 170, 52);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59); // dark slate
            doc.text(`$${kpiData.total_ingresos.toLocaleString()}`, 18, 62);
            doc.text(`$${kpiData.total_costo.toLocaleString()}`, 58, 62);
            
            doc.setTextColor(16, 185, 129); // green
            doc.text(`$${kpiData.ganancia_bruta.toLocaleString()}`, 98, 62);
            
            doc.setTextColor(244, 63, 94); // rose
            doc.text(`$${kpiData.total_gastos.toLocaleString()}`, 138, 62);
            
            if (kpiData.ganancia_neta >= 0) {
                doc.setTextColor(16, 185, 129);
            } else {
                doc.setTextColor(239, 68, 68);
            }
            doc.text(`$${kpiData.ganancia_neta.toLocaleString()}`, 170, 62);

            // Sales Table
            const head = [['ID Pedido', 'Cliente', 'Fecha', 'Sucursal', 'Origen', 'Ingresos', 'Costos', 'Ganancia']];
            const body = salesReport.map(r => [
                `#${r.id_pedido}`,
                r.cliente_nombre || '',
                new Date(r.fecha).toLocaleDateString(),
                r.almacen_nombre || 'Online',
                (r.origen || '').toUpperCase(),
                `$${r.total_ingreso.toFixed(2)}`,
                `$${r.total_costo.toFixed(2)}`,
                `$${r.ganancia.toFixed(2)}`
            ]);

            // Append final totals row to body
            body.push([
                'TOTAL',
                '',
                '',
                '',
                '',
                `$${kpiData.total_ingresos.toFixed(2)}`,
                `$${kpiData.total_costo.toFixed(2)}`,
                `$${kpiData.ganancia_bruta.toFixed(2)}`
            ]);

            autoTable(doc, {
                startY: 80,
                head,
                body,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }, // Blue primary header
                styles: { fontSize: 8, cellPadding: 2.5 },
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    5: { fontStyle: 'bold' },
                    6: { fontStyle: 'bold' },
                    7: { fontStyle: 'bold', textColor: [16, 185, 129] }
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                didParseCell: function (data) {
                    if (data.row.index === body.length - 1) {
                        data.cell.styles.fillColor = [241, 245, 249];
                        data.cell.styles.fontStyle = 'bold';
                        if (data.column.index === 7) {
                            data.cell.styles.textColor = [16, 185, 129];
                        }
                    }
                }
            });

            doc.save(`reporte_ventas_ganancias_${selectedWarehouseName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Resumen Semanal de Ventas (Mes Actual) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado de las Semanas (Mes Actual)</h2>
                        <p className="text-[11px] text-muted-foreground font-medium">Progreso acumulado y transacciones de ventas semanales del mes en curso.</p>
                    </div>
                    {loadingWeeklySales && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: 1, name: 'Semana 1', days: 'Días 1 - 7', total: weeklySalesSummary?.week1_total || 0, count: weeklySalesSummary?.week1_count || 0 },
                        { id: 2, name: 'Semana 2', days: 'Días 8 - 14', total: weeklySalesSummary?.week2_total || 0, count: weeklySalesSummary?.week2_count || 0 },
                        { id: 3, name: 'Semana 3', days: 'Días 15 - 21', total: weeklySalesSummary?.week3_total || 0, count: weeklySalesSummary?.week3_count || 0 },
                        { id: 4, name: 'Semana 4', days: 'Días 22 - fin', total: weeklySalesSummary?.week4_total || 0, count: weeklySalesSummary?.week4_count || 0 }
                    ].map((week) => {
                        const isCurrent = activeWeek === week.id;
                        const pct = monthlySalesTotal > 0 ? (week.total / monthlySalesTotal) * 100 : 0;
                        
                        return (
                            <Card 
                                key={week.id}
                                className={`relative overflow-hidden backdrop-blur-sm transition-all duration-300 group ${
                                    isCurrent 
                                        ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-card border-2 border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/10 scale-[1.01]' 
                                        : 'border-border bg-card/65 hover:bg-card/90 hover:border-muted-foreground/30 shadow-sm'
                                }`}
                            >
                                {isCurrent && (
                                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0">
                                            Actual
                                        </Badge>
                                    </div>
                                )}
                                
                                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[110px]">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">{week.name}</p>
                                                <p className="text-[10px] text-muted-foreground/75 font-semibold">{week.days}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2.5 flex items-baseline gap-1">
                                            <span className="text-2xl font-black tracking-tight text-foreground">
                                                ${week.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3.5 space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                                            <span>{week.count} {week.count === 1 ? 'venta' : 'ventas'}</span>
                                            <span>{pct.toFixed(0)}% del mes</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isCurrent 
                                                        ? 'bg-gradient-to-r from-primary to-fuchsia-500' 
                                                        : 'bg-muted-foreground/40'
                                                }`} 
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Filter and settings header */}
            <Card className="bg-card/65 backdrop-blur-md border border-border shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-primary animate-pulse" /> Reporte de Rentabilidad
                            </h2>
                            <p className="text-xs text-muted-foreground font-medium">
                                Monitorea ingresos, costos de venta, gastos y utilidades con exportación y auditoría detallada.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">Almacén:</span>
                                <select
                                    value={selectedWarehouseId}
                                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                    className="min-w-[180px] px-3 py-1.5 rounded-lg border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium cursor-pointer shadow-sm hover:border-primary/30"
                                >
                                    <option value="" className="bg-card text-foreground">Todos los Almacenes</option>
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
                                    className="px-2 py-1 rounded-lg border border-border bg-background/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium cursor-pointer shadow-sm text-center"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">Hasta:</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-border bg-background/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium cursor-pointer shadow-sm text-center"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPIs row */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Card key={i} className="bg-card/60 border border-border p-6 animate-pulse">
                            <div className="h-3 w-20 bg-foreground/10 rounded mb-4" />
                            <div className="h-6 w-24 bg-foreground/10 rounded" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Total Revenue */}
                    <Card className="bg-card/60 backdrop-blur-md border border-border shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500/50" />
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Ingresos</CardTitle>
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <span className="text-xl font-black text-foreground">
                                    ${kpiData.total_ingresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-[9px] text-muted-foreground/90 font-medium">Facturado en el periodo.</p>
                        </CardContent>
                    </Card>

                    {/* Total Cost of Goods Sold */}
                    <Card className="bg-card/60 backdrop-blur-md border border-border shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500/50" />
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Costo de Productos</CardTitle>
                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Percent className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <span className="text-xl font-black text-foreground">
                                    ${kpiData.total_costo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-[9px] text-muted-foreground/90 font-medium">Costo de mercadería (COGS).</p>
                        </CardContent>
                    </Card>

                    {/* Gross Profit */}
                    <Card className="bg-card/60 backdrop-blur-md border border-border shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500/50" />
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Ganancia Bruta</CardTitle>
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <span className="text-xl font-black text-emerald-500">
                                    ${kpiData.ganancia_bruta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-[9px] text-muted-foreground/90 font-medium">Margen sobre costo directo.</p>
                        </CardContent>
                    </Card>

                    {/* Expenses */}
                    <Card className="bg-card/60 backdrop-blur-md border border-border shadow-lg relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500/50" />
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Gastos Operativos</CardTitle>
                                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <span className="text-xl font-black text-rose-500">
                                    ${kpiData.total_gastos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-[9px] text-muted-foreground/90 font-medium">Gastos operativos del periodo.</p>
                        </CardContent>
                    </Card>

                    {/* Net Profit (Utilidad Real) */}
                    <Card className={`backdrop-blur-md border-2 shadow-xl relative overflow-hidden transition-all duration-300 ${
                        kpiData.ganancia_neta >= 0 
                            ? 'bg-emerald-500/5 border-emerald-500/35 shadow-emerald-500/5 hover:border-emerald-500/50' 
                            : 'bg-red-500/5 border-red-500/35 shadow-red-500/5 hover:border-red-500/50'
                    }`}>
                        <div className={`absolute top-0 left-0 w-full h-[3px] ${kpiData.ganancia_neta >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className={`text-[10px] font-black uppercase tracking-wider ${kpiData.ganancia_neta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    Ganancia Neta
                                </CardTitle>
                                <div className={`p-1.5 rounded-lg ${kpiData.ganancia_neta >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <DollarSign className="h-3.5 w-3.5 animate-pulse" />
                                </div>
                            </div>
                            <div className="mt-2.5">
                                <span className={`text-xl font-black ${kpiData.ganancia_neta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    ${kpiData.ganancia_neta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-[9px] text-muted-foreground/90 font-medium">Rendimiento contable final.</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Profitability evolution chart */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-card/65 backdrop-blur-md border border-border shadow-lg md:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-foreground font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary animate-pulse" /> Rentabilidad Diaria
                        </CardTitle>
                        <CardDescription className="text-xs">Desempeño diario de ventas vs. costo de productos.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        {loading ? (
                            <div className="h-56 w-full bg-foreground/5 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm font-semibold">
                                Cargando gráfico de rentabilidad...
                            </div>
                        ) : (
                            <SalesProfitLineChart data={seriesData} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sales table with sums footer */}
            <Card className="bg-card/65 backdrop-blur-md border border-border shadow-lg overflow-hidden">
                <CardHeader className="border-b border-border/80 bg-muted/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg text-foreground font-bold flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" /> Ventas y Margen de Utilidad
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Registro detallado de transacciones con sus respectivos costos y ganancias.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-border text-foreground hover:bg-muted text-xs h-9 font-semibold gap-1.5 flex-1 sm:flex-none"
                                onClick={handleDownloadCSV}
                                disabled={salesReport.length === 0 || exporting !== null}
                            >
                                {exporting === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5 text-primary" />}
                                Exportar CSV
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-border text-foreground hover:bg-muted text-xs h-9 font-semibold gap-1.5 flex-1 sm:flex-none"
                                onClick={handleDownloadPDF}
                                disabled={salesReport.length === 0 || exporting !== null}
                            >
                                {exporting === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 text-pink-500" />}
                                Exportar PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                                    <th className="p-4">Pedido ID</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Sucursal</th>
                                    <th className="p-4">Origen</th>
                                    <th className="p-4 text-right">Ingreso (USD)</th>
                                    <th className="p-4 text-right">Costo (USD)</th>
                                    <th className="p-4 text-right">Ganancia (USD)</th>
                                    <th className="p-4 text-center w-20">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="p-12 text-center text-muted-foreground font-semibold">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                            Cargando informe de rentabilidad...
                                        </td>
                                    </tr>
                                ) : salesReport.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-12 text-center text-muted-foreground italic font-medium">
                                            No hay registros de ventas concretadas en este período.
                                        </td>
                                    </tr>
                                ) : (
                                    salesReport.map(r => (
                                        <tr key={r.id_pedido} className="hover:bg-muted/10 transition-colors font-medium">
                                            <td className="p-4 font-bold text-foreground">
                                                #{r.id_pedido}
                                            </td>
                                            <td className="p-4 text-foreground font-bold">
                                                {r.cliente_nombre || 'Invitado'}
                                            </td>
                                            <td className="p-4 font-mono text-muted-foreground">
                                                {new Date(r.fecha).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-semibold text-muted-foreground">
                                                {r.almacen_nombre || <span className="italic text-muted-foreground/60 text-[10px]">Online</span>}
                                            </td>
                                            <td className="p-4 font-bold uppercase text-[10px] text-muted-foreground/90">
                                                {r.origen || 'web'}
                                            </td>
                                            <td className="p-4 text-right font-mono font-bold text-foreground">
                                                ${r.total_ingreso.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right font-mono font-semibold text-muted-foreground">
                                                ${r.total_costo.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right font-mono font-bold text-emerald-500">
                                                +${r.ganancia.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg"
                                                    onClick={() => loadOrderDetails(r)}
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            
                            {/* Totals summation footer */}
                            {salesReport.length > 0 && (
                                <tfoot className="border-t-2 border-border bg-muted/40 font-black text-foreground">
                                    <tr>
                                        <td colSpan={5} className="p-4 uppercase text-[10px] font-extrabold tracking-wider">
                                            Sumatoria Total (Filtros Activos)
                                        </td>
                                        <td className="p-4 text-right font-mono text-base text-blue-500">
                                            ${kpiData.total_ingresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm text-muted-foreground/95">
                                            ${kpiData.total_costo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-right font-mono text-base text-emerald-500">
                                            +${kpiData.ganancia_bruta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4" />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items Breakdown Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-card border border-border shadow-2xl overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-border pb-4 flex flex-row justify-between items-center space-y-0">
                            <div>
                                <CardTitle className="text-md font-bold text-foreground">Desglose de Pedido #{selectedOrder.id_pedido}</CardTitle>
                                <CardDescription className="text-xs mt-1">Cliente: <span className="font-semibold text-foreground">{selectedOrder.cliente_nombre || 'Invitado'}</span> | Fecha: {new Date(selectedOrder.fecha).toLocaleString()}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={closeDetailsModal} className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg">
                                <X className="h-5 w-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingDetails ? (
                                <div className="p-16 text-center text-muted-foreground font-semibold">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                    Cargando detalles de venta...
                                </div>
                            ) : (
                                <div className="max-h-[350px] overflow-y-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
                                                <th className="p-3 pl-4">Producto</th>
                                                <th className="p-3">SKU</th>
                                                <th className="p-3 text-center">Cant</th>
                                                <th className="p-3 text-right">Unitario (Venta)</th>
                                                <th className="p-3 text-right">Unitario (Costo)</th>
                                                <th className="p-3 text-right">Subtotal Venta</th>
                                                <th className="p-3 text-right pr-4">Subtotal Ganancia</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {orderDetails?.items?.map((item: any) => {
                                                const unitCost = item.costo_unitario || 0;
                                                const unitProfit = item.precio_unitario - unitCost;
                                                const subtotalProfit = unitProfit * item.cantidad;
                                                return (
                                                    <tr key={item.id_pedido_item} className="hover:bg-muted/5 font-medium">
                                                        <td className="p-3 pl-4 text-foreground font-semibold">
                                                            {item.nombre_producto}
                                                        </td>
                                                        <td className="p-3 font-mono text-muted-foreground">
                                                            {item.sku}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-foreground">
                                                            {item.cantidad}
                                                        </td>
                                                        <td className="p-3 text-right font-mono">
                                                            ${item.precio_unitario.toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-muted-foreground">
                                                            ${unitCost.toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-foreground">
                                                            ${item.subtotal.toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-emerald-500 pr-4">
                                                            +${subtotalProfit.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Modal summary footer */}
                            {orderDetails && (
                                <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center text-xs font-bold">
                                    <div className="flex gap-4">
                                        <div className="text-muted-foreground">Moneda Pago: <span className="text-foreground font-bold">{orderDetails.moneda_pago || 'USD'}</span></div>
                                        <div className="text-muted-foreground">Monto Pago: <span className="text-foreground font-bold">${orderDetails.monto_pago_real ? orderDetails.monto_pago_real.toLocaleString() : '0.00'}</span></div>
                                    </div>
                                    <div className="flex gap-4 text-right">
                                        <div>Ingreso: <span className="text-blue-500 font-extrabold">${selectedOrder.total_ingreso.toFixed(2)}</span></div>
                                        <div>Costo: <span className="text-muted-foreground font-extrabold">${selectedOrder.total_costo.toFixed(2)}</span></div>
                                        <div>Ganancia: <span className="text-emerald-500 font-extrabold">+${selectedOrder.ganancia.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
