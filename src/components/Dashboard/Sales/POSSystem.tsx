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

    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    // Metadata for brand mapping
    const [brands, setBrands] = useState<any[]>([]);

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

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const catalogUrl = searchTerm 
                ? `${API_ENDPOINTS.CATALOG.PRODUCTS}?q=${searchTerm}&limit=100`
                : `${API_ENDPOINTS.CATALOG.PRODUCTS}?limit=100`;
            
            const adminUrl = searchTerm 
                ? `${API_ENDPOINTS.PRODUCTS.LIST}?search=${searchTerm}`
                : API_ENDPOINTS.PRODUCTS.LIST;

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
                    displayStock: adminMatch?.total_stock !== undefined ? adminMatch.total_stock : (p.stock || 0)
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
        const existing = cart.find(item => item.id === product.id_producto);
        if (existing) {
            setCart(cart.map(item => 
                item.id === product.id_producto 
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            ));
        } else {
            setCart([...cart, {
                id: product.id_producto,
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
    const SidebarContent = () => (
        <>
            {/* Carrito */}
            <Card className="bg-white border-[#d1cdbc] shadow-sm flex flex-col max-h-[45%] lg:max-h-[40%]">
                <CardHeader className="py-3 lg:py-4 border-b border-[#f0eee4]">
                    <CardTitle className="text-sm lg:text-md flex items-center gap-2 text-[#2d3a4b]">
                        <ShoppingCart className="h-4 w-4" /> Carrito
                        {totalItems > 0 && (
                            <Badge className="ml-auto bg-[#f06e1f] text-white border-none text-[10px] font-bold">
                                {totalItems} items
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-3 lg:p-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-8">
                            <div className="text-center space-y-2">
                                <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400">Agrega productos desde el catálogo.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 lg:space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-2 lg:gap-3 items-center border-b border-[#f0eee4] pb-2">
                                    <img src={item.imagen} className="w-10 h-10 lg:w-12 lg:h-12 rounded object-contain border flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] lg:text-xs font-bold text-[#2d3a4b] truncate">{item.nombre}</p>
                                        <p className="text-[10px] text-[#c25121] font-bold">${item.precio}</p>
                                    </div>
                                    <div className="flex items-center border border-[#d1cdbc] rounded-md overflow-hidden bg-white flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6" onClick={() => updateQuantity(item.id, -1)}>
                                            <Minus className="h-3 w-3"/>
                                        </Button>
                                        <span className="w-6 text-[10px] text-center font-bold">{item.cantidad}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6" onClick={() => updateQuantity(item.id, 1)}>
                                            <Plus className="h-3 w-3"/>
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 flex-shrink-0 lg:hidden" onClick={() => removeFromCart(item.id)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Datos Venta */}
            <Card className="bg-white border-[#d1cdbc] shadow-sm flex-1 flex flex-col overflow-hidden text-[#555]">
                <CardHeader className="py-3 lg:py-4 border-b border-[#f0eee4] bg-[#f8f9fa]">
                    <CardTitle className="text-sm lg:text-md flex items-center gap-2 text-[#1e3a5f]">
                        <LayoutGrid className="h-4 w-4" /> Datos de la Venta
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Cédula</label>
                            <Input className="h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm" placeholder="V12345678" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Nombre</label>
                            <Input className="h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm" placeholder="Juan Pérez" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Email</label>
                            <Input className="h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm" placeholder="juan@mail.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Teléfono</label>
                            <Input className="h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm" placeholder="584121234567" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Método *</label>
                            <select className="w-full h-9 lg:h-10 border border-[#e0e0e0] rounded-md px-3 text-xs bg-[#f9f9f9] focus:ring-1 focus:ring-primary outline-none">
                                <option>Efectivo</option>
                                <option>Pago Móvil</option>
                                <option>Zelle</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">Referencia</label>
                            <Input className="h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm" placeholder="REF-001" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">Observación</label>
                        <Input className="h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm" placeholder="Ej: Mostrador" />
                    </div>

                    <Button 
                        className="w-full h-12 lg:h-14 mt-4 lg:mt-6 bg-[#8ba4b3] hover:bg-[#6c8a9c] text-white font-bold gap-2 lg:gap-3 rounded-xl shadow-lg flex items-center justify-center uppercase tracking-wider text-xs lg:text-sm"
                        disabled={cart.length === 0}
                    >
                        <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" /> Confirmar Venta • ${subtotal.toFixed(2)}
                    </Button>
                </CardContent>
            </Card>
        </>
    );

    return (
        <div className="flex flex-col h-screen bg-[#f8f5f0] overflow-hidden">
            {/* Header Superior */}
            <div className="flex items-center justify-between p-3 lg:p-4">
                {/* Mobile: compact title in header */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Button variant="outline" size="icon" className="rounded-full border-[#d1cdbc] text-[#555] h-8 w-8" onClick={() => window.location.href = '/dashboard'}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-lg font-bold text-[#2d3a4b] font-gliker">Venta POS</h1>
                </div>
                <Button 
                    variant="ghost" 
                    className="bg-[#c25121] hover:bg-[#a1431b] text-white font-bold px-4 lg:px-8 rounded-xl text-xs lg:text-sm h-9 lg:h-10 ml-auto"
                    onClick={() => window.location.href = '/dashboard'}
                >
                    SALIR
                </Button>
            </div>

            <div className="flex flex-1 gap-0 lg:gap-6 px-3 lg:px-6 pb-0 lg:pb-6 overflow-hidden">
                {/* ═══════════════════════ Contenido Principal (Catálogo) ═══════════════════════ */}
                <div className={`flex-1 flex flex-col gap-3 lg:gap-6 overflow-hidden ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Desktop-only title row */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Button variant="outline" size="icon" className="rounded-full border-[#d1cdbc] text-[#555]">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-[#2d3a4b] font-gliker">Registrar Venta</h1>
                            <p className="text-sm text-[#7e8c9a] font-medium font-inter">Selecciona variantes del catálogo.</p>
                        </div>
                    </div>

                    {/* Search bar - responsive */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 lg:gap-4 p-3 lg:p-4 bg-white/40 rounded-xl border border-[#d1cdbc]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                            <Input 
                                placeholder="Buscar producto..." 
                                className="pl-10 lg:pl-11 h-10 lg:h-12 bg-white border-[#d1cdbc] text-gray-700 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                             <Checkbox 
                                id="stock-filter" 
                                checked={showOutOfStock}
                                onCheckedChange={(val) => setShowOutOfStock(!!val)}
                            />
                            <label htmlFor="stock-filter" className="text-xs lg:text-sm font-medium text-gray-500 cursor-pointer whitespace-nowrap">
                                Ver sin stock
                            </label>
                        </div>
                    </div>

                    {/* Grid de Productos — responsive columns */}
                    <div className="flex-1 overflow-y-auto pb-20 lg:pb-2 pr-0 lg:pr-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-6 auto-rows-max">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-white h-[240px] lg:h-[400px] rounded-xl border border-[#d1cdbc] animate-pulse"></div>
                            ))
                        ) : (
                            products.map((prod) => (
                                <div key={prod.id_producto} className="bg-white rounded-xl border border-[#d1cdbc] flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                    {/* Image container — responsive height */}
                                    <div className="relative h-32 sm:h-40 lg:h-64 w-full p-2 lg:p-4 bg-white border-b border-[#f0eee4] flex items-center justify-center">
                                        <img 
                                            src={prod.displayImage} 
                                            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105" 
                                            alt={prod.nombre} 
                                        />
                                        <Badge className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-[#f06e1f] text-white border-none text-[9px] lg:text-[11px] font-bold px-1.5 lg:px-2.5 py-0.5 lg:py-1 shadow-sm">
                                            {prod.displayStock} uds
                                        </Badge>
                                    </div>
                                    
                                    {/* Product info — responsive sizes */}
                                    <div className="p-2.5 lg:p-4 flex flex-col flex-1 min-h-[100px] lg:min-h-[140px]">
                                        <h3 className="font-bold text-[#2d3a4b] text-[11px] lg:text-[13px] line-clamp-2 leading-tight mb-1 lg:mb-2">{prod.nombre}</h3>
                                        <div className="space-y-0.5 lg:space-y-1 mb-2 lg:mb-4">
                                            <p className="text-[9px] lg:text-[10px] text-[#c25121] font-black uppercase tracking-tight truncate">Marca: {prod.displayBrand}</p>
                                            <p className="text-[9px] lg:text-[10px] text-gray-400 font-mono tracking-tighter">REF-{prod.id_producto}</p>
                                        </div>
                                        <div className="mt-auto pt-1.5 lg:pt-2 border-t border-[#f0eee4]">
                                            <div className="text-base lg:text-xl font-black text-[#2d3a4b] mb-1.5 lg:mb-3">${prod.displayPrice.toFixed(2)}</div>
                                            <Button 
                                                className="w-full bg-[#1e3a5f] hover:bg-[#162c4a] text-white font-bold py-1.5 lg:py-2.5 rounded-lg flex items-center justify-center gap-1 lg:gap-2 shadow-sm active:scale-95 transition-transform text-[11px] lg:text-sm h-8 lg:h-auto"
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
                    <SidebarContent />
                </div>

                {/* Mobile cart/form view */}
                <div className={`flex-1 flex flex-col gap-3 overflow-hidden lg:hidden ${mobileView === 'catalog' ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="outline" size="sm" className="rounded-lg border-[#d1cdbc] text-[#555] h-8 text-xs gap-1" onClick={() => setMobileView('catalog')}>
                            <ArrowLeft className="h-3.5 w-3.5" /> Catálogo
                        </Button>
                        <h2 className="text-base font-bold text-[#2d3a4b] font-gliker">Carrito & Venta</h2>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
                        <SidebarContent />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════ Mobile Bottom Navigation Bar ═══════════════════════ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#d1cdbc] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
                <div className="flex items-center h-16">
                    <button
                        onClick={() => setMobileView('catalog')}
                        className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
                            mobileView === 'catalog' 
                                ? 'text-[#1e3a5f] bg-[#1e3a5f]/5' 
                                : 'text-gray-400'
                        }`}
                    >
                        <Package className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Catálogo</span>
                    </button>
                    <button
                        onClick={() => setMobileView('cart')}
                        className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors relative ${
                            mobileView === 'cart' 
                                ? 'text-[#1e3a5f] bg-[#1e3a5f]/5' 
                                : 'text-gray-400'
                        }`}
                    >
                        <div className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-3 bg-[#f06e1f] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-200">
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
                            className="flex-1 flex flex-col items-center justify-center h-full gap-0.5 bg-[#1e3a5f] text-white"
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
