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
    category_name?: string;
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
    producto?: string;
    categoria?: string | null;
    marca?: string | null;
}

interface SelectedLabel {
    id_variante_producto: number;
    productName: string;
    attributesText: string;
    sku: string;
    barcode: string;
    price: number;
    copies: number;
    stock_actual: number;
}

export const LabelGenerator: React.FC = () => {
    // Products and variants lists
    const [allVariants, setAllVariants] = useState<VariantItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
    const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('');
    const [printByStock, setPrintByStock] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // List of selected labels to print
    const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>([]);
    const [error, setError] = useState<string | null>(null);

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Configuration Settings — lazy initializers read directly from localStorage on first render
    // This prevents mount lifecycle race conditions from overwriting saved settings.
    const [labelWidth, setLabelWidth] = useState<number>(() => {
        const saved = localStorage.getItem('label_print_width');
        return saved ? parseInt(saved, 10) : 50;
    });
    const [labelHeight, setLabelHeight] = useState<number>(() => {
        const saved = localStorage.getItem('label_print_height');
        return saved ? parseInt(saved, 10) : 30;
    });
    const [currencySign, setCurrencySign] = useState<string>(() => {
        return localStorage.getItem('label_print_currency') || '$';
    });
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(() => {
        const saved = localStorage.getItem('label_print_orientation');
        return (saved === 'vertical' ? 'vertical' : 'horizontal') as 'horizontal' | 'vertical';
    });
    const [scale, setScale] = useState<number>(() => {
        const saved = localStorage.getItem('label_print_scale');
        return saved ? parseFloat(saved) : 1.0;
    });

    // Persist settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('label_print_width', labelWidth.toString());
    }, [labelWidth]);

    useEffect(() => {
        localStorage.setItem('label_print_height', labelHeight.toString());
    }, [labelHeight]);

    useEffect(() => {
        localStorage.setItem('label_print_currency', currencySign);
    }, [currencySign]);

    useEffect(() => {
        localStorage.setItem('label_print_orientation', orientation);
    }, [orientation]);

    useEffect(() => {
        localStorage.setItem('label_print_scale', scale.toString());
    }, [scale]);

    // Load all active variants at once
    const loadAllVariantsData = async () => {
        setLoadingProducts(true);
        setError(null);
        try {
            const res = await FetchData<any>('/api/reports/stock-actual');
            const list = Array.isArray(res) ? res : res.data || [];
            setAllVariants(list.map((r: any) => ({
                id_variante_producto: r.id_variante_producto,
                id_producto: r.id_producto,
                sku: r.sku,
                precio_lista: Number(r.precio) || 0,
                costo: Number(r.costo) || 0,
                codigo_barras: r.codigo_barras,
                atributos_json: r.variante,
                activo: true,
                stock_actual: r.stock || 0,
                producto: r.producto,
                categoria: r.categoria,
                marca: r.marca
            })));
        } catch (e: any) {
            console.error("Error loading active variants for label generator:", e);
            setError(e.message || "Error al cargar la lista de productos y variantes.");
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadAllVariantsData();
    }, []);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Derive unique products list from loaded variants
    const products = React.useMemo(() => {
        const prodMap = new Map<number, ProductItem>();
        allVariants.forEach(v => {
            if (!prodMap.has(v.id_producto)) {
                prodMap.set(v.id_producto, {
                    id_producto: v.id_producto,
                    nombre: v.producto || 'Producto',
                    categoria_nombre: v.categoria || undefined,
                    brand_name: v.marca || undefined
                });
            }
        });
        return Array.from(prodMap.values());
    }, [allVariants]);

    // Derive active variants of the selected product
    const variants = React.useMemo(() => {
        if (!selectedProductId) return [];
        return allVariants.filter(v => String(v.id_producto) === selectedProductId);
    }, [allVariants, selectedProductId]);

    // Extract unique categories and brands from loaded products list
    const availableCategories = React.useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            const name = p.category_name || p.categoria_nombre;
            if (name) cats.add(name);
        });
        return Array.from(cats).sort();
    }, [products]);

    const availableBrands = React.useMemo(() => {
        const brands = new Set<string>();
        products.forEach(p => {
            if (p.brand_name) brands.add(p.brand_name);
        });
        return Array.from(brands).sort();
    }, [products]);

    // Search and filter products
    const filteredProducts = products.filter(p => {
        const name = p.nombre.toLowerCase();
        const cat = (p.category_name || p.categoria_nombre || '').toLowerCase();
        const brand = (p.brand_name || '').toLowerCase();
        const query = productSearch.toLowerCase();
        
        const matchSearch = name.includes(query) || cat.includes(query) || brand.includes(query);
        const matchCat = !selectedCategoryFilter || (p.category_name || p.categoria_nombre) === selectedCategoryFilter;
        const matchBrand = !selectedBrandFilter || p.brand_name === selectedBrandFilter;
        
        return matchSearch && matchCat && matchBrand;
    });

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
                copies: printByStock ? (variant.stock_actual > 0 ? variant.stock_actual : 1) : 1,
                stock_actual: variant.stock_actual
            };
            setSelectedLabels(prev => [...prev, newLabel]);
        } else {
            // Remove from selected list
            setSelectedLabels(prev => prev.filter(item => item.id_variante_producto !== variant.id_variante_producto));
        }
    };

    // Handle select/deselect all variants of the current product
    const handleSelectAllVariants = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedLabels(prev => {
                const updated = [...prev];
                variants.forEach(v => {
                    if (!updated.some(item => item.id_variante_producto === v.id_variante_producto)) {
                        const prod = products.find(p => Number(p.id_producto) === Number(v.id_producto));
                        const name = prod ? prod.nombre : 'Producto';
                        const attributes = getAttributesText(v.atributos_json);
                        updated.push({
                            id_variante_producto: v.id_variante_producto,
                            productName: name,
                            attributesText: attributes,
                            sku: v.sku,
                            barcode: v.codigo_barras || v.sku,
                            price: Number(v.precio_lista) || 0,
                            copies: printByStock ? (v.stock_actual > 0 ? v.stock_actual : 1) : 1,
                            stock_actual: v.stock_actual
                        });
                    }
                });
                return updated;
            });
        } else {
            const variantIds = new Set(variants.map(v => v.id_variante_producto));
            setSelectedLabels(prev => prev.filter(item => !variantIds.has(item.id_variante_producto)));
        }
    };

    // Handle select/deselect all variants of a specific product from dropdown
    const handleToggleProduct = (productId: number, isChecked: boolean) => {
        const pVars = allVariants.filter(v => v.id_producto === productId);
        if (isChecked) {
            setSelectedLabels(prev => {
                const updated = [...prev];
                pVars.forEach(v => {
                    if (!updated.some(item => item.id_variante_producto === v.id_variante_producto)) {
                        updated.push({
                            id_variante_producto: v.id_variante_producto,
                            productName: v.producto || 'Producto',
                            attributesText: getAttributesText(v.atributos_json),
                            sku: v.sku,
                            barcode: v.codigo_barras || v.sku,
                            price: Number(v.precio_lista) || 0,
                            copies: printByStock ? (v.stock_actual > 0 ? v.stock_actual : 1) : 1,
                            stock_actual: v.stock_actual
                        });
                    }
                });
                return updated;
            });
        } else {
            const variantIds = new Set(pVars.map(v => v.id_variante_producto));
            setSelectedLabels(prev => prev.filter(item => !variantIds.has(item.id_variante_producto)));
        }
    };

    // Handle select/deselect all variants of all filtered products
    const handleToggleAllFilteredProducts = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedLabels(prev => {
                const updated = [...prev];
                filteredProducts.forEach(p => {
                    const pVars = allVariants.filter(v => v.id_producto === p.id_producto);
                    pVars.forEach(v => {
                        if (!updated.some(item => item.id_variante_producto === v.id_variante_producto)) {
                            updated.push({
                                id_variante_producto: v.id_variante_producto,
                                productName: v.producto || 'Producto',
                                attributesText: getAttributesText(v.atributos_json),
                                sku: v.sku,
                                barcode: v.codigo_barras || v.sku,
                                price: Number(v.precio_lista) || 0,
                                copies: printByStock ? (v.stock_actual > 0 ? v.stock_actual : 1) : 1,
                                stock_actual: v.stock_actual
                            });
                        }
                    });
                });
                return updated;
            });
        } else {
            const variantIdsToRemove = new Set<number>();
            filteredProducts.forEach(p => {
                allVariants.filter(v => v.id_producto === p.id_producto).forEach(v => {
                    variantIdsToRemove.add(v.id_variante_producto);
                });
            });
            setSelectedLabels(prev => prev.filter(item => !variantIdsToRemove.has(item.id_variante_producto)));
        }
    };

    // Handle toggling "Imprimir por stock" behavior
    const handleTogglePrintByStock = (isChecked: boolean) => {
        setPrintByStock(isChecked);
        setSelectedLabels(prev => prev.map(item => {
            let copies = 1;
            if (isChecked) {
                copies = item.stock_actual > 0 ? item.stock_actual : 1;
            }
            return { ...item, copies };
        }));
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

        const autoScale = Math.min(labelWidth, labelHeight) / Math.max(labelWidth, labelHeight);
        const effectiveScale = orientation === 'vertical' ? scale * autoScale : scale;
        const printRotation = orientation === 'vertical' ? '-90deg' : '0deg';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setError("No se pudo abrir la ventana de impresión. Por favor habilite las ventanas emergentes (popups).");
            return;
        }

        const labelsHtml = selectedLabels.flatMap(item => {
            const barcodeHtml = renderBarcodeSvgHtml(item.sku);
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
                            <div class="barcode-text">${item.sku}</div>
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
        }).join('<div class="page-break"></div>');

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
                             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
                             display: flex;
                             align-items: center;
                             justify-content: center;
                             page-break-inside: avoid;
                             break-inside: avoid;
                         }
                         .page-break {
                             page-break-after: always;
                             break-after: page;
                             height: 0;
                             overflow: hidden;
                         }
                         .label-wrapper {
                             width: ${labelWidth}mm;
                             height: ${labelHeight}mm;
                             display: flex;
                             box-sizing: border-box;
                             flex-direction: column;
                             align-items: center;
                             justify-content: center;
                             text-align: center;
                             padding: 1.2mm 1.5mm;
                             transform: rotate(${printRotation}) scale(${effectiveScale});
                             transform-origin: center center;
                             flex-shrink: 0;
                         }
                         
                         .label-header {
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              gap: 1.5mm;
                              height: 8.5mm;
                              margin-top: -1.5mm;
                              margin-bottom: 0.8mm;
                              flex-shrink: 0;
                          }
                          .shop-logo {
                              height: 8.5mm;
                              width: auto;
                              object-fit: contain;
                          }
                          .shop-name {
                              font-size: 15px;
                              font-weight: 800;
                              color: #000000;
                              letter-spacing: 1px;
                          }
                          .barcode-container {
                              width: 100%;
                              height: 8mm;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              flex-shrink: 0;
                          }
                          .barcode-container svg {
                              max-width: 95%;
                              height: 100%;
                          }
                          .barcode-text {
                              font-family: Monaco, Consolas, "Courier New", monospace;
                              font-size: 10px;
                              font-weight: 500;
                              color: #000000;
                              letter-spacing: 2px;
                              margin-top: 1.2mm;
                              margin-bottom: 0.8mm;
                              text-transform: uppercase;
                              flex-shrink: 0;
                          }
                          .product-title {
                              font-size: 13px;
                              font-weight: 700;
                              color: #000000;
                              text-transform: uppercase;
                              white-space: nowrap;
                              overflow: hidden;
                              text-overflow: ellipsis;
                              width: 100%;
                              margin-bottom: 1.5mm;
                              line-height: 1.2;
                              letter-spacing: 0.4px;
                              flex-shrink: 0;
                          }
                          .price-display {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              width: 100%;
                              box-sizing: border-box;
                              padding: 0 1.5mm;
                              border-top: 0.25mm dashed #000000;
                              padding-top: 1.5mm;
                              margin-top: 0.5mm;
                              flex-shrink: 0;
                          }
                          .price-label {
                              font-size: 11px;
                              color: #000000;
                              font-weight: 700;
                              text-transform: uppercase;
                              letter-spacing: 0.8px;
                          }
                          .price-amount {
                              font-size: 15px;
                              font-weight: 300;
                              color: #000000;
                              line-height: 1;
                          }
                    </style>
                </head>
                <body>
                    ${labelsHtml}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
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
                <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm relative z-20">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-foreground font-bold">
                            <Tag className="h-5 w-5 text-primary" /> Generador de Etiquetas
                        </CardTitle>
                        <CardDescription>
                            Seleccione un producto para ver sus variantes y agregarlas a la cola de impresión de etiquetas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search-product" className="font-semibold text-foreground/80">Buscar Producto</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="search-product"
                                        type="text"
                                        placeholder="Nombre, marca o categoría..."
                                        className="pl-10 bg-background border-border text-foreground"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value.replace(/'/g, '-'))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="filter-category" className="font-semibold text-foreground/80">Filtrar por Categoría</Label>
                                <select 
                                    id="filter-category"
                                    value={selectedCategoryFilter}
                                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Todas las categorías</option>
                                    {availableCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="filter-brand" className="font-semibold text-foreground/80">Filtrar por Marca</Label>
                                <select 
                                    id="filter-brand"
                                    value={selectedBrandFilter}
                                    onChange={(e) => setSelectedBrandFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Todas las marcas</option>
                                    {availableBrands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2" ref={dropdownRef}>
                                <Label className="font-semibold text-foreground/80">Seleccionar Producto ({filteredProducts.length})</Label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm font-medium hover:border-primary/45 transition-colors"
                                    >
                                        <span className="truncate">
                                            {selectedProductId 
                                                ? `Viendo: ${products.find(p => String(p.id_producto) === selectedProductId)?.nombre || ''}`
                                                : selectedLabels.length > 0 
                                                    ? `${selectedLabels.length} variante(s) seleccionada(s)` 
                                                    : '-- Elija un producto / Marcar todos --'}
                                        </span>
                                        <span className="ml-2 text-xs opacity-50 shrink-0">▼</span>
                                    </button>

                                    {isDropdownOpen && (
                                        <div 
                                            className="absolute left-0 mt-1.5 w-full rounded-md border border-border bg-card shadow-2xl z-50 p-2 space-y-1.5 max-h-72 overflow-y-auto"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Select all filtered */}
                                            <div className="flex items-center gap-2 px-2 py-2 border-b border-border/40 pb-2">
                                                <Checkbox 
                                                    id="select-all-filtered-dropdown"
                                                    checked={filteredProducts.length > 0 && filteredProducts.every(p => {
                                                        const pVars = allVariants.filter(v => v.id_producto === p.id_producto);
                                                        return pVars.length > 0 && pVars.every(v => selectedLabels.some(item => item.id_variante_producto === v.id_variante_producto));
                                                    })}
                                                    onCheckedChange={(checked) => handleToggleAllFilteredProducts(!!checked)}
                                                    className="border-border text-primary focus-visible:ring-primary shrink-0"
                                                />
                                                <label htmlFor="select-all-filtered-dropdown" className="text-xs font-bold text-foreground cursor-pointer select-none truncate">
                                                    Marcar Todos los Filtrados ({filteredProducts.length})
                                                </label>
                                            </div>

                                            {/* Products List */}
                                            <div className="space-y-1 pr-1">
                                                {filteredProducts.length === 0 ? (
                                                    <div className="text-xs text-muted-foreground text-center py-4 font-semibold">
                                                        No se encontraron productos.
                                                    </div>
                                                ) : (
                                                    filteredProducts.map(p => {
                                                        const pVars = allVariants.filter(v => v.id_producto === p.id_producto);
                                                        const isChecked = pVars.length > 0 && pVars.every(v => selectedLabels.some(item => item.id_variante_producto === v.id_variante_producto));
                                                        const isViewing = selectedProductId === String(p.id_producto);

                                                        return (
                                                            <div 
                                                                key={p.id_producto}
                                                                className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors ${
                                                                    isViewing ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                                    <Checkbox 
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => handleToggleProduct(p.id_producto, !!checked)}
                                                                        className="border-border text-primary focus-visible:ring-primary shrink-0"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedProductId(String(p.id_producto));
                                                                            setIsDropdownOpen(false);
                                                                        }}
                                                                        className="text-xs text-left font-bold text-foreground truncate hover:text-primary transition-colors flex-1"
                                                                        title="Haga clic para ver variantes abajo"
                                                                    >
                                                                        {p.nombre} {p.brand_name ? `(${p.brand_name})` : ''}
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded ml-2 shrink-0">
                                                                    {pVars.length} var
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <Button variant="outline" onClick={loadAllVariantsData} className="w-full flex gap-2 h-10 font-semibold" disabled={loadingProducts}>
                                    <RefreshCw className={`h-4 w-4 ${loadingProducts ? 'animate-spin' : ''}`} /> Actualizar Productos
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Variants Table Card */}
                {selectedProductId && (
                    <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm relative z-10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-foreground">Variantes Disponibles</CardTitle>
                            <CardDescription>
                                Marque las variantes de las cuales desea imprimir etiquetas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingProducts ? (
                                <div className="text-center py-10 text-muted-foreground animate-pulse font-medium">Cargando variantes...</div>
                            ) : variants.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground font-medium">Este producto no contiene variantes activas.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="w-12 text-center">
                                                <Checkbox 
                                                    checked={variants.length > 0 && variants.every(v => selectedLabels.some(item => item.id_variante_producto === v.id_variante_producto))}
                                                    onCheckedChange={(checked) => handleSelectAllVariants(!!checked)}
                                                    className="border-border text-primary focus-visible:ring-primary"
                                                />
                                            </TableHead>
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
                    <Card className="bg-card/70 border border-border/80 shadow-md backdrop-blur-sm relative z-10">
                        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-foreground">Cola de Impresión</CardTitle>
                                <CardDescription>
                                    Ajuste los precios y cantidades antes de generar el lote de etiquetas.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Imprimir por Stock checkbox */}
                                <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
                                    <Checkbox 
                                        id="print-by-stock"
                                        checked={printByStock}
                                        onCheckedChange={(checked) => handleTogglePrintByStock(!!checked)}
                                        className="border-border text-primary focus-visible:ring-primary"
                                    />
                                    <div className="grid gap-0.5 leading-none text-left">
                                        <label htmlFor="print-by-stock" className="text-xs font-bold text-foreground cursor-pointer select-none">
                                            Imprimir por Stock
                                        </label>
                                        <p className="text-[9px] text-muted-foreground font-medium">
                                            Copias según stock actual
                                        </p>
                                    </div>
                                </div>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="font-semibold text-xs h-9"
                                    onClick={() => setSelectedLabels([])}
                                >
                                    Limpiar Todo
                                </Button>
                            </div>
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
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
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
                                                padding: '6px 8px'
                                            }}
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-center gap-2 w-full h-[20%] shrink-0 mb-1" style={{ marginTop: '-7.5px' }}>
                                                <img src="/logo_original.png" alt="Logo" className="h-full w-auto object-contain" />
                                                <span className="text-[15px] font-extrabold tracking-wider text-gray-900 leading-none">
                                                    BANANO
                                                </span>
                                            </div>
                                            {/* Barcode svg */}
                                            <div className="w-full h-[28%] flex justify-center items-center shrink-0">
                                                <Barcode value={previewItem.sku} height={32} width={130} />
                                            </div>
                                            {/* Barcode Value */}
                                            <div className="text-[10px] font-medium text-center font-mono mt-1.5 mb-1 leading-none tracking-[0.2em] text-gray-600 uppercase shrink-0">
                                                {previewItem.sku}
                                            </div>
                                            {/* Product Title */}
                                            <div className="text-[13px] font-bold uppercase text-center truncate w-full mb-1.5 leading-none text-gray-900 tracking-wide shrink-0">
                                                {titleFull}
                                            </div>
                                            {/* Prices block */}
                                            <div className="w-full mt-1 border-t border-dashed border-gray-300 pt-1.5 flex justify-between items-center px-1.5 font-bold box-border shrink-0">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">PRECIO:</span>
                                                <span className="text-[15px] font-light text-gray-950 leading-none">
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
