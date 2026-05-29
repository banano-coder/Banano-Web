import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Receipt, Lightbulb, Home, Truck, UserCheck, Coins, Megaphone, Wrench, Shield, 
  ShoppingBag, Coffee, DollarSign, HelpCircle, Plus, PlusCircle, Trash, 
  ArrowUpRight, ArrowDownLeft, Calendar, User, Wallet, Banknote, Building2, 
  Loader2, Filter, ChevronLeft, ChevronRight, RefreshCw, X, AlertTriangle, 
  List, Tags, Info, Edit, Check
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
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

// Lucide Icon Mapping for dynamic rendering
export const EXPENSE_ICONS: Record<string, React.ComponentType<any>> = {
  Receipt,
  Lightbulb,
  Home,
  Truck,
  UserCheck,
  Coins,
  Megaphone,
  Wrench,
  Shield,
  ShoppingBag,
  Coffee,
  DollarSign
};

// Available colors for categories
const CATEGORY_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#6b7280'  // Gray
];

export const ExpensesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gastos' | 'categorias'>('gastos');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data lists
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Dialogs
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

  // Filters
  const [searchConcept, setSearchConcept] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Add/Edit Category Form State
  const [categoryForm, setCategoryForm] = useState({
    id_categoria_gasto: null as number | null,
    nombre: '',
    descripcion: '',
    icono: 'Receipt',
    color: '#ef4444'
  });

  // Add Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    id_categoria_gasto: '',
    monto_usd: '',
    tasa_cambio: '1.00',
    id_cuenta: '',
    id_almacen: '',
    concepto: '',
    fecha_gasto: new Date().toISOString().split('T')[0]
  });

  // Fetch initial configuration data (accounts, categories, warehouses)
  const fetchMetadata = async () => {
    try {
      const [resCuentas, resCats, resAlmacenes] = await Promise.all([
        FetchData<any[]>(API_ENDPOINTS.MONEY.CUENTAS, 'GET'),
        FetchData<any[]>(API_ENDPOINTS.EXPENSES.CATEGORIES, 'GET'),
        FetchData<any[]>(API_ENDPOINTS.ALMACENES.LIST, 'GET')
      ]);

      const listC = Array.isArray(resCuentas) ? resCuentas : (resCuentas as any).data || [];
      setAccounts(listC);

      const listCats = Array.isArray(resCats) ? resCats : [];
      setCategories(listCats);

      const listA = Array.isArray(resAlmacenes) ? resAlmacenes : (resAlmacenes as any).data || [];
      setWarehouses(listA);

      // Pre-fill default account and category in form
      if (listC.length > 0 && !expenseForm.id_cuenta) {
        setExpenseForm(prev => ({ ...prev, id_cuenta: String(listC[0].id_cuenta) }));
      }
      if (listCats.length > 0 && !expenseForm.id_categoria_gasto) {
        setExpenseForm(prev => ({ ...prev, id_categoria_gasto: String(listCats[0].id_categoria_gasto) }));
      }
    } catch (err) {
      console.error("Error loading expenses metadata:", err);
    }
  };

  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const catDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch paginated expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (searchConcept) query += `&search=${encodeURIComponent(searchConcept)}`;
      if (filterCategory) query += `&id_categoria_gasto=${filterCategory}`;
      if (filterWarehouse) query += `&id_almacen=${filterWarehouse}`;
      if (filterFrom) query += `&from=${filterFrom}`;
      if (filterTo) query += `&to=${filterTo}`;

      const res = await FetchData<any>(`${API_ENDPOINTS.EXPENSES.LIST}${query}`, 'GET');
      if (res) {
        setExpenses(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPageCount(Math.ceil((res.total || 0) / (res.limit || 10)));
      }
    } catch (err) {
      console.error("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [page, searchConcept, filterCategory, filterWarehouse, filterFrom, filterTo]);

  // Adjust default exchange rate based on selected account currency
  useEffect(() => {
    if (!expenseForm.id_cuenta) return;
    const account = accounts.find(a => String(a.id_cuenta) === expenseForm.id_cuenta);
    if (account) {
      if (account.moneda === 'USD') {
        setExpenseForm(prev => ({ ...prev, tasa_cambio: '1.00' }));
      } else if (account.moneda === 'COP') {
        setExpenseForm(prev => ({ ...prev, tasa_cambio: '4000' }));
      } else if (account.moneda === 'VES') {
        setExpenseForm(prev => ({ ...prev, tasa_cambio: '36' }));
      }
    }
  }, [expenseForm.id_cuenta, accounts]);

  // Form Submit: Create Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nombre.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const isEditing = categoryForm.id_categoria_gasto !== null;
      const url = isEditing 
        ? API_ENDPOINTS.EXPENSES.CATEGORY_ITEM(categoryForm.id_categoria_gasto!)
        : API_ENDPOINTS.EXPENSES.CATEGORIES;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: categoryForm.nombre.trim(),
          descripcion: categoryForm.descripcion.trim() || null,
          icono: categoryForm.icono,
          color: categoryForm.color
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al guardar la categoría');
      }

      setSuccess(`Categoría "${categoryForm.nombre}" guardada con éxito.`);
      setShowAddCategoryModal(false);
      setCategoryForm({
        id_categoria_gasto: null,
        nombre: '',
        descripcion: '',
        icono: 'Receipt',
        color: '#ef4444'
      });
      await fetchMetadata();
      await fetchExpenses(); // Refresh list to get updated category details
    } catch (err: any) {
      setError(err.message || 'Error al guardar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Submit: Create Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id_categoria_gasto, monto_usd, tasa_cambio, id_cuenta, id_almacen, concepto, fecha_gasto } = expenseForm;
    if (!id_categoria_gasto || !monto_usd || !id_cuenta || !concepto.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(API_ENDPOINTS.EXPENSES.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_categoria_gasto: parseInt(id_categoria_gasto, 10),
          monto_usd: parseFloat(monto_usd),
          tasa_cambio: parseFloat(tasa_cambio || '1'),
          id_cuenta: parseInt(id_cuenta, 10),
          id_almacen: id_almacen ? parseInt(id_almacen, 10) : null,
          concepto: concepto.trim(),
          fecha_gasto: fecha_gasto || null
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al registrar el gasto');
      }

      setSuccess('Gasto registrado exitosamente.');
      setShowAddExpenseModal(false);
      setExpenseForm({
        id_categoria_gasto: categories[0] ? String(categories[0].id_categoria_gasto) : '',
        monto_usd: '',
        tasa_cambio: '1.00',
        id_cuenta: accounts[0] ? String(accounts[0].id_cuenta) : '',
        id_almacen: '',
        concepto: '',
        fecha_gasto: new Date().toISOString().split('T')[0]
      });
      await fetchMetadata();
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Actions
  const handleOpenEditCategory = (cat: any) => {
    setError(null);
    setSuccess(null);
    setCategoryForm({
      id_categoria_gasto: cat.id_categoria_gasto,
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      icono: cat.icono || 'Receipt',
      color: cat.color || '#ef4444'
    });
    setShowAddCategoryModal(true);
  };

  const handleOpenCreateCategory = () => {
    setError(null);
    setSuccess(null);
    setCategoryForm({
      id_categoria_gasto: null,
      nombre: '',
      descripcion: '',
      icono: 'Receipt',
      color: '#ef4444'
    });
    setShowAddCategoryModal(true);
  };

  const handleConfirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(API_ENDPOINTS.EXPENSES.DELETE(expenseToDelete.id_gasto), {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al anular el gasto');
      }
      setSuccess('Gasto anulado exitosamente. Los fondos fueron revertidos a la cuenta.');
      await fetchMetadata();
      await fetchExpenses();
    } catch (err: any) {
      setError(err.message || 'Error al anular el gasto');
    } finally {
      setExpenseToDelete(null);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(API_ENDPOINTS.EXPENSES.CATEGORY_ITEM(categoryToDelete.id_categoria_gasto), {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al eliminar la categoría');
      }
      setSuccess('Categoría de gasto eliminada exitosamente.');
      await fetchMetadata();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la categoría');
    } finally {
      setCategoryToDelete(null);
    }
  };

  // Helper to dynamically render icon
  const renderCategoryIcon = (iconName: string, color: string, sizeClass = "h-4 w-4") => {
    const IconComp = EXPENSE_ICONS[iconName] || HelpCircle;
    return (
      <div 
        className="p-2 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <IconComp className={sizeClass} />
      </div>
    );
  };

  const getCurrencySymbol = (moneda: string) => {
    switch (moneda) {
      case 'USD': return '$';
      case 'COP': return 'COP ';
      case 'VES': return 'Bs ';
      default: return '';
    }
  };

  // Calculate metrics
  const totalExpensesUSD = expenses.reduce((acc, exp) => acc + (exp.monto_usd || 0), 0);
  const highestExpense = expenses.length > 0 
    ? Math.max(...expenses.map(e => e.monto_usd)) 
    : 0;

  // Category breakdown for metrics
  const categorySummaryMap = React.useMemo(() => {
    const map = new Map<number, { name: string, color: string, icon: string, totalUSD: number }>();
    categories.forEach(cat => {
      map.set(cat.id_categoria_gasto, { name: cat.nombre, color: cat.color, icon: cat.icono, totalUSD: 0 });
    });

    expenses.forEach(exp => {
      const entry = map.get(exp.id_categoria_gasto);
      if (entry) {
        entry.totalUSD += exp.monto_usd;
      }
    });

    return Array.from(map.values()).filter(x => x.totalUSD > 0).sort((a, b) => b.totalUSD - a.totalUSD);
  }, [expenses, categories]);

  // Selected account for balance check in form
  const selectedAccount = React.useMemo(() => {
    if (!expenseForm.id_cuenta) return null;
    return accounts.find(a => String(a.id_cuenta) === expenseForm.id_cuenta) || null;
  }, [expenseForm.id_cuenta, accounts]);

  // Calculate real expense amount in local currency
  const calculatedRealAmount = React.useMemo(() => {
    const usd = parseFloat(expenseForm.monto_usd || '0');
    const rate = parseFloat(expenseForm.tasa_cambio || '1');
    return +(usd * rate).toFixed(2);
  }, [expenseForm.monto_usd, expenseForm.tasa_cambio]);

  // Check if balance is insufficient
  const isBalanceInsufficient = React.useMemo(() => {
    if (!selectedAccount) return false;
    return selectedAccount.saldo < calculatedRealAmount;
  }, [selectedAccount, calculatedRealAmount]);

  const selectedCat = React.useMemo(() => {
    if (!expenseForm.id_categoria_gasto) return null;
    return categories.find(c => String(c.id_categoria_gasto) === expenseForm.id_categoria_gasto) || null;
  }, [expenseForm.id_categoria_gasto, categories]);

  return (
    <div className="space-y-6 text-foreground pb-12">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 text-red-500 hover:bg-red-500/10 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3.5 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Check className="h-4.5 w-4.5 text-green-500 flex-shrink-0" />
            <span className="text-xs font-semibold">{success}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSuccess(null)} className="h-6 w-6 text-green-500 hover:bg-green-500/10 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gestión de Gastos</h1>
          <p className="text-muted-foreground font-medium">Controla los egresos, pagos operativos y clasificación de gastos de la tienda.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button 
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs h-11"
            onClick={() => setShowAddExpenseModal(true)}
          >
            <Plus className="h-4 w-4" /> Registrar Gasto
          </Button>
          <Button 
            variant="outline"
            className="flex-1 sm:flex-none border-border hover:bg-muted text-foreground font-semibold rounded-xl gap-2 active:scale-95 transition-all text-xs h-11"
            onClick={handleOpenCreateCategory}
          >
            <PlusCircle className="h-4 w-4 text-primary" /> Crear Categoría
          </Button>
        </div>
      </div>

      {/* Panel con Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('gastos')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'gastos' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="h-4 w-4" /> Historial de Gastos
        </button>
        <button
          onClick={() => setActiveTab('categorias')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'categorias' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Tags className="h-4 w-4" /> Categorías de Gastos
        </button>
      </div>

      {/* ════════════════ PESTAÑA: HISTORIAL DE GASTOS ════════════════ */}
      {activeTab === 'gastos' && (
        <div className="space-y-6">
          {/* Tarjetas Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-fuchsia-500/10 to-pink-500/5 border border-fuchsia-500/20 backdrop-blur-md shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold tracking-wider uppercase text-muted-foreground">Gastos Totales (Filtro)</CardTitle>
                <DollarSign className="h-5 w-5 text-fuchsia-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  ${totalExpensesUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">Acumulado en los gastos mostrados abajo.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 backdrop-blur-md shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold tracking-wider uppercase text-muted-foreground">Gasto Más Alto</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  ${highestExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">Mayor egreso individual registrado en este lote.</p>
              </CardContent>
            </Card>

            {/* Desglose por categoría */}
            <Card className="border border-border bg-card/85 backdrop-blur-sm shadow-xl flex flex-col justify-between">
              <CardHeader className="pb-2 flex flex-row justify-between items-center space-y-0">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Distribución de Gastos</CardTitle>
                <Building2 className="h-4.5 w-4.5 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3 max-h-[88px] overflow-y-auto pr-1">
                {categorySummaryMap.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">Sin gastos para graficar.</p>
                ) : (
                  categorySummaryMap.map((cat, idx) => {
                    const pct = totalExpensesUSD > 0 ? (cat.totalUSD / totalExpensesUSD) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-foreground truncate max-w-[130px]">{cat.name}</span>
                          <span className="text-muted-foreground">${cat.totalUSD.toFixed(0)} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: `${pct}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historial de Gastos Card */}
          <Card className="border border-border bg-card/85 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                  <CardTitle className="text-md lg:text-lg font-bold text-foreground flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" /> Listado de Gastos
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Controla y anula egresos operativos en tiempo real.
                  </CardDescription>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                  <div className="relative flex-1 min-w-[180px]">
                    <Input
                      className="h-9 text-xs pl-8 bg-background border-border text-foreground focus-visible:ring-primary"
                      placeholder="Buscar por concepto..."
                      value={searchConcept}
                      onChange={(e) => { setSearchConcept(e.target.value); setPage(1); }}
                    />
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/75" />
                  </div>
                  <select
                    className="h-9 border border-border rounded-md px-2.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                  >
                    <option value="">Todas las Categorías</option>
                    {categories.map(c => (
                      <option key={c.id_categoria_gasto} value={c.id_categoria_gasto}>{c.nombre}</option>
                    ))}
                  </select>
                  <select
                    className="h-9 border border-border rounded-md px-2.5 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    value={filterWarehouse}
                    onChange={(e) => { setFilterWarehouse(e.target.value); setPage(1); }}
                  >
                    <option value="">Todas las Sucursales</option>
                    {warehouses.map(w => (
                      <option key={w.id_almacen} value={w.id_almacen}>{w.nombre}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5 bg-background border border-border px-2 py-1.5 rounded-md h-9">
                    <span className="text-[10px] font-bold text-muted-foreground">Desde:</span>
                    <input 
                      type="date" 
                      value={filterFrom} 
                      onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
                      className="bg-transparent border-none text-[10px] text-foreground outline-none font-semibold cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-background border border-border px-2 py-1.5 rounded-md h-9">
                    <span className="text-[10px] font-bold text-muted-foreground">Hasta:</span>
                    <input 
                      type="date" 
                      value={filterTo} 
                      onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
                      className="bg-transparent border-none text-[10px] text-foreground outline-none font-semibold cursor-pointer"
                    />
                  </div>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 border-border text-foreground hover:bg-muted shrink-0"
                    onClick={() => {
                      setSearchConcept('');
                      setFilterCategory('');
                      setFilterWarehouse('');
                      setFilterFrom('');
                      setFilterTo('');
                      setPage(1);
                    }}
                    title="Limpiar filtros"
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
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Concepto</th>
                      <th className="p-4">Cuenta</th>
                      <th className="p-4">Monto USD</th>
                      <th className="p-4">Tasa</th>
                      <th className="p-4">Monto Real</th>
                      <th className="p-4">Sucursal</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4 text-center w-16">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                          Cargando gastos...
                        </td>
                      </tr>
                    ) : expenses.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-muted-foreground italic font-medium">
                          No hay gastos registrados que coincidan con los filtros.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((e) => (
                        <tr key={e.id_gasto} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {renderCategoryIcon(e.categoria_icono, e.categoria_color || '#ef4444', "h-3.5 w-3.5")}
                              <span className="font-bold text-foreground">{e.categoria_nombre}</span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-foreground max-w-[200px] truncate" title={e.concepto}>
                            {e.concepto}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-foreground text-[11px] leading-tight">{e.cuenta_nombre}</p>
                              <Badge className="bg-muted text-muted-foreground border-none text-[8px] font-bold px-1 mt-0.5 uppercase">
                                {e.cuenta_moneda}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-foreground">
                            ${e.monto_usd.toFixed(2)}
                          </td>
                          <td className="p-4 font-mono text-muted-foreground">
                            {e.tasa_cambio.toFixed(2)}
                          </td>
                          <td className="p-4 font-mono font-bold text-red-500">
                            -{getCurrencySymbol(e.cuenta_moneda)}
                            {e.monto_real.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 font-semibold text-muted-foreground">
                            {e.almacen_nombre ? (
                              <Badge variant="outline" className="text-[10px] font-semibold flex items-center gap-1 w-fit bg-background">
                                <Building2 className="h-3 w-3 text-primary" /> {e.almacen_nombre}
                              </Badge>
                            ) : (
                              <span className="italic text-muted-foreground/60 text-[10px]">General</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" /> {e.fecha_gasto}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              onClick={() => setExpenseToDelete(e)}
                              title="Anular Gasto (Revertir Dinero)"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
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
                  <span className="text-muted-foreground font-medium">Mostrando {expenses.length} de {totalItems} gastos</span>
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
        </div>
      )}

      {/* ════════════════ PESTAÑA: CATEGORÍAS DE GASTOS ════════════════ */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {categories.map((cat) => (
              <Card key={cat.id_categoria_gasto} className="bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {renderCategoryIcon(cat.icono, cat.color || '#ef4444', "h-5 w-5")}
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm lg:text-base leading-snug">{cat.nombre}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="h-2.5 w-2.5 rounded-full shrink-0 border border-black/10" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">{cat.icono}</span>
                        </div>
                      </div>
                    </div>
                    {/* Botones de acción */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        onClick={() => handleOpenEditCategory(cat)}
                        title="Editar Categoría"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={() => setCategoryToDelete(cat)}
                        title="Eliminar Categoría"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {cat.descripcion || <span className="italic opacity-60">Sin descripción.</span>}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Tarjeta de añadir categoría */}
            <Card 
              className="border-dashed border-2 border-border/70 hover:border-primary/50 bg-card/20 backdrop-blur-sm cursor-pointer hover:bg-muted/10 transition-all duration-300 flex flex-col items-center justify-center text-center p-6 min-h-[120px]"
              onClick={handleOpenCreateCategory}
            >
              <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
              <p className="text-sm font-bold text-foreground">Añadir Categoría de Gasto</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">Crea etiquetas personalizadas con su icono y color para clasificar gastos.</p>
            </Card>
          </div>
        </div>
      )}

      {/* ════════════════ MODALES Y COMPONENTES FLOTANTES ════════════════ */}

      {/* Modal: Registrar Gasto */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg bg-card/95 border border-border shadow-2xl animate-in zoom-in duration-200 text-foreground">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" /> Registrar Gasto Operativo
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Deduce dinero de tus cuentas y crea un registro contable de gasto.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
                onClick={() => setShowAddExpenseModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateExpense}>
              <CardContent className="p-4 space-y-4">
                {isBalanceInsufficient && selectedAccount && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl flex items-start gap-2.5 animate-in shake duration-300">
                    <AlertTriangle className="h-4.5 w-4.5 animate-pulse mt-0.5 flex-shrink-0" />
                    <div className="text-xs font-semibold leading-tight">
                      <p className="font-bold">Saldo Insuficiente en Cuenta</p>
                      <p className="opacity-90 mt-0.5">
                        Disponible: {getCurrencySymbol(selectedAccount.moneda)}{selectedAccount.saldo.toFixed(2)} {selectedAccount.moneda}
                      </p>
                      <p className="opacity-90">
                        Requerido: {getCurrencySymbol(selectedAccount.moneda)}{calculatedRealAmount.toFixed(2)} {selectedAccount.moneda}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5" ref={catDropdownRef}>
                    <label className="text-xs font-bold text-muted-foreground">Categoría de Gasto *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm font-medium hover:border-primary/45 transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          {selectedCat ? (
                            <>
                              {renderCategoryIcon(selectedCat.icono, selectedCat.color || '#ef4444', "h-3.5 w-3.5")}
                              <span className="font-bold text-xs">{selectedCat.nombre}</span>
                            </>
                          ) : (
                            <span className="opacity-50">-- Seleccionar Categoría --</span>
                          )}
                        </span>
                        <span className="ml-2 text-xs opacity-50 shrink-0">▼</span>
                      </button>

                      {isCatDropdownOpen && (
                        <div 
                          className="absolute left-0 mt-1.5 w-full rounded-md border border-border bg-card shadow-2xl z-50 p-1.5 space-y-1 max-h-52 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {categories.map((c) => {
                            const isCurrent = String(c.id_categoria_gasto) === expenseForm.id_categoria_gasto;
                            return (
                              <button
                                key={c.id_categoria_gasto}
                                type="button"
                                onClick={() => {
                                  setExpenseForm({ ...expenseForm, id_categoria_gasto: String(c.id_categoria_gasto) });
                                  setIsCatDropdownOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded transition-colors ${
                                  isCurrent ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                  {renderCategoryIcon(c.icono, c.color || '#ef4444', "h-3.5 w-3.5")}
                                  <span className="text-xs font-bold text-foreground truncate">{c.nombre}</span>
                                </div>
                                {isCurrent && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Concepto / Descripción *</label>
                    <Input 
                      className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                      placeholder="Ej: Pago de Luz local CC Santa Bárbara, Envío de Repuestos"
                      value={expenseForm.concepto}
                      onChange={(e) => setExpenseForm({ ...expenseForm, concepto: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Cuenta de Caja / Origen *</label>
                    <select 
                      className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                      value={expenseForm.id_cuenta}
                      onChange={(e) => setExpenseForm({ ...expenseForm, id_cuenta: e.target.value })}
                      required
                    >
                      {accounts.map(c => (
                        <option key={c.id_cuenta} value={c.id_cuenta}>
                          {c.nombre} ({getCurrencySymbol(c.moneda)}{c.saldo.toFixed(2)} {c.moneda})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Sucursal / Almacén Asociado</label>
                    <select 
                      className="w-full h-10 border border-border rounded-md px-3 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-medium"
                      value={expenseForm.id_almacen}
                      onChange={(e) => setExpenseForm({ ...expenseForm, id_almacen: e.target.value })}
                    >
                      <option value="">Ninguno (Gasto General)</option>
                      {warehouses.map(w => (
                        <option key={w.id_almacen} value={w.id_almacen}>{w.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Monto en USD ($) *</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                      placeholder="0.00"
                      value={expenseForm.monto_usd}
                      onChange={(e) => setExpenseForm({ ...expenseForm, monto_usd: e.target.value })}
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
                      value={expenseForm.tasa_cambio}
                      onChange={(e) => setExpenseForm({ ...expenseForm, tasa_cambio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Fecha del Gasto *</label>
                    <Input 
                      type="date"
                      className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                      value={expenseForm.fecha_gasto}
                      onChange={(e) => setExpenseForm({ ...expenseForm, fecha_gasto: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Resumen de conversión monetaria */}
                {selectedAccount && selectedAccount.moneda !== 'USD' && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs font-bold text-primary flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    Se deducirán exactamente {getCurrencySymbol(selectedAccount.moneda)}{calculatedRealAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedAccount.moneda} de la cuenta bancaria.
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border flex gap-2 justify-end bg-muted/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => setShowAddExpenseModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isSubmitting || isBalanceInsufficient}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar Gasto'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Crear / Editar Categoría */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-md bg-card/95 border border-border shadow-2xl animate-in zoom-in duration-200 text-foreground">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div>
                <CardTitle className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
                  <Tags className="h-5 w-5 text-primary" /> 
                  {categoryForm.id_categoria_gasto !== null ? 'Editar Categoría de Gasto' : 'Crear Categoría de Gasto'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Establece un nombre, icono y color para identificar los gastos.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
                onClick={() => setShowAddCategoryModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSaveCategory}>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Nombre de Categoría *</label>
                  <Input 
                    className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                    placeholder="Ej: Servicios, Alquiler, Sueldos" 
                    value={categoryForm.nombre}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Descripción</label>
                  <Input 
                    className="h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-medium" 
                    placeholder="Ej: Pago mensual de arriendo de sucursales" 
                    value={categoryForm.descripcion}
                    onChange={(e) => setCategoryForm({ ...categoryForm, descripcion: e.target.value })}
                  />
                </div>

                {/* SELECTOR DE ICONO */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Identificador / Icono *</label>
                  <div className="grid grid-cols-6 gap-2 p-3 bg-muted/40 rounded-xl border border-border">
                    {Object.keys(EXPENSE_ICONS).map((iconName) => {
                      const IconComponent = EXPENSE_ICONS[iconName];
                      const isSelected = categoryForm.icono === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, icono: iconName })}
                          className={`h-10 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary text-primary-foreground shadow shadow-primary/40 scale-105' 
                              : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                          }`}
                          title={iconName}
                        >
                          <IconComponent className="h-4.5 w-4.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTOR DE COLOR */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Color de Identificación *</label>
                  <div className="flex flex-wrap gap-2.5 p-3 bg-muted/40 rounded-xl border border-border justify-center">
                    {CATEGORY_COLORS.map((colorHex) => {
                      const isSelected = categoryForm.color === colorHex;
                      return (
                        <button
                          key={colorHex}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, color: colorHex })}
                          className="h-7 w-7 rounded-full flex items-center justify-center border border-black/10 shadow-sm relative active:scale-90 transition-transform"
                          style={{ backgroundColor: colorHex }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0.5 rounded-full border-2 border-white flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-border flex gap-2 justify-end bg-muted/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-muted"
                  onClick={() => setShowAddCategoryModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Categoría'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Alertas de confirmación */}
      <AlertDialog open={expenseToDelete !== null} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent className="bg-card border border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-lg text-foreground">¿Está seguro de anular este gasto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm font-medium">
              Esta acción es destructiva pero reversible. Se marcará el gasto como eliminado e insertará un ingreso compensatorio en el historial, devolviendo los fondos de forma automática a la cuenta <strong>{expenseToDelete?.cuenta_nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteExpense}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              Confirmar Anulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={categoryToDelete !== null} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-card border border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-lg text-foreground">¿Está seguro de eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm font-medium">
              Se eliminará la categoría de la lista de opciones. Los gastos existentes asociados a esta categoría se mantendrán en el registro histórico pero no podrás elegirla para nuevos gastos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteCategory}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
