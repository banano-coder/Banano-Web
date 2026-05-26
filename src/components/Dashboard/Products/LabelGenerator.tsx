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
import { Printer, Search, Tag, Settings, RefreshCw, Layers } from 'lucide-react';

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

    // Configuration Settings
    const [labelWidth, setLabelWidth] = useState<number>(50); // mm
    const [labelHeight, setLabelHeight] = useState<number>(30); // mm
    const [ivaPercent, setIvaPercent] = useState<number>(0); // %
    const [currencySign, setCurrencySign] = useState<string>('$');

    // Load initial products
    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await FetchData<any>(`${API_ENDPOINTS.PRODUCTS.LIST}?limit=150`);
            const list = Array.isArray(res) ? res : res.data || [];
            setProducts(list);
        } catch (e) {
            console.error("Error loading products for labels:", e);
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
            try {
                const res = await FetchData<any>(API_ENDPOINTS.PRODUCTS.VARIANTS(selectedProductId));
                const list = Array.isArray(res) ? res : res.data || [];
                setVariants(list.filter((v: any) => v.activo));
            } catch (e) {
                console.error("Error loading variants for label generator:", e);
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
            .map(([key, val]) => `${key}: ${val}`)
            .join(' / ');
    };

    // Toggle selecting a variant for label generation
    const handleToggleVariant = (variant: VariantItem, isChecked: boolean) => {
        const prod = products.find(p => p.id_producto === variant.id_producto);
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
    const calculatePrices = (finalPrice: number) => {
        const rate = ivaPercent / 100;
        const base = finalPrice / (1 + rate);
        const iva = finalPrice - base;
        return {
            base,
            iva,
            pmvp: finalPrice
        };
    };

    const handlePrint = () => {
        if (selectedLabels.length === 0) {
            alert("Seleccione al menos una etiqueta para imprimir.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("No se pudo abrir la ventana de impresión. Por favor habilite las ventanas emergentes (popups).");
            return;
        }

        const labelsHtml = selectedLabels.flatMap(item => {
            const { base, iva, pmvp } = calculatePrices(item.price);
            const barcodeHtml = renderBarcodeSvgHtml(item.barcode);
            const titleFull = item.attributesText === 'Estándar' 
                ? item.productName 
                : `${item.productName} (${item.attributesText})`;

            const copiesList = [];
            for (let i = 0; i < item.copies; i++) {
                copiesList.push(`
                    <div class="label-page">
                        <div class="barcode-container">
                            ${barcodeHtml}
                        </div>
                        <div class="barcode-text">${item.barcode}</div>
                        <div class="product-title">${titleFull}</div>
                        
                        <table class="price-table">
                            <tr>
                                <td>Base:</td>
                                <td class="price-val">${currencySign}${base.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>IVA:</td>
                                <td class="price-val">${currencySign}${iva.toFixed(2)}</td>
                            </tr>
                            <tr class="font-bold">
                                <td>PMVP:</td>
                                <td class="price-val">${currencySign}${pmvp.toFixed(2)}</td>
                            </tr>
                        </table>
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
                            size: ${labelWidth}mm ${labelHeight}mm;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                            font-size: 7.5px;
                            line-height: 1.1;
                            -webkit-print-color-adjust: exact;
                        }
                        .label-page {
                            width: ${labelWidth}mm;
                            height: ${labelHeight}mm;
                            padding: 2.2mm 2.2mm;
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            page-break-after: always;
                            overflow: hidden;
                            background: white;
                            color: black;
                        }
                        .barcode-container {
                            width: 100%;
                            height: 11mm;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .barcode-container svg {
                            max-width: 95%;
                            height: 100%;
                        }
                        .barcode-text {
                            font-size: 8px;
                            letter-spacing: 1.5px;
                            margin-top: 0.5mm;
                            font-weight: bold;
                        }
                        .product-title {
                            font-size: 6.8px;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin: 1.2mm 0 1.8mm 0;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 100%;
                        }
                        .price-table {
                            width: 85%;
                            font-size: 6.5px;
                            border-collapse: collapse;
                        }
                        .price-table td {
                            text-align: left;
                            padding: 0.2mm 0;
                            border-bottom: 0.3px dashed #bbb;
                        }
                        .price-table tr:last-child td {
                            border-bottom: none;
                        }
                        .price-table .price-val {
                            text-align: right;
                        }
                        .font-bold {
                            font-weight: bold;
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
                                <Label htmlFor="iva-input">Porcentaje IVA (%)</Label>
                                <Input 
                                    id="iva-input"
                                    type="number"
                                    className="bg-background border-border text-foreground font-medium"
                                    value={ivaPercent}
                                    onChange={(e) => setIvaPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                                />
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
                                const { base, iva, pmvp } = calculatePrices(previewItem.price);
                                const titleFull = previewItem.attributesText === 'Estándar'
                                    ? previewItem.productName
                                    : `${previewItem.productName} (${previewItem.attributesText})`;

                                return (
                                    <div 
                                        className="border border-border/70 rounded bg-white text-black p-3 flex flex-col items-center shadow-lg relative select-none"
                                        style={{ 
                                            width: `${labelWidth * 4.5}px`, // Scaled for screen preview
                                            height: `${labelHeight * 4.5}px`, 
                                            fontFamily: 'Arial, sans-serif'
                                        }}
                                    >
                                        {/* Barcode svg */}
                                        <div className="w-full h-[35%] flex justify-center items-center">
                                            <Barcode value={previewItem.barcode} height={40} width={150} />
                                        </div>
                                        {/* Barcode Value */}
                                        <div className="text-[10px] tracking-[1.5px] font-bold mt-1 text-center font-mono">
                                            {previewItem.barcode}
                                        </div>
                                        {/* Product Title */}
                                        <div className="text-[9px] font-bold text-center uppercase truncate w-full mt-1.5">
                                            {titleFull}
                                        </div>
                                        {/* Prices block */}
                                        <div className="w-[85%] mt-2 text-[8px] space-y-0.5 border-t border-dashed border-gray-300 pt-1">
                                            <div className="flex justify-between">
                                                <span>Base:</span>
                                                <span>{currencySign}{base.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>IVA:</span>
                                                <span>{currencySign}{iva.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold">
                                                <span>PMVP:</span>
                                                <span>{currencySign}{pmvp.toFixed(2)}</span>
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
