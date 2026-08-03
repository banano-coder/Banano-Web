import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Coins, Plus, PlusCircle, Trash, ArrowUpRight, ArrowDownLeft, 
  Calendar, User, Wallet, Banknote, Building2,
  Loader2, Filter, ChevronLeft, ChevronRight, RefreshCw, X, AlertTriangle
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

export const MoneyManagement: React.FC = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<any | null>(null);
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  
  // Movimientos
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [filterCuenta, setFilterCuenta] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modales
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showCreateMovementModal, setShowCreateMovementModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario Nueva Cuenta
  const [newAccountData, setNewAccountData] = useState({
    nombre: '',
    moneda: 'USD',
    saldo_inicial: '0.00',
    id_almacen: '',
    es_cashea: false,
    es_efectivo: false
  });

  // Formulario Nuevo Movimiento Manual
  const [newMovementData, setNewMovementData] = useState({
    id_cuenta: '',
    tipo: 'ingreso',
    monto_usd: '',
    tasa_cambio: '1.00',
    concepto: ''
  });

  // Default accounts modal branch value
  useEffect(() => {
    if (showCreateAccountModal) {
      setNewAccountData(prev => ({ ...prev, id_almacen: selectedWarehouseId }));
    }
  }, [showCreateAccountModal, selectedWarehouseId]);

  // Cargar datos
  const fetchAllData = async () => {
    try {
      const warehouseQuery = selectedWarehouseId ? `?id_almacen=${selectedWarehouseId}` : '';
      const [resCuentas, resResumen, resAlmacenes] = await Promise.all([
        FetchData<any[]>(`${API_ENDPOINTS.MONEY.CUENTAS}${warehouseQuery}`, 'GET'),
        FetchData<any>(`${API_ENDPOINTS.MONEY.RESUMEN}${warehouseQuery}`, 'GET'),
        FetchData<any[]>(API_ENDPOINTS.ALMACENES.LIST, 'GET')
      ]);

      const listC = Array.isArray(resCuentas) ? resCuentas : (resCuentas as any).data || [];
      setCuentas(listC);
      setResumen(resResumen);
      
      const listA = Array.isArray(resAlmacenes) ? resAlmacenes : (resAlmacenes as any).data || [];
      setAlmacenes(listA);

      if (listC.length > 0 && !newMovementData.id_cuenta) {
        setNewMovementData(prev => ({ ...prev, id_cuenta: String(listC[0].id_cuenta) }));
      }
    } catch (e) {
      console.error("Error loading money management data:", e);
    }
  };

  const fetchTransactions = async () => {
    setLoadingMovimientos(true);
    try {
      let query = `?page=${page}&limit=8`;
      if (filterCuenta) query += `&id_cuenta=${filterCuenta}`;
      if (filterTipo) query += `&tipo=${filterTipo}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedWarehouseId) query += `&id_almacen=${selectedWarehouseId}`;

      const res = await FetchData<any>(`${API_ENDPOINTS.MONEY.MOVIMIENTOS}${query}`, 'GET');
      if (res) {
        setMovimientos(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPageCount(Math.ceil((res.total || 0) / (res.limit || 8)));
      }
    } catch (e) {
      console.error("Error fetching transactions:", e);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedWarehouseId]);

  useEffect(() => {
    fetchTransactions();
  }, [page, filterCuenta, filterTipo, searchTerm, selectedWarehouseId]);

  // Manejar cambio de tasa por defecto cuando se selecciona cuenta en el modal de movimientos
  useEffect(() => {
    if (!newMovementData.id_cuenta) return;
    const acc = cuentas.find(c => String(c.id_cuenta) === newMovementData.id_cuenta);
    if (acc) {
      if (acc.moneda === 'USD') {
        setNewMovementData(prev => ({ ...prev, tasa_cambio: '1.00' }));
      } else if (acc.moneda === 'COP') {
        setNewMovementData(prev => ({ ...prev, tasa_cambio: '4000' }));
      } else if (acc.moneda === 'VES') {
        setNewMovementData(prev => ({ ...prev, tasa_cambio: '36' }));
      }
    }
  }, [newMovementData.id_cuenta, cuentas]);

  const handleOpenCreateAccount = () => {
    setError(null);
    setSuccess(null);
    setShowCreateAccountModal(true);
  };

  const handleOpenCreateMovement = () => {
    setError(null);
    setSuccess(null);
    setShowCreateMovementModal(true);
  };

  // Crear Cuenta
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountData.nombre.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(API_ENDPOINTS.MONEY.CUENTAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newAccountData.nombre.trim(),
          moneda: newAccountData.moneda,
          saldo_inicial: parseFloat(newAccountData.saldo_inicial || '0'),
          id_almacen: newAccountData.id_almacen ? parseInt(newAccountData.id_almacen, 10) : null,
          es_cashea: !!newAccountData.es_cashea,
          es_efectivo: !!newAccountData.es_efectivo
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al crear la cuenta');
      }

      setSuccess('Cuenta creada exitosamente!');
      setShowCreateAccountModal(false);
      setNewAccountData({
        nombre: '',
        moneda: 'USD',
        saldo_inicial: '0.00',
        id_almacen: '',
        es_cashea: false,
        es_efectivo: false
      });
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Error al crear cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crear Movimiento Manual
  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id_cuenta, tipo, monto_usd, tasa_cambio, concepto } = newMovementData;
    if (!id_cuenta || !monto_usd || !concepto.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(API_ENDPOINTS.MONEY.MOVIMIENTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cuenta: parseInt(id_cuenta, 10),
          tipo,
          monto_usd: parseFloat(monto_usd),
          tasa_cambio: parseFloat(tasa_cambio || '1'),
          concepto: concepto.trim()
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al registrar el movimiento');
      }

      setSuccess('Movimiento registrado exitosamente!');
      setShowCreateMovementModal(false);
      setNewMovementData({
        id_cuenta: cuentas[0] ? String(cuentas[0].id_cuenta) : '',
        tipo: 'ingreso',
        monto_usd: '',
        tasa_cambio: '1.00',
        concepto: ''
      });
      await fetchAllData();
      await fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Error al registrar movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desactivar/Eliminar Cuenta
  const handleDeleteAccountClick = (cuenta: any) => {
    setError(null);
    setSuccess(null);
    setAccountToDelete(cuenta);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!accountToDelete) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.MONEY.CUENTAS}/${accountToDelete.id_cuenta}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar la cuenta');
      }
      setSuccess('Cuenta eliminada exitosamente.');
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cuenta');
    } finally {
      setAccountToDelete(null);
    }
  };

  const getCurrencySymbol = (moneda: string) => {
    switch (moneda) {
      case 'USD': return '$';
      case 'COP': return 'COP ';
      case 'VES': return 'Bs ';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 text-foreground pb-12">
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
            <Coins className="h-5 w-5 flex-shrink-0" />
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dinero y Caja</h1>
          <p className="text-muted-foreground font-medium">Administra tus cuentas bancarias, ingresos, egresos y tasas de cambio.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Warehouse Selector */}
          <div className="flex items-center gap-2 border border-foreground/10 bg-background/50 rounded-xl px-3 py-1.5 h-11 shadow-sm">
            <Building2 className="h-4 w-4 text-primary" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="bg-transparent border-none text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-card text-foreground">Consolidado (Todas)</option>
              {almacenes.map(a => (
                <option key={a.id_almacen} value={String(a.id_almacen)} className="bg-card text-foreground">
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <Button 
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs h-11"
            onClick={handleOpenCreateAccount}
          >
            <Wallet className="h-4 w-4" /> Crear Cuenta
          </Button>
          <Button 
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl gap-2 shadow-lg shadow-green-600/20 active:scale-95 transition-all text-xs h-11"
            onClick={handleOpenCreateMovement}
          >
            <PlusCircle className="h-4 w-4" /> Registrar Ajuste
          </Button>
        </div>
      </div>

      {/* Resumen de Saldos por Moneda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {['USD', 'COP', 'VES'].map((moneda) => {
          const totalVal = resumen?.saldos?.find((s: any) => s.moneda === moneda)?.total || 0;
          let colorClass = "from-fuchsia-500/10 to-pink-500/5 border-fuchsia-500/20 text-fuchsia-400";
          if (moneda === 'COP') colorClass = "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400";
          if (moneda === 'VES') colorClass = "from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-400";

          return (
            <Card key={moneda} className={`bg-gradient-to-br ${colorClass} border backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold tracking-wider uppercase text-muted-foreground">Saldo Total {moneda}</CardTitle>
                <Coins className="h-5 w-5 opacity-70" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {getCurrencySymbol(moneda)}
                  {totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">Disponible en cuentas {moneda}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Listado de Cuentas */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
          <Banknote className="h-5 w-5 text-primary" /> Cuentas Activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuentas.length === 0 ? (
            <Card className="col-span-full border-dashed p-8 text-center text-muted-foreground bg-card/40 backdrop-blur-sm">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium">No hay cuentas bancarias registradas en el sistema.</p>
            </Card>
          ) : (
            cuentas.map((c) => (
              <Card key={c.id_cuenta} className="bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground text-sm lg:text-base group-hover:text-primary transition-colors leading-snug">{c.nombre}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[9px] font-bold uppercase py-0.5 px-1.5">
                          {c.moneda}
                        </Badge>
                        {c.almacen_nombre && (
                          <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-bold py-0.5 px-1.5 flex items-center gap-1">
                            <Building2 className="h-2.5 w-2.5" /> {c.almacen_nombre}
                          </Badge>
                        )}
                        {c.es_cashea && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] font-bold py-0.5 px-1.5 uppercase">
                            Cashea (4%)
                          </Badge>
                        )}
                        {c.es_efectivo && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-bold py-0.5 px-1.5 uppercase flex items-center gap-1">
                            <Banknote className="h-2.5 w-2.5" /> Efectivo
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Botón borrar */}
                    {c.nombre !== 'Caja Efectivo USD' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                        onClick={() => handleDeleteAccountClick(c)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-black text-foreground mt-2">
                    {getCurrencySymbol(c.moneda)}
                    {Number(c.saldo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Historial de Movimientos */}
      <Card className="border border-border bg-card/85 backdrop-blur-sm shadow-xl overflow-hidden text-foreground">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-md lg:text-lg font-bold text-foreground flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" /> Historial de Movimientos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Registros detallados de ingresos y egresos de efectivo y bancos.
              </CardDescription>
            </div>
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Input
                  className="h-9 text-xs pl-8 bg-background border-border text-foreground focus-visible:ring-primary"
                  placeholder="Buscar concepto..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                />
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/75" />
              </div>
              <select
                className="h-9 border border-border rounded-md px-2.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                value={filterCuenta}
                onChange={(e) => { setFilterCuenta(e.target.value); setPage(1); }}
              >
                <option value="">Todas las Cuentas</option>
                {cuentas.map(c => (
                  <option key={c.id_cuenta} value={c.id_cuenta}>{c.nombre}</option>
                ))}
              </select>
              <select
                className="h-9 border border-border rounded-md px-2.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                value={filterTipo}
                onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
              >
                <option value="">Todos los Tipos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 border-border text-foreground hover:bg-muted"
                onClick={() => { fetchTransactions(); fetchAllData(); }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Concepto</th>
                  <th className="p-4">Cuenta</th>
                  <th className="p-4">Monto USD</th>
                  <th className="p-4">Tasa</th>
                  <th className="p-4">Monto Real</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loadingMovimientos ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                      Cargando transacciones...
                    </td>
                  </tr>
                ) : movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                      No hay transacciones registradas.
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id_transaccion} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium max-w-[240px] truncate">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-full flex-shrink-0 ${
                            m.tipo === 'ingreso' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {m.tipo === 'ingreso' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                          </span>
                          <div>
                            <p className="font-bold text-foreground truncate">{m.concepto}</p>
                            {m.id_pedido && <span className="text-[10px] text-primary/80 font-semibold font-mono">Pedido #{m.id_pedido}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{m.cuenta_nombre}</p>
                          <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-bold py-0 px-1 mt-0.5 uppercase">
                            {m.cuenta_moneda}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-foreground">
                        ${m.monto_usd.toFixed(2)}
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">
                        {m.tasa_cambio.toFixed(2)}
                      </td>
                      <td className={`p-4 font-mono font-bold ${
                        m.tipo === 'ingreso' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {m.tipo === 'ingreso' ? '+' : '-'}
                        {getCurrencySymbol(m.cuenta_moneda)}
                        {m.monto_real.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" /> {m.usuario_nombre || 'Sistema'}
                        </div>
                      </td>
                      <td className="p-4 text-right text-muted-foreground font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className="h-3 w-3" /> {new Date(m.created_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPageCount > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10 text-xs">
              <span className="text-muted-foreground font-medium">Mostrando {movimientos.length} de {totalItems} movimientos</span>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 border-border text-foreground hover:bg-muted"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="h-8 px-3 flex items-center justify-center font-bold border border-border rounded-md bg-background text-foreground">
                  Página {page} de {totalPageCount}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 border-border text-foreground hover:bg-muted"
                  disabled={page === totalPageCount}
                  onClick={() => setPage(p => Math.min(totalPageCount, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Crear Cuenta */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-card/95 border border-border shadow-2xl animate-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" /> Crear Nueva Cuenta
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Registra un banco o caja física para el negocio.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
                onClick={() => setShowCreateAccountModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateAccount}>
              <CardContent className="p-4 space-y-4">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Nombre de la Cuenta *</label>
                  <Input 
                    className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                    placeholder="Ej: Banesco Bolívares, Caja Chica COP" 
                    value={newAccountData.nombre}
                    onChange={(e) => setNewAccountData({ ...newAccountData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Moneda *</label>
                    <select 
                      className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                      value={newAccountData.moneda}
                      onChange={(e) => setNewAccountData({ ...newAccountData, moneda: e.target.value })}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="COP">COP (Pesos)</option>
                      <option value="VES">VES (Bolívares)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Saldo Inicial</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                      placeholder="0.00"
                      value={newAccountData.saldo_inicial}
                      onChange={(e) => setNewAccountData({ ...newAccountData, saldo_inicial: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Almacén / Sucursal Asociado</label>
                  <select 
                    className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                    value={newAccountData.id_almacen}
                    onChange={(e) => setNewAccountData({ ...newAccountData, id_almacen: e.target.value })}
                  >
                    <option value="">Ninguno (Cuenta General)</option>
                    {almacenes.map(a => (
                      <option key={a.id_almacen} value={a.id_almacen}>{a.nombre}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground italic">Permite organizar el dinero según el punto de venta física.</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <Checkbox 
                    id="es_cashea" 
                    checked={newAccountData.es_cashea} 
                    onCheckedChange={(checked) => setNewAccountData(prev => ({ ...prev, es_cashea: !!checked, es_efectivo: !!checked ? false : prev.es_efectivo }))}
                    className="border-border text-primary focus-visible:ring-primary"
                  />
                  <label htmlFor="es_cashea" className="text-xs font-bold text-foreground cursor-pointer select-none">
                    ¿Es cuenta de Cashea? (Aplica 4% de comisión)
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox 
                    id="es_efectivo" 
                    checked={newAccountData.es_efectivo}
                    disabled={newAccountData.es_cashea}
                    onCheckedChange={(checked) => setNewAccountData(prev => ({ ...prev, es_efectivo: !!checked }))}
                    className="border-border text-primary focus-visible:ring-primary"
                  />
                  <label htmlFor="es_efectivo" className={`text-xs font-bold cursor-pointer select-none ${newAccountData.es_cashea ? 'text-muted-foreground' : 'text-foreground'}`}>
                    ¿Es caja de efectivo de la sede? (Pagos efectivo POS se registran aquí)
                  </label>
                </div>
              </CardContent>
              <div className="p-4 border-t border-border flex gap-2 justify-end bg-muted/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => setShowCreateAccountModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear Cuenta'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Registrar Ajuste Manual */}
      {showCreateMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-card/95 border border-border shadow-2xl animate-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-green-600" /> Registrar Ajuste de Caja
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Ingresa o retira dinero manualmente de una cuenta.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
                onClick={() => setShowCreateMovementModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateMovement}>
              <CardContent className="p-4 space-y-4 text-foreground">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Cuenta de Caja *</label>
                    <select 
                      className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                      value={newMovementData.id_cuenta}
                      onChange={(e) => setNewMovementData({ ...newMovementData, id_cuenta: e.target.value })}
                      required
                    >
                      {cuentas.map(c => (
                        <option key={c.id_cuenta} value={c.id_cuenta}>
                          {c.nombre} ({c.moneda})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Tipo de Movimiento *</label>
                    <select 
                      className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                      value={newMovementData.tipo}
                      onChange={(e) => setNewMovementData({ ...newMovementData, tipo: e.target.value })}
                      required
                    >
                      <option value="ingreso">Ingreso (+)</option>
                      <option value="egreso">Egreso (-)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Monto en USD ($) *</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                      placeholder="0.00"
                      value={newMovementData.monto_usd}
                      onChange={(e) => setNewMovementData({ ...newMovementData, monto_usd: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Tasa de Cambio *</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                      placeholder="1.00"
                      value={newMovementData.tasa_cambio}
                      onChange={(e) => setNewMovementData({ ...newMovementData, tasa_cambio: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {(() => {
                  const activeAcc = cuentas.find(c => String(c.id_cuenta) === newMovementData.id_cuenta);
                  if (activeAcc && activeAcc.moneda !== 'USD') {
                    const calculated = parseFloat(newMovementData.monto_usd || '0') * parseFloat(newMovementData.tasa_cambio || '1');
                    return (
                      <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10 text-xs font-bold text-primary animate-in fade-in duration-200">
                        Se registrarán {getCurrencySymbol(activeAcc.moneda)}{calculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} en {activeAcc.nombre}.
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Concepto / Motivo *</label>
                  <Input 
                    className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                    placeholder="Ej: Depósito semanal, Ajuste por descuadre" 
                    value={newMovementData.concepto}
                    onChange={(e) => setNewMovementData({ ...newMovementData, concepto: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <div className="p-4 border-t border-border flex gap-2 justify-end bg-muted/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => setShowCreateMovementModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar Movimiento'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Custom confirmation dialog for deletion */}
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent className="bg-card/95 border border-border backdrop-blur-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" /> ¿Eliminar cuenta bancaria?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              ¿Estás seguro de que deseas eliminar la cuenta bancaria <strong>{accountToDelete?.nombre}</strong>? El saldo y los movimientos históricos se conservarán para auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t pt-3 mt-2">
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted text-xs h-9 px-4 rounded-lg font-semibold">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccountConfirm} 
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 px-4 rounded-lg active:scale-95 transition-all"
            >
              Eliminar Cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
