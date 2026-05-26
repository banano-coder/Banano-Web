import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Search, ShoppingCart, User, Phone, Mail, Hash, 
    ArrowLeft, ArrowRight, Plus, Minus, CheckCircle, Package, Info, Loader2, LayoutGrid, X
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from '@/types';

export const POSSystem = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mobile view state: 'catalog' | 'cart'
    const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');

    // Formulario de Venta
    const [customerData, setCustomerData] = useState({
        cedula: '',
        nombre: '',
        email: '',
        telefono: '',
        metodo: 'Efectivo',
        referencia: '',
        observacion: ''
    });

    // Cuentas y Multidivisa
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [selectedCuentaId, setSelectedCuentaId] = useState<string>('');
    const [tasaCambio, setTasaCambio] = useState<string>('1.00');
    const [montoPagoReal, setMontoPagoReal] = useState<string>('');

    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    const activeAcc = cuentas.find(c => String(c.id_cuenta) === selectedCuentaId);
    const isUSD = !activeAcc || activeAcc.moneda === 'USD';

    // Metadata for brand mapping
    const [brands, setBrands] = useState<any[]>([]);

    // Current user and warehouses list
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    // Cargar información de usuario actual y almacenes
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setCurrentUser(parsed);
            } catch (e) {
                console.error("Error parsing user in POS:", e);
            }
        }

        const fetchWarehouses = async () => {
            try {
                const res = await FetchData<any[]>(`${API_ENDPOINTS.ALMACENES.LIST}?activo=true`, 'GET');
                const list = Array.isArray(res) ? res : (res as any).data || [];
                setWarehouses(list);
            } catch (e) {
                console.error("Error fetching warehouses for POS header:", e);
            }
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const brandsData = await FetchData<any[]>(API_ENDPOINTS.CATALOG.BRANDS, 'GET');
                const list = Array.isArray(brandsData) ? brandsData : (brandsData as any).data || [];
                setBrands(list.map((b: any) => ({
                    id: String(b.id_marca || b.id),
                    name: b.nombre || b.name
                })));
            } catch (e) {
                console.error("Error fetching brands for POS:", e);
            }
        };
        fetchBrands();
    }, []);

    // Cargar cuentas
    useEffect(() => {
        const fetchCuentas = async () => {
            try {
                const res = await FetchData<any[]>(API_ENDPOINTS.MONEY.CUENTAS, 'GET');
                const list = Array.isArray(res) ? res : (res as any).data || [];
                setCuentas(list);
                if (list.length > 0) {
                    const defaultAcc = list.find((c: any) => c.moneda === 'USD') || list[0];
                    setSelectedCuentaId(String(defaultAcc.id_cuenta));
                }
            } catch (e) {
                console.error("Error fetching accounts for POS:", e);
            }
        };
        fetchCuentas();
    }, []);

    // Auto-tasa al cambiar cuenta o total
    useEffect(() => {
        if (!selectedCuentaId || cuentas.length === 0) return;
        const acc = cuentas.find(c => String(c.id_cuenta) === selectedCuentaId);
        if (acc) {
            if (acc.moneda === 'USD') {
                setTasaCambio('1.00');
                setMontoPagoReal(subtotal.toFixed(2));
            } else if (acc.moneda === 'COP') {
                setTasaCambio('4000');
                setMontoPagoReal((subtotal * 4000).toFixed(2));
            } else if (acc.moneda === 'VES') {
                setTasaCambio('36');
                setMontoPagoReal((subtotal * 36).toFixed(2));
            }
        }
    }, [selectedCuentaId, subtotal, cuentas]);

    const handleTasaChange = (val: string) => {
        setTasaCambio(val);
        const rate = parseFloat(val);
        if (Number.isFinite(rate) && rate > 0) {
            setMontoPagoReal((subtotal * rate).toFixed(2));
        } else {
            setMontoPagoReal('');
        }
    };

    const handleCedulaBlur = async () => {
        const ced = customerData.cedula.trim();
        if (!ced) return;
        try {
            const res = await fetch(`/api/guest/cliente/${ced}`);
            if (res.ok) {
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    setCustomerData(prev => ({
                        ...prev,
                        cedula: json.data.cedula || prev.cedula,
                        nombre: json.data.nombre || prev.nombre,
                        email: json.data.email || prev.email,
                        telefono: json.data.telefono || prev.telefono
                    }));
                }
            }
        } catch (e) {
            console.error("Error auto-filling client info:", e);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!customerData.nombre || !customerData.cedula) {
            alert("El nombre y la cédula del cliente son requeridos.");
            return;
        }

        setIsSubmitting(true);
        try {
            const activeAcc = cuentas.find(c => String(c.id_cuenta) === selectedCuentaId);
            const currency = activeAcc?.moneda || 'USD';
            const rate = currency === 'USD' ? 1.0 : parseFloat(tasaCambio || '1');
            const calculatedPayReal = currency === 'USD' ? subtotal : subtotal * rate;
            const payReal = montoPagoReal ? parseFloat(montoPagoReal) : calculatedPayReal;

            const payload = {
                items: cart.map(item => ({
                    id_variante_producto: item.id,
                    cantidad: item.cantidad
                })),
                cliente_cedula: customerData.cedula,
                cliente_nombre: customerData.nombre,
                cliente_email: customerData.email || null,
                cliente_telefono: customerData.telefono || null,
                nota: customerData.observacion || 'Venta POS',
                id_cuenta: parseInt(selectedCuentaId, 10),
                moneda_pago: currency,
                tasa_cambio: rate,
                monto_pago_real: parseFloat(payReal.toFixed(2))
            };

            const response = await fetch(API_ENDPOINTS.POS.CHECKOUT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Error en el checkout');
            }

            alert(`Venta registrada exitosamente! Pedido #${result.id_pedido}`);
            
            // Limpiar carrito y formulario
            setCart([]);
            setCustomerData({
                cedula: '',
                nombre: '',
                email: '',
                telefono: '',
                metodo: 'Efectivo',
                referencia: '',
                observacion: ''
            });
            setTasaCambio('1.00');
            setMontoPagoReal('');
            
            // Recargar productos
            await fetchProducts();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error registrando la venta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Read user info from localStorage to filter by assigned warehouse
            let userWarehouseId = null;
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed && parsed.id_almacen != null) {
                        userWarehouseId = parsed.id_almacen;
                    }
                } catch (e) {
                    console.error("Error parsing user from localStorage in POS:", e);
                }
            }

            const catalogUrl = searchTerm 
                ? `${API_ENDPOINTS.CATALOG.PRODUCTS}?q=${searchTerm}&limit=100`
                : `${API_ENDPOINTS.CATALOG.PRODUCTS}?limit=100`;
            
            let adminUrl = searchTerm 
                ? `${API_ENDPOINTS.PRODUCTS.LIST}?search=${searchTerm}`
                : API_ENDPOINTS.PRODUCTS.LIST;

            if (userWarehouseId != null) {
                adminUrl += (adminUrl.includes('?') ? '&' : '?') + `id_almacen=${userWarehouseId}`;
            }

            const [catalogRes, adminRes]: any = await Promise.all([
                FetchData<any>(catalogUrl),
                FetchData<any>(adminUrl)
            ]);

            const catalogRaw = catalogRes.data || [];
            const adminRaw = Array.isArray(adminRes) ? adminRes : adminRes.data || [];

            const mapped = catalogRaw.map((p: any) => {
                const adminMatch = adminRaw.find((a: any) => String(a.id_producto) === String(p.id_producto));
                
                let brandName = p.brand_name || p.marca_nombre || p.marca?.nombre || p.marca || '';
                if (!brandName || brandName.toUpperCase() === 'GENERIC') {
                    const found = brands.find(b => b.id === String(p.id_marca));
                    if (found) brandName = found.name;
                }
                
                return {
                    ...p,
                    displayBrand: brandName || adminMatch?.brand_name || 'Particular',
                    displayPrice: Number(p.min_price) || Number(p.precio) || 0,
                    displayImage: p.imagen_principal || p.image || adminMatch?.image || 'https://placehold.co/400x400/261633/FFF?text=Banano',
                    displayStock: adminMatch?.total_stock !== undefined ? adminMatch.total_stock : (p.stock || 0),
                    default_variant_id: adminMatch?.default_variant_id || p.default_variant_id || p.id_producto
                };
            });
            
            setProducts(mapped);
        } catch (error) {
            console.error("Error fetching POS products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, brands]);

    const addToCart = (product: any) => {
        const variantId = product.default_variant_id || product.id_producto;
        const existing = cart.find(item => item.id === variantId);
        if (existing) {
            setCart(cart.map(item => 
                item.id === variantId 
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            ));
        } else {
            setCart([...cart, {
                id: variantId,
                nombre: product.nombre,
                precio: product.displayPrice,
                cantidad: 1,
                imagen: product.displayImage
            }]);
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = item.cantidad + delta;
                return newQty > 0 ? { ...item, cantidad: newQty } : item;
            }
            return item;
        }).filter(item => item.cantidad > 0));
    };

    /* ─────────────────────────────── Sidebar Content (shared between mobile & desktop) ─────────────────────────────── */
    const renderSidebarContent = () => (
        <>
            {/* Carrito */}
            <Card className="border border-border shadow-xl bg-card/85 backdrop-blur-sm flex flex-col max-h-[45%] lg:max-h-[40%]">
                <CardHeader className="py-3 lg:py-4 border-b border-border">
                    <CardTitle className="text-sm lg:text-md flex items-center gap-2 text-foreground font-semibold">
                        <ShoppingCart className="h-4 w-4 text-primary" /> Carrito
                        {totalItems > 0 && (
                            <Badge className="ml-auto bg-primary text-primary-foreground border-none text-[10px] font-bold">
                                {totalItems} items
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-3 lg:p-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-8">
                            <div className="text-center space-y-2">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                                <p className="text-xs text-muted-foreground">Agrega productos desde el catálogo.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 lg:space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-2 lg:gap-3 items-center border-b border-border pb-2">
                                    <img src={item.imagen} className="w-10 h-10 lg:w-12 lg:h-12 rounded object-contain border border-border bg-white dark:bg-black/20 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] lg:text-xs font-bold text-foreground truncate">{item.nombre}</p>
                                        <p className="text-[10px] text-primary font-bold">${item.precio}</p>
                                    </div>
                                    <div className="flex items-center border border-border rounded-md overflow-hidden bg-background flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6 hover:bg-muted text-foreground" onClick={() => updateQuantity(item.id, -1)}>
                                            <Minus className="h-3 w-3"/>
                                        </Button>
                                        <span className="w-6 text-[10px] text-center font-bold text-foreground">{item.cantidad}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6 hover:bg-muted text-foreground" onClick={() => updateQuantity(item.id, 1)}>
                                            <Plus className="h-3 w-3"/>
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80 flex-shrink-0" onClick={() => removeFromCart(item.id)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Datos Venta */}
            <Card className="border border-border shadow-xl bg-card/85 backdrop-blur-sm flex-1 flex flex-col overflow-hidden text-foreground">
                <CardHeader className="py-3 lg:py-4 border-b border-border bg-muted/40">
                    <CardTitle className="text-sm lg:text-md flex items-center gap-2 text-foreground font-semibold">
                        <LayoutGrid className="h-4 w-4 text-primary" /> Datos de la Venta
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Cédula</label>
                            <Input 
                                className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                                placeholder="V12345678" 
                                value={customerData.cedula}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomerData(prev => {
                                        if (val.trim() === '') {
                                            return {
                                                ...prev,
                                                cedula: '',
                                                nombre: '',
                                                email: '',
                                                telefono: ''
                                            };
                                        }
                                        return { ...prev, cedula: val };
                                    });
                                }}
                                onBlur={handleCedulaBlur}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Nombre</label>
                            <Input 
                                className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                                placeholder="Juan Pérez" 
                                value={customerData.nombre}
                                onChange={(e) => setCustomerData({ ...customerData, nombre: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Email</label>
                            <Input 
                                type="email"
                                className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                                placeholder="juan@mail.com" 
                                value={customerData.email}
                                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Teléfono</label>
                            <Input 
                                className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                                placeholder="584121234567" 
                                value={customerData.telefono}
                                onChange={(e) => setCustomerData({ ...customerData, telefono: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Método *</label>
                            <select 
                                className="w-full h-9 lg:h-10 border border-border rounded-md px-3 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                value={customerData.metodo}
                                onChange={(e) => setCustomerData({ ...customerData, metodo: e.target.value })}
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Pago Móvil">Pago Móvil</option>
                                <option value="Zelle">Zelle</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Referencia</label>
                            <Input 
                                className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                                placeholder="REF-001" 
                                value={customerData.referencia}
                                onChange={(e) => setCustomerData({ ...customerData, referencia: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Observación</label>
                        <Input 
                            className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                            placeholder="Ej: Mostrador" 
                            value={customerData.observacion}
                            onChange={(e) => setCustomerData({ ...customerData, observacion: e.target.value })}
                        />
                    </div>

                    {/* Cuenta de Destino y Multidivisa */}
                    <div className="border-t border-border pt-3 mt-2 space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground">Cuenta de Destino *</label>
                            <select 
                                className="w-full h-9 lg:h-10 border border-border rounded-md px-3 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                value={selectedCuentaId}
                                onChange={(e) => setSelectedCuentaId(e.target.value)}
                            >
                                {cuentas.map((c: any) => (
                                    <option key={c.id_cuenta} value={c.id_cuenta}>
                                        {c.nombre} ({c.moneda}) - Saldo: {c.moneda === 'USD' ? '$' : c.moneda === 'COP' ? 'COP ' : 'Bs '}{Number(c.saldo).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!isUSD && activeAcc && (
                            <div className="grid grid-cols-2 gap-2 lg:gap-3 p-2.5 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in duration-200 text-foreground">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary">Tasa de Cambio ({activeAcc.moneda}/$)</label>
                                    <Input 
                                        type="number"
                                        step="any"
                                        className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                                        placeholder="Ej: 4000" 
                                        value={tasaCambio}
                                        onChange={(e) => handleTasaChange(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary">Cobro en {activeAcc.moneda}</label>
                                    <Input 
                                        type="number"
                                        step="any"
                                        className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-bold text-primary" 
                                        placeholder="Ej: 20000" 
                                        value={montoPagoReal}
                                        onChange={(e) => setMontoPagoReal(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2 text-[10px] text-muted-foreground font-semibold">
                                    Monto base: ${subtotal.toFixed(2)} USD &times; {tasaCambio} = {activeAcc.moneda === 'COP' ? 'COP' : 'Bs'} {(subtotal * parseFloat(tasaCambio || '0')).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button 
                        className="w-full h-12 lg:h-14 mt-4 lg:mt-6 bg-green-600 hover:bg-green-500 text-white font-bold gap-2 lg:gap-3 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center uppercase tracking-wider text-xs lg:text-sm active:scale-95 transition-all"
                        disabled={cart.length === 0 || isSubmitting}
                        onClick={handleCheckout}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" /> Procesando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" /> Confirmar Venta • ${subtotal.toFixed(2)}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </>
    );
    const userWarehouse = warehouses.find(w => w.id_almacen === currentUser?.id_almacen);
    const warehouseName = userWarehouse ? userWarehouse.nombre : (currentUser?.id_almacen ? `Almacén #${currentUser.id_almacen}` : 'Todas (Admin/Central)');

    return (
        <div className="flex flex-col h-[calc(100vh-240px)] bg-transparent overflow-hidden">
            {/* Header Superior */}
            <div className="flex flex-wrap items-center gap-3 p-3 lg:p-4 bg-card/45 border border-border backdrop-blur-md rounded-xl mb-4 shadow-sm text-xs md:text-sm text-foreground">
                <h1 className="font-extrabold text-base lg:text-lg border-r border-border pr-3 mr-1">Venta POS</h1>
                
                {currentUser && (
                    <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 font-medium">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>Cajero: <strong className="text-primary">{currentUser.nombre}</strong></span>
                    </div>
                )}
                
                <div className="flex items-center gap-1.5 bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/15 font-medium">
                    <Package className="h-3.5 w-3.5 text-accent-foreground" />
                    <span>Sucursal: <strong className="text-accent-foreground">{warehouseName}</strong></span>
                </div>
            </div>

            <div className="flex flex-1 gap-0 lg:gap-6 pb-0 lg:pb-6 overflow-hidden">
                {/* ═══════════════════════ Contenido Principal (Catálogo) ═══════════════════════ */}
                <div className={`flex-1 flex flex-col gap-3 lg:gap-6 overflow-hidden ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Desktop-only title row */}
                    <div className="hidden lg:block">
                        <h1 className="text-3xl font-extrabold text-foreground drop-shadow-sm">Registrar Venta</h1>
                        <p className="text-sm text-muted-foreground font-medium font-inter">Selecciona variantes del catálogo.</p>
                    </div>

                    {/* Search bar - responsive */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 lg:gap-4 p-3 lg:p-4 bg-card/45 backdrop-blur-md rounded-xl border border-border">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar producto..." 
                                className="pl-10 lg:pl-11 h-10 lg:h-12 bg-background border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                             <Checkbox 
                                id="stock-filter" 
                                checked={showOutOfStock}
                                onCheckedChange={(val) => setShowOutOfStock(!!val)}
                                className="border-border text-primary focus-visible:ring-primary"
                            />
                            <label htmlFor="stock-filter" className="text-xs lg:text-sm font-semibold text-muted-foreground cursor-pointer whitespace-nowrap select-none">
                                Ver sin stock
                            </label>
                        </div>
                    </div>

                    {/* Grid de Productos — responsive columns */}
                    <div className="flex-1 overflow-y-auto pb-20 lg:pb-2 pr-0 lg:pr-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-6 auto-rows-max">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-card/40 backdrop-blur-sm h-[240px] lg:h-[400px] rounded-xl border border-border animate-pulse"></div>
                            ))
                        ) : (
                            products.map((prod) => (
                                <div key={prod.id_producto} className="bg-card/65 backdrop-blur-md rounded-xl border border-border flex flex-col shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group">
                                    {/* Image container — responsive height */}
                                    <div className="relative h-32 sm:h-40 lg:h-64 w-full p-2 lg:p-4 bg-white/80 dark:bg-black/20 border-b border-border flex items-center justify-center rounded-t-xl overflow-hidden">
                                        <img 
                                            src={prod.displayImage} 
                                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                                            alt={prod.nombre} 
                                        />
                                        <Badge className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-primary text-primary-foreground border-none text-[9px] lg:text-[11px] font-bold px-1.5 lg:px-2.5 py-0.5 lg:py-1 shadow-sm">
                                            {prod.displayStock} uds
                                        </Badge>
                                    </div>
                                    
                                    {/* Product info — responsive sizes */}
                                    <div className="p-2.5 lg:p-4 flex flex-col flex-1 min-h-[100px] lg:min-h-[140px]">
                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-[11px] lg:text-[13px] line-clamp-2 leading-tight mb-1 lg:mb-2">{prod.nombre}</h3>
                                        <div className="space-y-0.5 lg:space-y-1 mb-2 lg:mb-4">
                                            <p className="text-[9px] lg:text-[10px] text-primary font-black uppercase tracking-tight truncate">Marca: {prod.displayBrand}</p>
                                            <p className="text-[9px] lg:text-[10px] text-muted-foreground/60 font-mono tracking-tighter">REF-{prod.id_producto}</p>
                                        </div>
                                        <div className="mt-auto pt-1.5 lg:pt-2 border-t border-border">
                                            <div className="text-base lg:text-xl font-black text-foreground mb-1.5 lg:mb-3">${prod.displayPrice.toFixed(2)}</div>
                                            <Button 
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-1.5 lg:py-2.5 rounded-lg flex items-center justify-center gap-1 lg:gap-2 shadow-sm active:scale-95 transition-transform text-[11px] lg:text-sm h-8 lg:h-auto"
                                                onClick={() => addToCart(prod)}
                                            >
                                                <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> Agregar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ═══════════════════════ Barra Lateral / Mobile Cart View ═══════════════════════ */}
                {/* Desktop sidebar */}
                <div className="hidden lg:flex w-[400px] flex-col gap-4 overflow-hidden">
                    {renderSidebarContent()}
                </div>

                {/* Mobile cart/form view */}
                <div className={`flex-1 flex flex-col gap-3 overflow-hidden lg:hidden ${mobileView === 'catalog' ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="outline" size="sm" className="rounded-lg border-border text-foreground h-8 text-xs gap-1" onClick={() => setMobileView('catalog')}>
                            <ArrowLeft className="h-3.5 w-3.5" /> Catálogo
                        </Button>
                        <h2 className="text-base font-bold text-foreground">Carrito & Venta</h2>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
                        {renderSidebarContent()}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════ Mobile Bottom Navigation Bar ═══════════════════════ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
                <div className="flex items-center h-16">
                    <button
                        onClick={() => setMobileView('catalog')}
                        className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
                            mobileView === 'catalog' 
                                ? 'text-primary bg-primary/10' 
                                : 'text-muted-foreground'
                        }`}
                    >
                        <Package className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Catálogo</span>
                    </button>
                    <button
                        onClick={() => setMobileView('cart')}
                        className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors relative ${
                            mobileView === 'cart' 
                                ? 'text-primary bg-primary/10' 
                                : 'text-muted-foreground'
                        }`}
                    >
                        <div className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-3 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-200">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Carrito</span>
                    </button>
                    {/* Quick total bar */}
                    {subtotal > 0 && (
                        <button
                            onClick={() => setMobileView('cart')}
                            className="flex-1 flex flex-col items-center justify-center h-full gap-0.5 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                        >
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-[10px] font-bold">${subtotal.toFixed(2)}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
