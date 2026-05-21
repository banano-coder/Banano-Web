import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Search, ShoppingCart, User, Phone, Mail, Hash, 
    ArrowLeft, ArrowRight, Plus, Minus, CheckCircle, Package, Info, Loader2, LayoutGrid
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
            // 1. Buscamos en el catálogo para tener precios e imágenes
            const catalogUrl = searchTerm 
                ? `${API_ENDPOINTS.CATALOG.PRODUCTS}?q=${searchTerm}&limit=100`
                : `${API_ENDPOINTS.CATALOG.PRODUCTS}?limit=100`;
            
            // 2. Buscamos en el inventario para tener el stock real
            const adminUrl = searchTerm 
                ? `${API_ENDPOINTS.PRODUCTS.LIST}?search=${searchTerm}`
                : API_ENDPOINTS.PRODUCTS.LIST;

            const [catalogRes, adminRes]: any = await Promise.all([
                FetchData<any>(catalogUrl),
                FetchData<any>(adminUrl)
            ]);

            const catalogRaw = catalogRes.data || [];
            const adminRaw = Array.isArray(adminRes) ? adminRes : adminRes.data || [];

            // 3. Fusionamos: El catálogo manda en precio/imagen, el admin manda en stock
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

    return (
        <div className="flex flex-col h-screen bg-[#f8f5f0] overflow-hidden">
            {/* Header Superior */}
            <div className="flex justify-end p-4">
                <Button 
                    variant="ghost" 
                    className="bg-[#c25121] hover:bg-[#a1431b] text-white font-bold px-8 rounded-xl"
                    onClick={() => window.location.href = '/dashboard'}
                >
                    SALIR
                </Button>
            </div>

            <div className="flex flex-1 gap-6 px-6 pb-6 overflow-hidden">
                {/* Contenido Principal */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="rounded-full border-[#d1cdbc] text-[#555]">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-[#2d3a4b] font-gliker">Registrar Venta</h1>
                            <p className="text-sm text-[#7e8c9a] font-medium font-inter">Selecciona variantes del catálogo.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 bg-white/40 rounded-xl border border-[#d1cdbc]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                                placeholder="Buscar producto, SKU, atributo..." 
                                className="pl-11 h-12 bg-white border-[#d1cdbc] text-gray-700"
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
                            <label htmlFor="stock-filter" className="text-sm font-medium text-gray-500 cursor-pointer">
                                Ver sin stock
                            </label>
                        </div>
                    </div>

                    {/* Grid de Productos Estilo "Perfumería" */}
                    <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="bg-white h-[400px] rounded-xl border border-[#d1cdbc] animate-pulse"></div>
                            ))
                        ) : (
                            products.map((prod) => (
                                <div key={prod.id_producto} className="bg-white rounded-xl border border-[#d1cdbc] flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                    {/* Contenedor de Imagen con Altura Forzada */}
                                    <div className="relative h-64 w-full p-4 bg-white border-b border-[#f0eee4] flex items-center justify-center">
                                        <img 
                                            src={prod.displayImage} 
                                            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105" 
                                            alt={prod.nombre} 
                                        />
                                        <Badge className="absolute top-3 right-3 bg-[#f06e1f] text-white border-none text-[11px] font-bold px-2.5 py-1 shadow-sm">
                                            {prod.displayStock} uds
                                        </Badge>
                                    </div>
                                    
                                    {/* Info con Altura Mínima */}
                                    <div className="p-4 flex flex-col flex-1 min-h-[140px]">
                                        <h3 className="font-bold text-[#2d3a4b] text-[13px] line-clamp-2 leading-tight mb-2 h-8">{prod.nombre}</h3>
                                        <div className="space-y-1 mb-4">
                                            <p className="text-[10px] text-[#c25121] font-black uppercase tracking-tight">Marca: {prod.displayBrand}</p>
                                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">REF-{prod.id_producto}</p>
                                        </div>
                                        <div className="mt-auto pt-2 border-t border-[#f0eee4]">
                                            <div className="text-xl font-black text-[#2d3a4b] mb-3">${prod.displayPrice.toFixed(2)}</div>
                                            <Button 
                                                className="w-full bg-[#1e3a5f] hover:bg-[#162c4a] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                                                onClick={() => addToCart(prod)}
                                            >
                                                <Plus className="h-4 w-4" /> Agregar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Barra Lateral Estilo Card */}
                <div className="w-[400px] flex flex-col gap-4 overflow-hidden">
                    {/* Carrito */}
                    <Card className="bg-white border-[#d1cdbc] shadow-sm flex flex-col max-h-[40%]">
                        <CardHeader className="py-4 border-b border-[#f0eee4]">
                            <CardTitle className="text-md flex items-center gap-2 text-[#2d3a4b]">
                                <ShoppingCart className="h-4 w-4" /> Carrito
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-xs text-gray-400">Agrega productos desde el catálogo.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex gap-3 items-center border-b border-[#f0eee4] pb-2">
                                            <img src={item.imagen} className="w-12 h-12 rounded object-contain border" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-[#2d3a4b] truncate">{item.nombre}</p>
                                                <p className="text-[10px] text-[#c25121] font-bold">${item.precio}</p>
                                            </div>
                                            <div className="flex items-center border border-[#d1cdbc] rounded-md overflow-hidden bg-white">
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><Minus className="h-3 w-3"/></Button>
                                                <span className="w-6 text-[10px] text-center font-bold">{item.cantidad}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3 w-3"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Datos Venta */}
                    <Card className="bg-white border-[#d1cdbc] shadow-sm flex-1 flex flex-col overflow-hidden text-[#555]">
                        <CardHeader className="py-4 border-b border-[#f0eee4] bg-[#f8f9fa]">
                            <CardTitle className="text-md flex items-center gap-2 text-[#1e3a5f]">
                                <LayoutGrid className="h-4 w-4" /> Datos de la Venta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500">Cédula</label>
                                    <Input className="h-10 bg-[#f9f9f9] border-[#e0e0e0]" placeholder="V12345678" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500">Nombre</label>
                                    <Input className="h-10 bg-[#f9f9f9] border-[#e0e0e0]" placeholder="Juan Pérez" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500">Email</label>
                                    <Input className="h-10 bg-[#f9f9f9] border-[#e0e0e0]" placeholder="juan@mail.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500">Teléfono</label>
                                    <Input className="h-10 bg-[#f9f9f9] border-[#e0e0e0]" placeholder="584121234567" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500">Método *</label>
                                    <select className="w-full h-10 border-[#e0e0e0] rounded-md px-3 text-xs bg-[#f9f9f9] focus:ring-1 focus:ring-primary outline-none">
                                        <option>Efectivo</option>
                                        <option>Pago Móvil</option>
                                        <option>Zelle</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500">Referencia</label>
                                    <Input className="h-10 bg-[#f9f9f9] border-[#e0e0e0]" placeholder="REF-001" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500">Observación</label>
                                <Input className="h-10 bg-[#f9f9f9] border-[#e0e0e0]" placeholder="Ej: Mostrador" />
                            </div>

                            <Button 
                                className="w-full h-14 mt-6 bg-[#8ba4b3] hover:bg-[#6c8a9c] text-white font-bold gap-3 rounded-xl shadow-lg flex items-center justify-center uppercase tracking-wider"
                                disabled={cart.length === 0}
                            >
                                <CheckCircle className="h-5 w-5" /> Confirmar Venta • ${subtotal.toFixed(2)}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
