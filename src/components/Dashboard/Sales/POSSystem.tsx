import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Search, ShoppingCart, User, Phone, Mail, Hash, 
    ArrowLeft, ArrowRight, Plus, Minus, CheckCircle, Package, Info, Loader2, LayoutGrid, X, DollarSign, AlertTriangle
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from '@/types';
import { useSettings } from '@/hooks/useSettings';

const formatVariantLabel = (atributos: any): string => {
    if (!atributos || typeof atributos !== 'object') return '';
    const entries = Object.entries(atributos);
    if (entries.length === 0) return '';
    return entries.map(([k, v]) => {
        const key = k.trim().toLowerCase();
        if (key === 'tipo') return String(v);
        return `${k}: ${v}`;
    }).join(' / ');
};

export const POSSystem = () => {
    const { settings } = useSettings();
    const incrementoPct = settings?.catalogo?.porcentaje_incremento_bcv ? parseFloat(settings.catalogo.porcentaje_incremento_bcv as any) : 0;

    const [searchTerm, setSearchTerm] = useState('');
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Seleccionar variante states
    const [selectedProductForVariants, setSelectedProductForVariants] = useState<any | null>(null);
    const [variantsForSelectedProduct, setVariantsForSelectedProduct] = useState<any[]>([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Mobile view state: 'catalog' | 'cart'
    const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');

    // Formulario de Venta
    const [customerData, setCustomerData] = useState({
        cedula: '',
        nombre: '',
        email: '',
        telefono: '',
        observacion: ''
    });

    // Cuentas y Multidivisa
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [pagos, setPagos] = useState<any[]>([
        {
            id_cuenta: '',
            metodo: 'Efectivo',
            referencia: '',
            monto_usd: '',
            monto_real: '',
            tasa_cambio: '1.00'
        }
    ]);

    const isOnlyVesPayment = pagos.length > 0 && pagos.every(p => {
        const acc = cuentas.find(c => String(c.id_cuenta) === p.id_cuenta);
        return acc?.moneda === 'VES';
    });
    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

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
                    let rate = '1.00';
                    if (defaultAcc.moneda === 'COP') rate = '4000';
                    else if (defaultAcc.moneda === 'VES') rate = '36';
                    
                    setPagos([{
                        id_cuenta: String(defaultAcc.id_cuenta),
                        metodo: 'Efectivo',
                        referencia: '',
                        monto_usd: subtotal > 0 ? subtotal.toFixed(2) : '',
                        monto_real: subtotal > 0 ? (subtotal * parseFloat(rate)).toFixed(2) : '',
                        tasa_cambio: rate
                    }]);
                }
            } catch (e) {
                console.error("Error fetching accounts for POS:", e);
            }
        };
        fetchCuentas();
    }, []);

    // Sincronizar monto cuando cambia el subtotal o el estado de pago (isOnlyVesPayment)
    useEffect(() => {
        setPagos(prev => {
            if (prev.length === 1) {
                const row = prev[0];
                const rate = parseFloat(row.tasa_cambio || '1');
                const acc = cuentas.find(c => String(c.id_cuenta) === row.id_cuenta);
                const isVes = acc?.moneda === 'VES';
                const effectiveRate = (isOnlyVesPayment && incrementoPct > 0 && isVes) 
                    ? rate * (1 + (incrementoPct / 100)) 
                    : rate;

                const newUsd = subtotal > 0 ? subtotal.toFixed(2) : '';
                const newReal = subtotal > 0 ? (subtotal * effectiveRate).toFixed(2) : '';
                
                if (row.monto_usd === newUsd && row.monto_real === newReal) {
                    return prev;
                }
                
                return [{
                    ...row,
                    monto_usd: newUsd,
                    monto_real: newReal
                }];
            } else if (prev.length > 1) {
                let changed = false;
                const newPagos = prev.map(row => {
                    const rate = parseFloat(row.tasa_cambio || '1');
                    const acc = cuentas.find(c => String(c.id_cuenta) === row.id_cuenta);
                    const isVes = acc?.moneda === 'VES';
                    const effectiveRate = (isOnlyVesPayment && incrementoPct > 0 && isVes) 
                        ? rate * (1 + (incrementoPct / 100)) 
                        : rate;
                    const usdVal = parseFloat(row.monto_usd || '0');
                    
                    if (usdVal > 0) {
                        const expectedReal = (usdVal * effectiveRate).toFixed(2);
                        if (row.monto_real !== expectedReal) {
                            changed = true;
                            return { ...row, monto_real: expectedReal };
                        }
                    }
                    return row;
                });
                return changed ? newPagos : prev;
            }
            return prev;
        });
    }, [subtotal, isOnlyVesPayment, incrementoPct, cuentas]);

    // (Eliminado: Sincronizar precios de ítems del carrito según el estado del pago VES (Bs))
    // Los precios en USD deben mantenerse como base, el recargo del 30% solo se aplica al monto_real en Bs.

    const addPago = () => {
        const currentPaidUsd = pagos.reduce((acc, p) => acc + parseFloat(p.monto_usd || '0'), 0);
        const remainingUsd = Math.max(0, subtotal - currentPaidUsd);
        
        const defaultAcc = cuentas.find((c: any) => c.moneda === 'USD') || cuentas[0];
        if (!defaultAcc) return;
        
        let rate = '1.00';
        if (defaultAcc.moneda === 'COP') rate = '4000';
        else if (defaultAcc.moneda === 'VES') rate = '36';
        
        setPagos(prev => [
            ...prev,
            {
                id_cuenta: String(defaultAcc.id_cuenta),
                metodo: 'Efectivo',
                referencia: '',
                monto_usd: remainingUsd > 0 ? remainingUsd.toFixed(2) : '',
                monto_real: remainingUsd > 0 ? (remainingUsd * parseFloat(rate)).toFixed(2) : '',
                tasa_cambio: rate
            }
        ]);
    };

    const removePago = (index: number) => {
        setPagos(prev => prev.filter((_, i) => i !== index));
    };

    const updatePago = (index: number, field: string, value: string) => {
        // Prevent negative values for numeric fields
        if (['monto_usd', 'monto_real', 'tasa_cambio'].includes(field)) {
            value = value.replace('-', '');
            const parsed = parseFloat(value);
            if (Number.isFinite(parsed) && parsed < 0) {
                value = Math.abs(parsed).toString();
            }
        }

        setPagos(prev => prev.map((item, i) => {
            if (i !== index) return item;
            
            const updated = { ...item, [field]: value };
            
            if (field === 'id_cuenta') {
                const acc = cuentas.find(c => String(c.id_cuenta) === value);
                if (acc) {
                    let defaultRate = '1.00';
                    if (acc.moneda === 'COP') defaultRate = '4000';
                    else if (acc.moneda === 'VES') defaultRate = '36';
                    
                    updated.tasa_cambio = defaultRate;
                    const usdVal = parseFloat(updated.monto_usd || '0');
                    if (usdVal > 0) {
                        const baseVes = usdVal * parseFloat(defaultRate);
                        updated.monto_real = (isOnlyVesPayment && incrementoPct > 0 && acc.moneda === 'VES')
                            ? (baseVes * (1 + (incrementoPct / 100))).toFixed(2)
                            : baseVes.toFixed(2);
                    } else {
                        updated.monto_real = '';
                    }

                    // Auto-detect Cashea accounts and select Cashea method
                    if (acc.es_cashea) {
                        updated.metodo = 'Cashea';
                    } else if (updated.metodo === 'Cashea') {
                        // Reset method if we switched to a non-Cashea account from Cashea
                        updated.metodo = 'Efectivo';
                    }
                }
            }

            if (field === 'metodo' && value === 'Cashea') {
                // Look for the first Cashea account to auto-select
                const casheaAcc = cuentas.find(c => c.es_cashea);
                if (casheaAcc) {
                    updated.id_cuenta = String(casheaAcc.id_cuenta);
                    let defaultRate = '1.00';
                    if (casheaAcc.moneda === 'COP') defaultRate = '4000';
                    else if (casheaAcc.moneda === 'VES') defaultRate = '36';
                    
                    updated.tasa_cambio = defaultRate;
                    const usdVal = parseFloat(updated.monto_usd || '0');
                    if (usdVal > 0) {
                        const baseVes = usdVal * parseFloat(defaultRate);
                        updated.monto_real = (isOnlyVesPayment && incrementoPct > 0 && casheaAcc.moneda === 'VES')
                            ? (baseVes * (1 + (incrementoPct / 100))).toFixed(2)
                            : baseVes.toFixed(2);
                    } else {
                        updated.monto_real = '';
                    }
                }
            }
            
            if (field === 'tasa_cambio') {
                const rate = parseFloat(value);
                const usdVal = parseFloat(updated.monto_usd || '0');
                if (Number.isFinite(rate) && rate > 0 && usdVal > 0) {
                    const acc = cuentas.find(c => String(c.id_cuenta) === updated.id_cuenta);
                    const baseVes = usdVal * rate;
                    updated.monto_real = (isOnlyVesPayment && incrementoPct > 0 && acc?.moneda === 'VES')
                        ? (baseVes * (1 + (incrementoPct / 100))).toFixed(2)
                        : baseVes.toFixed(2);
                }
            }
            
            if (field === 'monto_usd') {
                const usdVal = parseFloat(value);
                const rate = parseFloat(updated.tasa_cambio || '1');
                if (Number.isFinite(usdVal) && Number.isFinite(rate) && rate > 0) {
                    const acc = cuentas.find(c => String(c.id_cuenta) === updated.id_cuenta);
                    const baseVes = usdVal * rate;
                    updated.monto_real = (isOnlyVesPayment && incrementoPct > 0 && acc?.moneda === 'VES')
                        ? (baseVes * (1 + (incrementoPct / 100))).toFixed(2)
                        : baseVes.toFixed(2);
                } else if (value === '') {
                    updated.monto_real = '';
                }
            }
            
            if (field === 'monto_real') {
                const realVal = parseFloat(value);
                const rate = parseFloat(updated.tasa_cambio || '1');
                if (Number.isFinite(realVal) && Number.isFinite(rate) && rate > 0) {
                    const acc = cuentas.find(c => String(c.id_cuenta) === updated.id_cuenta);
                    const effectiveRate = (isOnlyVesPayment && incrementoPct > 0 && acc?.moneda === 'VES') 
                        ? rate * (1 + (incrementoPct / 100))
                        : rate;
                    updated.monto_usd = (realVal / effectiveRate).toFixed(2);
                } else if (value === '') {
                    updated.monto_usd = '';
                }
            }
            
            return updated;
        }));
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
        setError(null);
        setSuccess(null);
        if (cart.length === 0) return;
        if (!customerData.nombre || !customerData.cedula) {
            setError("El nombre y la cédula del cliente son requeridos.");
            return;
        }

        const paidTotal = pagos.reduce((acc, p) => acc + parseFloat(p.monto_usd || '0'), 0);
        const diff = subtotal - paidTotal;
        if (Math.abs(diff) >= 0.01) {
            setError(`El total de los pagos registrados ($${paidTotal.toFixed(2)}) debe coincidir exactamente con el total de la venta ($${subtotal.toFixed(2)}).`);
            return;
        }

        for (const p of pagos) {
            if (!p.id_cuenta) {
                setError("Por favor, seleccione una cuenta de destino para todos los pagos.");
                return;
            }
            const acc = cuentas.find(c => String(c.id_cuenta) === p.id_cuenta);
            if (p.metodo === 'Cashea' && (!acc || !acc.es_cashea)) {
                setError("El método Cashea solo se puede registrar con una cuenta marcada como Cashea.");
                return;
            }
            if (acc && acc.es_cashea && p.metodo !== 'Cashea') {
                setError(`Para la cuenta "${acc.nombre}", el método de pago debe ser obligatoriamente 'Cashea'.`);
                return;
            }
            const usdVal = parseFloat(p.monto_usd);
            if (isNaN(usdVal) || usdVal <= 0) {
                setError("El monto de cada pago debe ser mayor a 0.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
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
                id_cuenta: parseInt(pagos[0].id_cuenta, 10),
                moneda_pago: cuentas.find(c => String(c.id_cuenta) === pagos[0].id_cuenta)?.moneda || 'USD',
                tasa_cambio: parseFloat(pagos[0].tasa_cambio || '1'),
                monto_pago_real: parseFloat(parseFloat(pagos[0].monto_real || '0').toFixed(2)),
                pagos: pagos.map(p => ({
                    id_cuenta: parseInt(p.id_cuenta, 10),
                    moneda_pago: cuentas.find(c => String(c.id_cuenta) === p.id_cuenta)?.moneda || 'USD',
                    tasa_cambio: parseFloat(p.tasa_cambio || '1'),
                    monto_real: parseFloat(parseFloat(p.monto_real || '0').toFixed(2)),
                    monto_usd: parseFloat(parseFloat(p.monto_usd || '0').toFixed(2)),
                    metodo: p.metodo,
                    referencia: p.referencia || ''
                }))
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

            setSuccess(`Venta registrada exitosamente! Pedido #${result.id_pedido}`);
            
            // Limpiar carrito y formulario
            setCart([]);
            setCustomerData({
                cedula: '',
                nombre: '',
                email: '',
                telefono: '',
                observacion: ''
            });
            
            if (cuentas.length > 0) {
                const defaultAcc = cuentas.find((c: any) => c.moneda === 'USD') || cuentas[0];
                let rate = '1.00';
                if (defaultAcc.moneda === 'COP') rate = '4000';
                else if (defaultAcc.moneda === 'VES') rate = '36';
                setPagos([{
                    id_cuenta: String(defaultAcc.id_cuenta),
                    metodo: 'Efectivo',
                    referencia: '',
                    monto_usd: '',
                    monto_real: '',
                    tasa_cambio: rate
                }]);
            }
            
            // Recargar productos
            await fetchProducts();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error registrando la venta.');
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
                ? `${API_ENDPOINTS.PRODUCTS.LIST}?search=${searchTerm}&limit=100`
                : `${API_ENDPOINTS.PRODUCTS.LIST}?limit=100`;

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

                const defaultVariantId = adminMatch?.default_variant_id || p.default_variant_id || p.id_producto;
                const defaultVar = p.variantes?.find((v: any) => String(v.id_variante_producto) === String(defaultVariantId)) || p.variantes?.[0];
                const actualPrice = defaultVar ? (Number(defaultVar.precio_lista) || 0) : (Number(p.min_price) || Number(p.precio) || 0);

                const variantLabel = defaultVar ? formatVariantLabel(defaultVar.atributos_json) : '';
                const displayName = variantLabel ? `${p.nombre} (${variantLabel})` : p.nombre;
                
                return {
                    ...p,
                    rawNombre: p.nombre,
                    nombre: displayName,
                    displayBrand: brandName || adminMatch?.brand_name || 'Particular',
                    displayPrice: actualPrice,
                    displayImage: p.imagen_principal || p.image || adminMatch?.image || 'https://placehold.co/400x400/261633/FFF?text=Banano',
                    displayStock: adminMatch?.total_stock !== undefined ? adminMatch.total_stock : (p.stock || 0),
                    default_variant_id: defaultVariantId
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

    const openVariantSelector = async (product: any) => {
        setSelectedProductForVariants(product);
        setLoadingVariants(true);
        setVariantsForSelectedProduct([]);
        try {
            let warehouseId = null;
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    warehouseId = parsed?.id_almacen;
                } catch (e) {
                    console.error("Error parsing user warehouse for variant selection:", e);
                }
            }

            const baseUrl = API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto);
            const url = warehouseId ? `${baseUrl}?id_almacen=${warehouseId}` : baseUrl;

            const res = await FetchData<any>(url);
            const list = Array.isArray(res) ? res : res.data || [];
            setVariantsForSelectedProduct(list);
        } catch (e) {
            console.error("Error fetching variants for POS:", e);
            setError("No se pudieron cargar las variantes del producto.");
        } finally {
            setLoadingVariants(false);
        }
    };

    const addVariantToCart = (product: any, variant: any, quantity: number) => {
        const variantId = variant.id_variante_producto || variant.id;
        const existing = cart.find(item => item.id === variantId);
        const basePrice = Number(variant.precio_lista) || 0;

        const variantLabel = formatVariantLabel(variant.atributos_json);
        const displayName = variantLabel ? `${product.rawNombre || product.nombre} (${variantLabel})` : (product.rawNombre || product.nombre);
        const displayImage = variant.url_imagen || product.displayImage;

        if (existing) {
            setCart(cart.map(item => 
                item.id === variantId 
                ? { ...item, cantidad: item.cantidad + quantity }
                : item
            ));
        } else {
            setCart([...cart, {
                id: variantId,
                nombre: displayName,
                precio_base: basePrice,
                precio: basePrice,
                cantidad: quantity,
                imagen: displayImage
            }]);
        }
    };

    const addToCart = (product: any) => {
        const variantId = product.default_variant_id || product.id_producto;
        const existing = cart.find(item => item.id === variantId);
        const basePrice = Number(product.displayPrice) || 0;

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
                precio_base: basePrice,
                precio: basePrice,
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
    const renderCarritoCard = () => (
        <Card className="border border-border shadow-xl bg-card/85 backdrop-blur-sm flex flex-col h-full overflow-hidden">
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
            <CardContent className="max-h-[220px] overflow-y-auto p-3 lg:p-4">
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
    );

    const renderDatosVentaCard = () => (
        <Card className="border border-border shadow-xl bg-card/85 backdrop-blur-sm flex flex-col text-foreground">
            <CardHeader className="py-3 lg:py-4 border-b border-border bg-muted/40 flex-shrink-0">
                <CardTitle className="text-sm lg:text-md flex items-center gap-2 text-foreground font-semibold">
                    <LayoutGrid className="h-4 w-4 text-primary" /> Datos de la Venta
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-4 space-y-3 lg:space-y-4">
                <div className="grid grid-cols-12 gap-2 lg:gap-3">
                    {/* Cédula */}
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Cédula</label>
                        <Input 
                            className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-semibold" 
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
                    {/* Nombre */}
                    <div className="col-span-12 sm:col-span-8 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Nombre</label>
                        <Input 
                            className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary font-semibold" 
                            placeholder="Juan Pérez" 
                            value={customerData.nombre}
                            onChange={(e) => setCustomerData({ ...customerData, nombre: e.target.value })}
                        />
                    </div>
                    
                    {/* Teléfono */}
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Teléfono</label>
                        <Input 
                            className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                            placeholder="584121234567" 
                            value={customerData.telefono}
                            onChange={(e) => setCustomerData({ ...customerData, telefono: e.target.value })}
                        />
                    </div>
                    {/* Email */}
                    <div className="col-span-12 sm:col-span-8 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Email</label>
                        <Input 
                            type="email"
                            className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                            placeholder="juan@mail.com" 
                            value={customerData.email}
                            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        />
                    </div>

                    {/* Observación */}
                    <div className="col-span-12 space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Observación</label>
                        <Input 
                            className="h-9 lg:h-10 bg-background border-border text-foreground text-sm focus-visible:ring-primary" 
                            placeholder="Ej: Mostrador" 
                            value={customerData.observacion}
                            onChange={(e) => setCustomerData({ ...customerData, observacion: e.target.value })}
                        />
                    </div>
                </div>

                {/* Métodos de Pago Divididos */}
                <div className="border-t border-border pt-4 mt-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Métodos de Pago</h4>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addPago}
                            className="h-8 border-primary/20 text-primary hover:bg-primary/5 text-[10px] lg:text-xs font-semibold px-2 lg:px-2.5 rounded-lg flex items-center gap-1"
                        >
                            <Plus className="h-3.5 w-3.5" /> Agregar Pago
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {pagos.map((p, idx) => {
                            const acc = cuentas.find(c => String(c.id_cuenta) === p.id_cuenta);
                            const accCurrency = acc?.moneda || 'USD';
                            const isRowUSD = accCurrency === 'USD';
                            
                            return (
                                <div key={idx} className="relative p-3 bg-muted/20 border border-border/80 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                                    {/* Botón Eliminar */}
                                    {pagos.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={() => removePago(idx)}
                                            className="absolute top-2 right-2 p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-colors z-10"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    
                                    <div className="grid grid-cols-12 gap-2 lg:gap-3">
                                        {/* Cuenta */}
                                        <div className="space-y-1 col-span-12 sm:col-span-7">
                                            <label className="text-[10px] font-bold text-muted-foreground">Cuenta Destino</label>
                                            <select 
                                                className="w-full h-9 border border-border rounded-md px-3 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-semibold"
                                                value={p.id_cuenta}
                                                onChange={(e) => updatePago(idx, 'id_cuenta', e.target.value)}
                                            >
                                                <option value="" disabled>Seleccione Cuenta</option>
                                                {cuentas.map((c: any) => (
                                                    <option key={c.id_cuenta} value={c.id_cuenta}>
                                                        {c.nombre} ({c.moneda}){c.es_cashea ? ' - [Cashea]' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Método */}
                                        <div className="space-y-1 col-span-12 sm:col-span-5">
                                            <label className="text-[10px] font-bold text-muted-foreground">Método *</label>
                                            <select 
                                                className="w-full h-9 border border-border rounded-md px-3 text-xs bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                value={p.metodo}
                                                onChange={(e) => updatePago(idx, 'metodo', e.target.value)}
                                            >
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Pago Móvil">Pago Móvil</option>
                                                <option value="Zelle">Zelle</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Cashea">Cashea</option>
                                            </select>
                                        </div>
                                        
                                        {/* Referencia */}
                                        <div className="space-y-1 col-span-12 sm:col-span-6">
                                            <label className="text-[10px] font-bold text-muted-foreground">Referencia</label>
                                            <Input 
                                                className="h-9 bg-background border-border text-foreground text-xs focus-visible:ring-primary" 
                                                placeholder="Ref / Transacción" 
                                                value={p.referencia}
                                                onChange={(e) => updatePago(idx, 'referencia', e.target.value)}
                                            />
                                        </div>

                                        {/* Monto USD */}
                                        <div className="space-y-1 col-span-12 sm:col-span-6">
                                            <label className="text-[10px] font-bold text-muted-foreground">Monto (USD)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input 
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    className="pl-6 h-9 bg-background border-border text-foreground text-xs focus-visible:ring-primary font-black" 
                                                    placeholder="0.00" 
                                                    value={p.monto_usd}
                                                    onChange={(e) => updatePago(idx, 'monto_usd', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Monto Real (moneda local) si no es USD */}
                                        {!isRowUSD && (
                                            <div className="space-y-1 col-span-6 sm:col-span-6">
                                                <label className="text-[10px] font-bold text-primary">Monto ({accCurrency})</label>
                                                <Input 
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    className="h-9 bg-background border-primary/20 text-primary font-black text-xs focus-visible:ring-primary" 
                                                    placeholder="0.00" 
                                                    value={p.monto_real}
                                                    onChange={(e) => updatePago(idx, 'monto_real', e.target.value)}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Tasa de Cambio si no es USD */}
                                        {!isRowUSD && (
                                            <div className="space-y-1 col-span-6 sm:col-span-6">
                                                <label className="text-[10px] font-bold text-primary">Tasa Cambio ({accCurrency}/$)</label>
                                                <Input 
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    className="h-9 bg-background border-primary/20 text-foreground text-xs focus-visible:ring-primary font-semibold" 
                                                    placeholder="Tasa" 
                                                    value={p.tasa_cambio}
                                                    onChange={(e) => updatePago(idx, 'tasa_cambio', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isOnlyVesPayment && incrementoPct > 0 && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-[10px] font-bold text-amber-500 animate-in fade-in duration-300">
                            <AlertTriangle className="h-4 w-4 animate-pulse flex-shrink-0" />
                            <span>Venta en Bs: Recargo del {incrementoPct}% aplicado al total en Bolívares (El subtotal en USD refleja el precio base real).</span>
                        </div>
                    )}

                    {/* Desglose de Totales */}
                    <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1.5 text-xs text-foreground font-inter">
                        <div className="flex justify-between font-medium">
                            <span className="text-muted-foreground">Total Venta:</span>
                            <span className="font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                            <span className="text-muted-foreground">Total Registrado:</span>
                            <span className="font-bold text-primary">
                                ${pagos.reduce((acc, p) => acc + parseFloat(p.monto_usd || '0'), 0).toFixed(2)}
                            </span>
                        </div>
                        {(() => {
                            const paid = pagos.reduce((acc, p) => acc + parseFloat(p.monto_usd || '0'), 0);
                            const diff = subtotal - paid;
                            if (Math.abs(diff) < 0.01) {
                                return (
                                    <div className="flex justify-between font-bold text-green-600 bg-green-500/10 p-1.5 rounded mt-1 text-[11px] items-center">
                                        <span>Pago Completado</span>
                                        <span>$0.00 restante</span>
                                    </div>
                                );
                            } else if (diff > 0) {
                                return (
                                    <div className="flex justify-between font-bold text-amber-600 bg-amber-500/10 p-1.5 rounded mt-1 text-[11px] items-center">
                                        <span>Restante:</span>
                                        <span>${diff.toFixed(2)}</span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="flex justify-between font-bold text-red-600 bg-red-500/10 p-1.5 rounded mt-1 text-[11px] items-center">
                                        <span>Exceso:</span>
                                        <span>${Math.abs(diff).toFixed(2)}</span>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>

                <Button 
                    className="w-full h-12 lg:h-14 mt-4 lg:mt-6 bg-green-600 hover:bg-green-500 text-white font-bold gap-2 lg:gap-3 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center uppercase tracking-wider text-xs lg:text-sm active:scale-95 transition-all flex-shrink-0"
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
    );

    const renderSidebarContent = () => (
        <>
            <div className="flex flex-col">
                {renderCarritoCard()}
            </div>
            <div className="flex flex-col">
                {renderDatosVentaCard()}
            </div>
        </>
    );

    const renderVariantSelectorDialog = () => {
        if (!selectedProductForVariants) return null;

        return (
            <Dialog 
                open={!!selectedProductForVariants} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedProductForVariants(null);
                        setVariantsForSelectedProduct([]);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px] bg-card border border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Seleccionar Variante
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                            <h3 className="font-bold text-foreground text-sm">{selectedProductForVariants.rawNombre || selectedProductForVariants.nombre}</h3>
                            <p className="text-xs text-muted-foreground/80 mt-1">Marca: {selectedProductForVariants.displayBrand} | Ref: REF-{selectedProductForVariants.id_producto}</p>
                        </div>

                        {loadingVariants ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Cargando variantes y stock...</span>
                            </div>
                        ) : variantsForSelectedProduct.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                No se encontraron variantes activas para este producto.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {variantsForSelectedProduct.map((variant) => {
                                    const attrs = variant.atributos_json || {};
                                    const attrString = formatVariantLabel(attrs) || variant.sku;
                                    const stock = variant.stock_actual ?? 0;
                                    const outOfStock = stock <= 0 || !variant.activo;
                                    const basePrice = Number(variant.precio_lista) || 0;
                                    const priceWithTax = isOnlyVesPayment && incrementoPct > 0
                                        ? +(basePrice * (1 + (incrementoPct / 100))).toFixed(2)
                                        : basePrice;

                                    return (
                                        <div 
                                            key={variant.id_variante_producto}
                                            className={`p-3 border rounded-xl flex justify-between items-center transition-all bg-card/40 hover:border-primary/30 ${
                                                outOfStock ? 'opacity-50 bg-muted/20' : ''
                                            }`}
                                        >
                                            <div className="flex flex-col min-w-0 flex-1 mr-4">
                                                <span className="font-bold text-sm truncate text-foreground">{attrString}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-black text-primary text-xs">${priceWithTax.toFixed(2)}</span>
                                                    <Badge variant={stock > 0 ? "outline" : "destructive"} className={`text-[10px] py-0.5 px-1.5 ${
                                                        stock > 0 ? 'text-green-600 border-green-500/20 bg-green-500/5' : 'text-red-600 bg-red-500/5'
                                                    }`}>
                                                        {stock > 0 ? `${stock} disp.` : 'Agotado'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <Button 
                                                size="sm"
                                                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-3 py-1.5 h-8 text-xs gap-1 rounded-lg"
                                                disabled={outOfStock}
                                                onClick={() => {
                                                    addVariantToCart(selectedProductForVariants, variant, 1);
                                                    setSuccess(`¡${selectedProductForVariants.rawNombre || selectedProductForVariants.nombre} (${attrString}) agregado!`);
                                                    setSelectedProductForVariants(null);
                                                    setVariantsForSelectedProduct([]);
                                                }}
                                            >
                                                <Plus className="h-3 w-3" /> Agregar
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const userWarehouse = warehouses.find(w => w.id_almacen === currentUser?.id_almacen);
    const warehouseName = userWarehouse ? userWarehouse.nombre : (currentUser?.id_almacen ? `Almacén #${currentUser.id_almacen}` : 'Todas (Admin/Central)');

    return (
        <div className="flex flex-col bg-transparent text-foreground">
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

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] xl:grid-cols-[1.6fr_1fr] 2xl:grid-cols-[2fr_1fr] gap-6 pb-0 lg:pb-6">
                {/* ═══════════════════════ Contenido Principal (Catálogo) ═══════════════════════ */}
                <div className={`flex flex-col gap-3 lg:gap-6 ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Desktop-only title row */}
                    <div className="hidden lg:block flex-shrink-0">
                        <h1 className="text-3xl font-extrabold text-foreground drop-shadow-sm font-outfit">Registrar Venta</h1>
                        <p className="text-sm text-muted-foreground font-medium font-inter">Selecciona variantes del catálogo.</p>
                    </div>

                    {/* Search bar - responsive */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 lg:gap-4 p-3 lg:p-4 bg-card/45 backdrop-blur-md rounded-xl border border-border flex-shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar producto..." 
                                className="pl-10 lg:pl-11 h-10 lg:h-12 bg-background border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.replace(/'/g, '-'))}
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
                    <div className="pb-20 lg:pb-2 pr-0 lg:pr-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-3 lg:gap-6 auto-rows-max">
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
                                            {prod.variantes && prod.variantes.length > 1 ? (
                                                <Button 
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-1.5 lg:py-2.5 rounded-lg flex items-center justify-center gap-1 lg:gap-2 shadow-sm active:scale-95 transition-transform text-[11px] lg:text-sm h-8 lg:h-auto"
                                                    onClick={() => openVariantSelector(prod)}
                                                >
                                                    <LayoutGrid className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> Ver Variantes
                                                </Button>
                                            ) : (
                                                <Button 
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-1.5 lg:py-2.5 rounded-lg flex items-center justify-center gap-1 lg:gap-2 shadow-sm active:scale-95 transition-transform text-[11px] lg:text-sm h-8 lg:h-auto"
                                                    onClick={() => addToCart(prod)}
                                                >
                                                    <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> Agregar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ═══════════════════════ Barra Lateral / Mobile Cart View ═══════════════════════ */}
                {/* Desktop sidebar */}
                <div className="hidden lg:flex flex-col gap-4 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
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
                        {renderCarritoCard()}
                        {renderDatosVentaCard()}
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

            {/* Variant selector dialog popup */}
            {renderVariantSelectorDialog()}
        </div>
    );
};
