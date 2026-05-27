import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { Barcode } from '@/components/Common/Barcode';
import { renderBarcodeSvgHtml } from '@/lib/barcodeHelper';
import { Printer, Search, Tag, Settings, RefreshCw, Layers, AlertTriangle, X } from 'lucide-react';

interface ProductItem {
    id_producto: number;
    nombre: string;
    descripcion?: string;
    categoria_nombre?: string;
    brand_name?: string;
}

interface VariantItem {
    id_variante_producto: number;
    id_producto: number;
    sku: string;
    precio_lista: number;
    costo: number;
    codigo_barras: string | null;
    atributos_json: Record<string, string> | null;
    activo: boolean;
    stock_actual: number;
}

interface SelectedLabel {
    id_variante_producto: number;
    productName: string;
    attributesText: string;
    sku: string;
    barcode: string;
    price: number;
    copies: number;
}

export const LabelGenerator: React.FC = () => {
    // Products and variants lists
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [variants, setVariants] = useState<VariantItem[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    // List of selected labels to print
    const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Configuration Settings
    const [labelWidth, setLabelWidth] = useState<number>(50); // mm
    const [labelHeight, setLabelHeight] = useState<number>(30); // mm
    const [currencySign, setCurrencySign] = useState<string>('$');
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [scale, setScale] = useState<number>(1.0);

    // Load initial products
    const loadProducts = async () => {
        setLoadingProducts(true);
        setError(null);
        try {
            const res = await FetchData<any>(`${API_ENDPOINTS.PRODUCTS.LIST}?limit=150`);
            const list = Array.isArray(res) ? res : res.data || [];
            setProducts(list);
        } catch (e: any) {
            console.error("Error loading products for labels:", e);
            setError(e.message || "Error al cargar la lista de productos.");
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Load variants when product changes
    useEffect(() => {
        if (!selectedProductId) {
            setVariants([]);
            return;
        }
        const loadVariants = async () => {
            setLoadingVariants(true);
            setError(null);
            try {
                const res = await FetchData<any>(API_ENDPOINTS.PRODUCTS.VARIANTS(selectedProductId));
                const list = Array.isArray(res) ? res : res.data || [];
                setVariants(list.filter((v: any) => v.activo));
            } catch (e: any) {
                console.error("Error loading variants for label generator:", e);
                setError(e.message || "Error al cargar las variantes del producto.");
            } finally {
                setLoadingVariants(false);
            }
        };
        loadVariants();
    }, [selectedProductId]);

    // Search and filter products
    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.brand_name && p.brand_name.toLowerCase().includes(productSearch.toLowerCase()))
    );

    // Helpers to get attributes text
    const getAttributesText = (atributos: Record<string, string> | null): string => {
        if (!atributos || Object.keys(atributos).length === 0) return 'Estándar';
        return Object.entries(atributos)
            .map(([key, val]) => {
                const cleanKey = key.trim().toLowerCase();
                if (cleanKey === 'tipo') return val;
                return `${key}: ${val}`;
            })
            .join(' / ');
    };

    const isStandardText = (text: string): boolean => {
        const clean = (text || '').trim().toLowerCase();
        return clean === 'estándar' || clean === 'estandar' || clean === 'tipo: estándar' || clean === 'tipo: estandar';
    };

    // Toggle selecting a variant for label generation
    const handleToggleVariant = (variant: VariantItem, isChecked: boolean) => {
        const prod = products.find(p => Number(p.id_producto) === Number(variant.id_producto));
        const name = prod ? prod.nombre : 'Producto';
        const attributes = getAttributesText(variant.atributos_json);
        
        if (isChecked) {
            // Add to selected list
            const newLabel: SelectedLabel = {
                id_variante_producto: variant.id_variante_producto,
                productName: name,
                attributesText: attributes,
                sku: variant.sku,
                barcode: variant.codigo_barras || variant.sku,
                price: Number(variant.precio_lista) || 0,
                copies: 1
            };
            setSelectedLabels(prev => [...prev, newLabel]);
        } else {
            // Remove from selected list
            setSelectedLabels(prev => prev.filter(item => item.id_variante_producto !== variant.id_variante_producto));
        }
    };

    const handleUpdateCopies = (variantId: number, count: number) => {
        setSelectedLabels(prev => prev.map(item => 
            item.id_variante_producto === variantId 
                ? { ...item, copies: Math.max(1, count) }
                : item
        ));
    };

    const handleUpdatePrice = (variantId: number, price: number) => {
        setSelectedLabels(prev => prev.map(item => 
            item.id_variante_producto === variantId 
                ? { ...item, price: Math.max(0, price) }
                : item
        ));
    };

    const handleRemoveSelected = (variantId: number) => {
        setSelectedLabels(prev => prev.filter(item => item.id_variante_producto !== variantId));
    };

    // Calculation formulas

    const handlePrint = () => {
        setError(null);
        if (selectedLabels.length === 0) {
            setError("Seleccione al menos una etiqueta para imprimir.");
            return;
        }

        const physicalOrientation = labelWidth >= labelHeight ? 'landscape' : 'portrait';
        const autoScale = Math.min(labelWidth, labelHeight) / Math.max(labelWidth, labelHeight);
        const effectiveScale = orientation === 'horizontal' ? scale : scale * autoScale;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setError("No se pudo abrir la ventana de impresión. Por favor habilite las ventanas emergentes (popups).");
            return;
        }

        const labelsHtml = selectedLabels.flatMap(item => {
            const barcodeHtml = renderBarcodeSvgHtml(item.barcode);
            const titleFull = isStandardText(item.attributesText) 
                ? item.productName 
                : `${item.productName} (${item.attributesText})`;

            const copiesList: string[] = [];
            for (let i = 0; i < item.copies; i++) {
                copiesList.push(`
                    <div class="label-page ${orientation}">
                        <div class="label-wrapper">
                            <div class="label-header">
                                <img src="/logo_original.png" class="shop-logo" />
                                <span class="shop-name">BANANO</span>
                            </div>
                            <div class="barcode-container">
                                ${barcodeHtml}
                            </div>
                            <div class="barcode-text">${item.barcode}</div>
                            <div class="product-title" title="${titleFull}">${titleFull}</div>
                            <div class="price-display">
                                <span class="price-label">PRECIO:</span>
                                <span class="price-amount">${currencySign}${item.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                `);
            }
            return copiesList;
        }).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir Etiquetas</title>
                    <style>
                        @page {
                            size: ${labelWidth}mm ${labelHeight}mm ${physicalOrientation};
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                            line-height: 1.1;
                            -webkit-print-color-adjust: exact;
                        }
                        .label-page {
                            width: ${labelWidth}mm;
                            height: ${labelHeight}mm;
                            box-sizing: border-box;
                            background: white;
                            color: black;
                            overflow: hidden;
                            page-break-after: always;
                            position: relative;
                        }
                        .label-wrapper {
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            width: ${labelWidth}mm;
                            height: ${labelHeight}mm;
                            display: flex;
                            box-sizing: border-box;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            padding: 1mm 1.5mm;
                        }
                        
                        /* VERTICAL LAYOUT (ROTATED STACKED) */
                        .label-page.vertical .label-wrapper {
                            transform: translate(-50%, -50%) rotate(-90deg) scale(${effectiveScale});
                            transform-origin: center center;
                        }
                        
                        /* HORIZONTAL LAYOUT */
                        .label-page.horizontal .label-wrapper {
                            transform: translate(-50%, -50%) scale(${effectiveScale});
                            transform-origin: center center;
                        }
                        
                        .label-header {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 0.8mm;
                            height: 3.5mm;
                            margin-bottom: 1.2mm;
                        }
                        .shop-logo {
                            height: 3.5mm;
                            width: auto;
                            object-fit: contain;
                        }
                        .shop-name {
                            font-size: 5px;
                            font-weight: 900;
                            letter-spacing: 0.2px;
                        }
                        .barcode-container {
                            width: 100%;
                            height: 9mm;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .barcode-container svg {
                            max-width: 95%;
                            height: 100%;
                        }
                        .barcode-text {
                            font-size: 6px;
                            font-weight: bold;
                            letter-spacing: 1.2px;
                            margin-top: 0.5mm;
                            margin-bottom: 1.2mm;
                        }
                        .product-title {
                            font-size: 6.5px;
                            font-weight: bold;
                            text-transform: uppercase;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 100%;
                            margin-bottom: 1.5mm;
                            line-height: 1.2;
                        }
                        .price-display {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 1.5mm;
                            width: 85%;
                            border-top: 0.2mm dashed #ccc;
                            padding-top: 1mm;
                        }
                        .price-label {
                            font-size: 5px;
                            color: #666;
                            font-weight: bold;
                        }
                        .price-amount {
                            font-size: 11px;
                            font-weight: 900;
                            color: black;
                        }
                    </style>
                </head>
                <body>
                    ${labelsHtml}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {error && (
                <div className="col-span-full bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 animate-pulse flex-shrink-0" />
                        <span className="text-xs font-semibold">{error}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 text-red-500 hover:bg-red-500/10 flex-shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            
            {/* ════════════════ Column 1: Config & Selectors ════════════════ */}
            <div className="space-y-6 xl:col-span-2">
                <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-foreground font-bold">
                            <Tag className="h-5 w-5 text-primary" /> Generador de Etiquetas
                        </CardTitle>
                        <CardDescription>
                            Seleccione un producto para ver sus variantes y agregarlas a la cola de impresión de etiquetas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search & Select Product */}
                        <div className="space-y-2">
                            <Label htmlFor="search-product" className="font-semibold text-foreground/80">Buscar Producto</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="search-product"
                                    type="text"
                                    placeholder="Nombre, marca o categoría del producto..."
                                    className="pl-10 bg-background border-border text-foreground"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="select-product" className="font-semibold text-foreground/80">Seleccionar Producto ({filteredProducts.length})</Label>
                                <select 
                                    id="select-product"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">-- Elija un producto --</option>
                                    {filteredProducts.map(p => (
                                        <option key={p.id_producto} value={p.id_producto}>
                                            {p.nombre} {p.brand_name ? `(${p.brand_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button variant="outline" onClick={loadProducts} className="w-full flex gap-2 h-10" disabled={loadingProducts}>
                                    <RefreshCw className={`h-4 w-4 ${loadingProducts ? 'animate-spin' : ''}`} /> Actualizar Productos
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Variants Table Card */}
                {selectedProductId && (
                    <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-foreground">Variantes Disponibles</CardTitle>
                            <CardDescription>
                                Marque las variantes de las cuales desea imprimir etiquetas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingVariants ? (
                                <div className="text-center py-10 text-muted-foreground animate-pulse font-medium">Cargando variantes...</div>
                            ) : variants.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground font-medium">Este producto no contiene variantes activas.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="w-12 text-center"></TableHead>
                                            <TableHead className="text-foreground/90 font-bold">Variante</TableHead>
                                            <TableHead className="text-foreground/90 font-bold">Código Barras</TableHead>
                                            <TableHead className="text-foreground/90 font-bold">SKU</TableHead>
                                            <TableHead className="text-foreground/90 font-bold text-right">Precio</TableHead>
                                            <TableHead className="text-foreground/90 font-bold text-center">Stock</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {variants.map(v => {
                                            const isSelected = selectedLabels.some(item => item.id_variante_producto === v.id_variante_producto);
                                            return (
                                                <TableRow key={v.id_variante_producto} className="border-border hover:bg-muted/50">
                                                    <TableCell className="text-center">
                                                        <Checkbox 
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleToggleVariant(v, !!checked)}
                                                            className="border-border text-primary focus-visible:ring-primary"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium text-foreground">{getAttributesText(v.atributos_json)}</TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{v.codigo_barras || <span className="italic text-orange-400">Usa SKU</span>}</TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{v.sku}</TableCell>
                                                    <TableCell className="text-right text-foreground font-semibold">{currencySign}{v.precio_lista}</TableCell>
                                                    <TableCell className="text-center text-foreground">{v.stock_actual}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Queue Table Card */}
                {selectedLabels.length > 0 && (
                    <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-foreground">Cola de Impresión</CardTitle>
                                <CardDescription>
                                    Ajuste los precios y cantidades antes de generar el lote de etiquetas.
                                </CardDescription>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="font-semibold text-xs"
                                onClick={() => setSelectedLabels([])}
                            >
                                Limpiar Todo
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border">
                                        <TableHead className="text-foreground/90 font-bold">Producto/Variante</TableHead>
                                        <TableHead className="text-foreground/90 font-bold">Código Barras</TableHead>
                                        <TableHead className="text-foreground/90 font-bold w-24 text-right">Precio</TableHead>
                                        <TableHead className="text-foreground/90 font-bold w-24 text-center">Etiquetas</TableHead>
                                        <TableHead className="w-12 text-center"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedLabels.map(item => (
                                        <TableRow key={item.id_variante_producto} className="border-border hover:bg-muted/50">
                                            <TableCell className="text-foreground">
                                                <div className="font-bold text-sm">{item.productName}</div>
                                                <div className="text-xs text-muted-foreground">{item.attributesText}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{item.barcode}</TableCell>
                                            <TableCell className="text-right">
                                                <Input 
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => handleUpdatePrice(item.id_variante_producto, parseFloat(e.target.value))}
                                                    className="w-20 text-right bg-background border-border text-foreground h-8 font-semibold"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Input 
                                                    type="number"
                                                    min="1"
                                                    value={item.copies}
                                                    onChange={(e) => handleUpdateCopies(item.id_variante_producto, parseInt(e.target.value, 10))}
                                                    className="w-16 text-center bg-background border-border text-foreground h-8 font-semibold mx-auto"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRemoveSelected(item.id_variante_producto)}
                                                >
                                                    &times;
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ════════════════ Column 2: Configurations & Live Preview ════════════════ */}
            <div className="space-y-6">
                <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm sticky top-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-foreground font-bold">
                            <Settings className="h-5 w-5 text-primary" /> Configuración de Impresión
                        </CardTitle>
                        <CardDescription>
                            Ajuste el formato y las dimensiones físicas de sus etiquetas adhesivas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="width-input">Ancho (mm)</Label>
                                <Input 
                                    id="width-input"
                                    type="number"
                                    className="bg-background border-border text-foreground font-medium"
                                    value={labelWidth}
                                    onChange={(e) => setLabelWidth(Math.max(10, parseInt(e.target.value, 10) || 50))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height-input">Alto (mm)</Label>
                                <Input 
                                    id="height-input"
                                    type="number"
                                    className="bg-background border-border text-foreground font-medium"
                                    value={labelHeight}
                                    onChange={(e) => setLabelHeight(Math.max(10, parseInt(e.target.value, 10) || 30))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="orientation-select">Orientación</Label>
                                <select 
                                    id="orientation-select"
                                    value={orientation}
                                    onChange={(e) => setOrientation(e.target.value as 'horizontal' | 'vertical')}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="horizontal">Horizontal (Apaisado)</option>
                                    <option value="vertical">Vertical (Retrato)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="curr-input">Símbolo Divisa</Label>
                                <Input 
                                    id="curr-input"
                                    className="bg-background border-border text-foreground font-medium"
                                    value={currencySign}
                                    onChange={(e) => setCurrencySign(e.target.value || '$')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="scale-slider">Escala / Tamaño de Impresión</Label>
                                <span className="text-xs font-bold text-primary">{(scale * 100).toFixed(0)}%</span>
                            </div>
                            <input 
                                id="scale-slider"
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                Deslice para escalar todos los elementos internos y adaptarlos a su papel de etiquetas.
                            </p>
                        </div>

                        {/* Print Button */}
                        <Button 
                            onClick={handlePrint}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
                            disabled={selectedLabels.length === 0}
                        >
                            <Printer className="h-5 w-5" /> Imprimir Lote ({selectedLabels.reduce((acc, item) => acc + item.copies, 0)})
                        </Button>
                    </CardContent>
                </Card>

                {/* Live Preview Card */}
                {selectedLabels.length > 0 && (
                    <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Layers className="h-4 w-4 text-primary" /> Vista Previa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center p-4 bg-muted/30 rounded-b-xl">
                            {/* Render first selected label as a preview */}
                            {(() => {
                                const previewItem = selectedLabels[0];
                                const titleFull = isStandardText(previewItem.attributesText)
                                    ? previewItem.productName
                                    : `${previewItem.productName} (${previewItem.attributesText})`;
                                return (
                                    <div 
                                        className="border border-border/70 rounded bg-white text-black shadow-lg relative overflow-hidden select-none"
                                        style={{ 
                                            width: `${labelWidth * 5}px`, // Always match physical dimensions
                                            height: `${labelHeight * 5}px`, 
                                            fontFamily: 'Arial, sans-serif'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: '50%',
                                                width: `${labelWidth * 5}px`,
                                                height: `${labelHeight * 5}px`,
                                                transform: orientation === 'horizontal' 
                                                    ? `translate(-50%, -50%) scale(${scale})` 
                                                    : `translate(-50%, -50%) rotate(-90deg) scale(${scale * (Math.min(labelWidth, labelHeight) / Math.max(labelWidth, labelHeight))})`,
                                                transformOrigin: 'center center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxSizing: 'border-box',
                                                padding: '5px 7.5px'
                                            }}
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-center gap-1 w-full h-[12%] shrink-0 mb-1">
                                                <img src="/logo_original.png" alt="Logo" className="h-[90%] w-auto object-contain" />
                                                <span className="text-[7px] font-black tracking-wider text-black leading-none">
                                                    BANANO
                                                </span>
                                            </div>
                                            {/* Barcode svg */}
                                            <div className="w-full h-[32%] flex justify-center items-center shrink-0">
                                                <Barcode value={previewItem.barcode} height={26} width={130} />
                                            </div>
                                            {/* Barcode Value */}
                                            <div className="text-[7px] font-bold text-center font-mono mt-0.5 mb-1 leading-none tracking-wider">
                                                {previewItem.barcode}
                                            </div>
                                            {/* Product Title */}
                                            <div className="text-[8px] font-extrabold uppercase text-center truncate w-full mb-1 leading-none text-black">
                                                {titleFull}
                                            </div>
                                            {/* Prices block */}
                                            <div className="w-[85%] mt-1.5 border-t border-dashed border-gray-300 pt-1 flex justify-center items-center gap-2 font-bold">
                                                <span className="text-[6px] font-bold text-gray-500">PRECIO:</span>
                                                <span className="text-[11px] font-black text-black leading-none">
                                                    {currencySign}{previewItem.price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                )}
            </div>

        </div>
    );
};
