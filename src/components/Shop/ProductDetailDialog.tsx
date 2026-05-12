import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { addCartItem } from '@/store/cartStore';
import { ShoppingCart, Check, X, Minus, Plus } from 'lucide-react';
import type { Product, Variant } from '@/types';

interface ProductDetailDialogProps {
    productId?: number;
    isOpen: boolean;
    onClose: () => void;
    settings?: any;
}

export const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ productId, isOpen, onClose, settings }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Multi-variant state: INDEX -> quantity (safest against duplicate IDs)
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    // Fallback for no-variant products
    const [simpleQuantity, setSimpleQuantity] = useState(1);

    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        if (isOpen && productId) {
            fetchDetails();
        } else {
            setProduct(null);
            setVariants([]);
            setImages([]);
            setQuantities({});
            setSimpleQuantity(1);
        }
    }, [isOpen, productId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await FetchData<any>(`${API_ENDPOINTS.CATALOG.PRODUCTS}/${productId}`);
            setProduct(data);
            setVariants(data.variantes || []);
            setImages(data.imagenes || []);
            if (data.imagenes?.length > 0) setMainImage(data.imagenes[0]);

            // Initialize quantities for variants
            if (data.variantes?.length > 0) {
                const initialQty: Record<number, number> = {};
                // Key by index to guarantee uniqueness
                data.variantes.forEach((_: any, idx: number) => initialQty[idx] = 0);
                setQuantities(initialQty);
            }

        } catch (error) {
            console.error("Failed to fetch product details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = (index: number, delta: number, maxStock: number) => {
        setQuantities(prev => {
            const current = prev[index] || 0;
            const next = current + delta;
            if (next < 0) return prev; // Cannot go below 0
            if (next > maxStock) return prev;
            return { ...prev, [index]: next };
        });
    };

    const handleSimpleQuantityChange = (delta: number) => {
        if (!product) return;
        setSimpleQuantity(prev => {
            const next = prev + delta;
            if (next < 1) return 1;
            // Assuming simple products have infinite or untracked stock for now if not in variant
            // If product has global stock, we could check it here.
            return next;
        });
    };

    const calculateTotal = () => {
        if (!product) return 0;
        if (variants.length === 0) {
            return product.precio * simpleQuantity;
        }
        return variants.reduce((acc, v, idx) => {
            const qty = quantities[idx] || 0;
            return acc + (v.precio_lista * qty);
        }, 0);
    };

    const getTotalItems = () => {
        if (variants.length === 0) return simpleQuantity;
        return Object.values(quantities).reduce((a, b) => a + b, 0);
    };

    const handleAddToCart = () => {
        if (!product) return;

        if (variants.length > 0) {
            let added = false;
            variants.forEach((variant, idx) => {
                const qty = quantities[idx];
                if (qty > 0) {
                    const price = variant.precio_lista;
                    const stock = (variant as any).stock;

                    // Format name with variant attributes
                    const variantAttrs = variant.atributos_json
                        ? Object.entries(variant.atributos_json).map(([k, v]) => `${v}`).join(', ')
                        : '';

                    const cartItemName = variantAttrs
                        ? `${product.nombre} (${variantAttrs})`
                        : product.nombre;

                    addCartItem({
                        id: String(product.id_producto),
                        variantId: variant.id_variante_producto || (variant as any).id,
                        name: cartItemName,
                        image: mainImage || (product as any).image || 'https://placehold.co/400',
                        price: Number(price),
                        maxStock: Number(stock),
                        sku: variant.sku,
                        attributes: variant.atributos_json
                    }, qty);
                    added = true;
                }
            });

            if (!added) {
                alert("Por favor selecciona al menos una cantidad a agregar.");
                return;
            }
        } else {
            // Simple Product (or no variants found)
            const firstVariant = variants[0];
            const vId = firstVariant?.id_variante_producto || (firstVariant as any)?.id;

            if (!vId) {
                console.error("ProductDetailDialog: ERROR - No se encontró ID de variante para producto simple", product);
            }

            addCartItem({
                id: String(product.id_producto),
                variantId: vId,
                name: product.nombre,
                image: mainImage || (product as any).image || 'https://placehold.co/400',
                price: Number(product.precio || firstVariant?.precio_lista),
                maxStock: firstVariant ? Number((firstVariant as any).stock) : 999,
                sku: firstVariant?.sku || product?.sku_base || '',
            }, simpleQuantity);
        }
        onClose();
    };

    const getStockLabel = (v: any) => {
        if (!v.activo) return <Badge variant="destructive">No disp.</Badge>;
        if (v.stock <= 0) return <Badge variant="secondary">Agotado</Badge>;

        const mode = settings?.catalogo?.modo_etiqueta_stock || 'exacto';

        if (mode === 'generico') {
            return <Badge variant="outline" className="text-green-600 border-green-600 font-bold tracking-tight">EN STOCK</Badge>;
        }

        return <Badge variant="outline" className="text-green-600 border-green-600 font-normal">{v.stock} Disp.</Badge>;
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                {loading ? (
                    <div className="py-20 text-center">Cargando detalles...</div>
                ) : !product ? (
                    <div className="py-20 text-center">No se encontró el producto.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                <img src={mainImage} alt={product.nombre} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`w-20 h-20 border rounded-md overflow-hidden flex-shrink-0 ${mainImage === img ? 'ring-2 ring-primary' : ''}`}
                                    >
                                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Info & Selectors */}
                        <div className="space-y-6 flex flex-col h-full">
                            <div>
                                <h2 className="text-2xl font-bold">{product.nombre}</h2>
                                <p className="text-muted-foreground mt-2 text-sm">{product.descripcion}</p>
                            </div>

                            {/* Variants Selection */}
                            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
                                {variants.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <h4 className="font-semibold text-sm">Elige tus variantes:</h4>
                                            <span className="text-xs text-muted-foreground">Stock total: {variants.reduce((a, v: any) => a + (v.stock || 0), 0)}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {variants.map((variant, index) => {
                                                const attrs = variant.atributos_json || {};
                                                const attrString = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ') || variant.sku;
                                                const qty = quantities[index] || 0;
                                                const outOfStock = (variant as any).stock <= 0;
                                                const stock = (variant as any).stock || 0;

                                                return (
                                                    <div
                                                        key={variant.id_variante_producto || index}
                                                        className={`
                                                        p-3 border rounded-lg flex justify-between items-center transition-all bg-card
                                                        ${qty > 0 ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-gray-300'}
                                                        ${outOfStock ? 'opacity-60 bg-gray-50' : ''}
                                                    `}
                                                    >
                                                        <div className="flex flex-col min-w-0 flex-1 mr-4">
                                                            <span className="font-medium text-sm truncate">{attrString}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="font-bold text-sm">
                                                                    {(() => {
                                                                        const currency = settings?.catalogo?.simbolo_moneda || '$';
                                                                        const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
                                                                        const formatted = showDecimals
                                                                            ? variant.precio_lista.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                            : Math.round(variant.precio_lista).toLocaleString();
                                                                        return `${currency}${formatted}`;
                                                                    })()}
                                                                </span>
                                                                {getStockLabel(variant)}
                                                            </div>
                                                        </div>

                                                        {/* Individual Quantity Selector */}
                                                        <div className="flex items-center border rounded-md bg-background shadow-sm h-8">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-full w-8 rounded-r-none hover:bg-gray-100"
                                                                onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(index, -1, stock); }}
                                                                disabled={qty <= 0}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <div className="w-8 text-center text-sm font-semibold select-none">{qty}</div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-full w-8 rounded-l-none hover:bg-gray-100"
                                                                onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(index, 1, stock); }}
                                                                disabled={outOfStock || qty >= stock}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm mb-4">
                                            Producto estándar (sin variantes).
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-sm">Cantidad:</span>
                                            <div className="flex items-center border rounded-md">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-r-none"
                                                    onClick={() => handleSimpleQuantityChange(-1)}
                                                    disabled={simpleQuantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <div className="w-10 text-center text-sm font-semibold">{simpleQuantity}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-l-none"
                                                    onClick={() => handleSimpleQuantityChange(1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-4 border-t flex flex-col gap-4 mt-auto">
                                <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-muted-foreground">Total a pagar:</span>
                                        <span className="text-xs text-muted-foreground">{getTotalItems()} productos seleccionados</span>
                                    </div>
                                    <span className="text-2xl font-bold text-primary">
                                        {(() => {
                                            const total = calculateTotal();
                                            const currency = settings?.catalogo?.simbolo_moneda || '$';
                                            const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
                                            const formatted = showDecimals
                                                ? total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                : Math.round(total).toLocaleString();
                                            return `${currency}${formatted}`;
                                        })()}
                                    </span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full text-lg py-6"
                                    onClick={handleAddToCart}
                                    disabled={getTotalItems() === 0}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Agregar al Carrito
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
