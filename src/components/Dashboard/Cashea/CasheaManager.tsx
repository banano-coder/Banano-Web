import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Percent, Coins, Calendar, User, Wallet, Banknote, 
  Loader2, RefreshCw, X, AlertTriangle, CheckCircle2, CheckCircle, ChevronDown, Landmark
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';

export const CasheaManager: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tabs: 'pending' | 'liquidated'
  const [activeTab, setActiveTab] = useState<'pending' | 'liquidated'>('pending');

  // Multi-select for liquidation
  const [selectedTxIds, setSelectedTxIds] = useState<number[]>([]);

  // Liquidation Modal
  const [showLiquidationModal, setShowLiquidationModal] = useState(false);
  const [selectedDestAccountId, setSelectedDestAccountId] = useState<string>('');
  const [tasaCambio, setTasaCambio] = useState<string>('36.50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar estadísticas y cuentas
  const loadStatsAndAccounts = async () => {
    setLoading(true);
    try {
      const [statsRes, accountsRes] = await Promise.all([
        FetchData<any>((API_ENDPOINTS as any).CASHEA.STATS, 'GET'),
        FetchData<any[]>(API_ENDPOINTS.MONEY.CUENTAS, 'GET')
      ]);
      setStats(statsRes);
      
      const accList = Array.isArray(accountsRes) ? accountsRes : (accountsRes as any).data || [];
      // Filter out Cashea accounts as destination targets
      setAccounts(accList.filter((a: any) => !a.es_cashea));
      
      if (accList.length > 0) {
        const defaultDest = accList.find((a: any) => a.moneda === 'VES' && !a.es_cashea) || accList.find((a: any) => !a.es_cashea);
        if (defaultDest) setSelectedDestAccountId(String(defaultDest.id_cuenta));
      }
    } catch (e) {
      console.error("Error loading Cashea dashboard:", e);
      setError("No se pudieron cargar las estadísticas de Cashea.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar transacciones según la pestaña activa
  const loadTransactions = async () => {
    setLoadingTxs(true);
    try {
      const isLiquidated = activeTab === 'liquidated';
      const res = await FetchData<any[]>(`${(API_ENDPOINTS as any).CASHEA.TRANSACTIONS}?liquidado=${isLiquidated}`, 'GET');
      setTransactions(Array.isArray(res) ? res : []);
      setSelectedTxIds([]); // Reset select state
    } catch (e) {
      console.error("Error loading Cashea transactions:", e);
      setError("No se pudieron cargar las transacciones.");
    } finally {
      setLoadingTxs(false);
    }
  };

  useEffect(() => {
    loadStatsAndAccounts();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [activeTab]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTxIds(transactions.map(t => t.id_transaccion));
    } else {
      setSelectedTxIds([]);
    }
  };

  const handleSelectTx = (txId: number, checked: boolean) => {
    if (checked) {
      setSelectedTxIds(prev => [...prev, txId]);
    } else {
      setSelectedTxIds(prev => prev.filter(id => id !== txId));
    }
  };

  const handleOpenLiquidation = () => {
    if (selectedTxIds.length === 0) return;
    setError(null);
    setSuccess(null);
    setShowLiquidationModal(true);
  };

  const handleLiquidarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTxIds.length === 0 || !selectedDestAccountId) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch((API_ENDPOINTS as any).CASHEA.LIQUIDAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: selectedTxIds,
          id_cuenta_destino: parseInt(selectedDestAccountId, 10),
          tasa_cambio: parseFloat(tasaCambio)
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Error al liquidar las transacciones.');
      }

      setSuccess(`Liquidación procesada con éxito. Monto neto recibido: $${resData.totalNetUsd.toFixed(2)}`);
      setShowLiquidationModal(false);
      setSelectedTxIds([]);
      await loadStatsAndAccounts();
      await loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Error durante la liquidación');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular montos acumulados para las transacciones seleccionadas
  const selectedTotalGross = transactions
    .filter(t => selectedTxIds.includes(t.id_transaccion))
    .reduce((sum, t) => sum + t.monto_usd, 0);

  const selectedTotalCommission = transactions
    .filter(t => selectedTxIds.includes(t.id_transaccion))
    .reduce((sum, t) => sum + t.comision_usd, 0);

  const selectedTotalNet = selectedTotalGross - selectedTotalCommission;

  const selectedDestAccount = accounts.find(a => String(a.id_cuenta) === selectedDestAccountId);
  const calculatedNetDest = selectedDestAccount?.moneda === 'USD' 
    ? selectedTotalNet 
    : selectedTotalNet * parseFloat(tasaCambio || '0');

  return (
    <div className="space-y-6 text-foreground pb-12">
      {/* Mensajes de feedback */}
      {error && (
        <div className="fixed top-6 right-6 z-[9999] bg-red-600 text-white border border-red-700 shadow-2xl p-4 rounded-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 max-w-md w-full md:w-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="h-6 w-6 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="fixed top-6 right-6 z-[9999] bg-emerald-600 text-white border border-emerald-700 shadow-2xl p-4 rounded-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 max-w-md w-full md:w-auto">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-xs font-semibold">{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess(null)} className="h-6 w-6 hover:bg-white/10 rounded-md flex items-center justify-center transition-colors flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Módulo Cashea</h1>
          <p className="text-muted-foreground font-medium font-inter">Control de transacciones, cálculo del 4% de comisiones y conciliación de liquidaciones bancarias.</p>
        </div>
        <div>
          <Button 
            className="bg-card border border-border text-foreground hover:bg-muted font-semibold rounded-xl gap-2 shadow-sm active:scale-95 transition-all text-xs h-11"
            onClick={async () => { await loadStatsAndAccounts(); await loadTransactions(); }}
          >
            <RefreshCw className="h-4 w-4" /> Actualizar Datos
          </Button>
        </div>
      </div>

      {/* Estadísticas de Cashea */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card/45 h-32 rounded-xl border border-border"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Ventas Brutas */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Ventas (Bruto)</CardTitle>
              <Coins className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">${(stats?.bruto || 0).toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                Real: Bs {(stats?.bruto_real || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          {/* Total Comisiones Cobradas */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comisiones Cobradas (4%)</CardTitle>
              <Percent className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">${(stats?.comision || 0).toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                Real: Bs {(stats?.comision_real || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          {/* Pendiente por Cobrar / Liquidar */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Por Liquidar (Neto)</CardTitle>
              <Wallet className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-amber-500">${(stats?.pendiente_neto || 0).toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                Bruto: ${(stats?.pendiente_bruto || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Conciliado / Ya Liquidado */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Liquidado (Neto)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-green-500">${(stats?.liquidado_neto || 0).toFixed(2)}</div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                Bruto: ${(stats?.liquidado_bruto || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selector de Pestañas */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Pendientes por Liquidar
        </button>
        <button
          onClick={() => setActiveTab('liquidated')}
          className={`py-3 px-6 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'liquidated'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Historial de Liquidaciones
        </button>
      </div>

      {/* Listado de Transacciones */}
      <Card className="border border-border bg-card/85 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-sm lg:text-base font-bold flex items-center gap-2">
                <Landmark className="h-4.5 w-4.5 text-primary" /> 
                {activeTab === 'pending' ? 'Cobros Pendientes' : 'Historial Conciliado'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {activeTab === 'pending' 
                  ? 'Transacciones de caja registradas a través de Cashea que aún no han sido cobradas en su cuenta bancaria.' 
                  : 'Registros de caja Cashea liquidados y conciliados anteriormente.'}
              </CardDescription>
            </div>
            {activeTab === 'pending' && selectedTxIds.length > 0 && (
              <Button
                onClick={handleOpenLiquidation}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs px-4 py-2 flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                Liquidar Lote ({selectedTxIds.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  {activeTab === 'pending' && (
                    <th className="p-4 w-12 text-center">
                      <Checkbox
                        checked={transactions.length > 0 && selectedTxIds.length === transactions.length}
                        onCheckedChange={handleSelectAll}
                        className="border-border text-primary"
                      />
                    </th>
                  )}
                  <th className="p-4">Pedido / Concepto</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Monto Bruto (USD)</th>
                  <th className="p-4">Comisión 4% (USD)</th>
                  <th className="p-4 text-primary">Monto Neto (USD)</th>
                  <th className="p-4">Cuenta Cashea</th>
                  <th className="p-4 text-right">Fecha Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loadingTxs ? (
                  <tr>
                    <td colSpan={activeTab === 'pending' ? 8 : 7} className="p-12 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                      Cargando transacciones...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'pending' ? 8 : 7} className="p-12 text-center text-muted-foreground italic">
                      No hay transacciones Cashea {activeTab === 'pending' ? 'pendientes por liquidar' : 'liquidadas'}.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const netoUsd = tx.monto_usd - tx.comision_usd;
                    const isSelected = selectedTxIds.includes(tx.id_transaccion);
                    return (
                      <tr key={tx.id_transaccion} className="hover:bg-muted/10 transition-colors">
                        {activeTab === 'pending' && (
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectTx(tx.id_transaccion, !!checked)}
                              className="border-border text-primary"
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-foreground">{tx.concepto}</p>
                            {tx.id_pedido && (
                              <span className="text-[10px] text-primary/80 font-mono font-semibold">
                                Pedido #{tx.id_pedido}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-foreground">{tx.cliente_nombre}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{tx.cedula_cliente}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold">${tx.monto_usd.toFixed(2)}</td>
                        <td className="p-4 font-mono text-orange-500 font-semibold">${tx.comision_usd.toFixed(2)}</td>
                        <td className="p-4 font-mono text-primary font-bold">${netoUsd.toFixed(2)}</td>
                        <td className="p-4 text-muted-foreground font-medium">{tx.cuenta_origen_nombre}</td>
                        <td className="p-4 text-right text-muted-foreground font-mono">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Liquidación */}
      {showLiquidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-card/95 border border-border shadow-2xl animate-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-primary" /> Liquidar Cobros Cashea
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Procesar lote de cobros y transferir el saldo neto.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
                onClick={() => setShowLiquidationModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleLiquidarSubmit}>
              <CardContent className="p-4 space-y-4">
                {/* Desglose de Lote */}
                <div className="bg-muted/30 border border-border rounded-xl p-3 text-xs space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Detalle del Lote Seleccionado</h4>
                  <div className="flex justify-between">
                    <span>Cobros a Conciliar:</span>
                    <span className="font-bold">{selectedTxIds.length} transacciones</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto Bruto Total:</span>
                    <span className="font-bold font-mono">${selectedTotalGross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-500">
                    <span>Comisiones de Plataforma (4%):</span>
                    <span className="font-bold font-mono">-${selectedTotalCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold border-t border-border pt-1.5">
                    <span>Monto Neto Total:</span>
                    <span className="font-mono">${selectedTotalNet.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cuenta de Destino */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Cuenta Bancaria de Destino *</label>
                  <select 
                    className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                    value={selectedDestAccountId}
                    onChange={(e) => setSelectedDestAccountId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Seleccionar Banco Destino</option>
                    {accounts.map(a => (
                      <option key={a.id_cuenta} value={a.id_cuenta}>
                        {a.nombre} ({a.moneda})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tasa de Cambio (solo si la cuenta destino es Bs / VES) */}
                {selectedDestAccount?.moneda === 'VES' && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-primary">Tasa de Cambio de Liquidación (Bs/$)</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-10 bg-background border-primary/20 text-primary text-sm focus-visible:ring-primary font-bold" 
                      placeholder="Ej: 36.50"
                      value={tasaCambio}
                      onChange={(e) => setTasaCambio(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Cálculo Final en Destino */}
                {selectedDestAccount && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs font-semibold text-primary animate-in fade-in duration-200">
                    Se acreditarán: {selectedDestAccount.moneda === 'VES' ? 'Bs ' : '$'}
                    {calculatedNetDest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} en {selectedDestAccount.nombre}.
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border flex gap-2 justify-end bg-muted/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => setShowLiquidationModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Procesando...
                    </>
                  ) : 'Confirmar Liquidación'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
