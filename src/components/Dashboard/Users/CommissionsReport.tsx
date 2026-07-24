import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { Loader2, DollarSign, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export const CommissionsReport = () => {
    // Current month start and end dates
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(lastDay);
    const [commissionPct, setCommissionPct] = useState<string>('5'); // Default 5%
    
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCommissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_ENDPOINTS.REPORTS.COMMISSIONS}?from=${fromDate}&to=${toDate}`;
            const res = await FetchData<any[]>(url, 'GET');
            setData(Array.isArray(res) ? res : res.data || []);
        } catch (err: any) {
            console.error("Error fetching commissions:", err);
            setError(err.message || 'Error al cargar las comisiones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [fromDate, toDate]);

    const pct = parseFloat(commissionPct) || 0;
    
    const totalRevenue = data.reduce((sum, item) => sum + (item.total_ventas || 0), 0);
    const totalProfit = data.reduce((sum, item) => sum + (item.ganancia_neta || 0), 0);
    const totalCommissions = totalProfit * (pct / 100);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-semibold">
                    <AlertTriangle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Config & Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <Card className="border border-border shadow-md bg-card/60 backdrop-blur-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Período
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Desde</label>
                                <Input 
                                    type="date" 
                                    className="h-9 text-xs font-semibold focus-visible:ring-primary bg-background" 
                                    value={fromDate} 
                                    onChange={(e) => setFromDate(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Hasta</label>
                                <Input 
                                    type="date" 
                                    className="h-9 text-xs font-semibold focus-visible:ring-primary bg-background" 
                                    value={toDate} 
                                    onChange={(e) => setToDate(e.target.value)} 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-md bg-card/60 backdrop-blur-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-accent-foreground" /> Configurar Porcentaje
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Input 
                                type="number" 
                                className="h-10 lg:h-12 text-lg font-black focus-visible:ring-primary bg-background pl-4 pr-10" 
                                value={commissionPct} 
                                onChange={(e) => setCommissionPct(e.target.value)} 
                                placeholder="5"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground font-bold">
                                %
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                            Porcentaje a aplicar sobre el ingreso bruto generado por cada vendedor.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-primary font-bold flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Comisiones Totales a Pagar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground drop-shadow-sm">
                            ${totalCommissions.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">
                            Basado en ${totalProfit.toFixed(2)} de ganancia bruta
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* List of sellers and commissions */}
            <Card className="border border-border shadow-xl bg-card/85 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold text-foreground">Desglose por Vendedor</CardTitle>
                        <Button variant="outline" size="sm" onClick={fetchCommissions} disabled={loading} className="gap-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar Reporte"}
                        </Button>
                    </div>
                    <CardDescription className="text-xs">Muestra el ingreso total y la comisión calculada para el período seleccionado.</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left font-inter">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/40 font-bold tracking-wider border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Vendedor</th>
                                <th className="px-6 py-4 text-right">Ventas Totales</th>
                                <th className="px-6 py-4 text-right text-emerald-600">Ganancia Bruta</th>
                                <th className="px-6 py-4 text-right text-primary">Comisión Calculada ({pct}%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                                        Calculando comisiones...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground font-medium">
                                        No se registraron ventas en este período.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, i) => {
                                    const revenue = item.total_ventas || 0;
                                    const profit = item.ganancia_neta || 0;
                                    const commission = profit * (pct / 100);
                                    
                                    return (
                                        <tr key={item.id_usuario || i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                {item.nombre_usuario}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-muted-foreground">
                                                ${revenue.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                ${profit.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-primary text-base">
                                                ${commission.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {data.length > 0 && (
                            <tfoot className="bg-muted/40 border-t border-border font-bold">
                                <tr>
                                    <td className="px-6 py-4 text-foreground text-right uppercase text-xs tracking-wider">Totales</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">${totalRevenue.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600">${totalProfit.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-primary text-lg">${totalCommissions.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Card>
        </div>
    );
};
