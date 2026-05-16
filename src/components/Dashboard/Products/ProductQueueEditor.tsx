import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Category, Brand, Product } from '@/types';
import { ProductVariantsTab } from './tabs/ProductVariantsTab';
import { ProductImagesTab } from './tabs/ProductImagesTab';
import { Loader2, ArrowLeft, ArrowRight, SkipForward, Save } from 'lucide-react';

interface ProductQueueEditorProps {
    createdProducts: { id: number; nombre: string; categoria_sugerida?: string; marca_sugerida?: string }[];
    onFinish: () => void;
}

export const ProductQueueEditor: React.FC<ProductQueueEditorProps> = ({ createdProducts, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [categoryId, setCategoryId] = useState('');
    const [brandId, setBrandId] = useState('');

    const total = createdProducts.length;
    const currentBase = createdProducts[currentIndex];

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingBrand, setIsAddingBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');

    const fetchTaxonomies = async () => {
        try {
            const [catsRes, brandsRes] = await Promise.all([
                FetchData<Category[]>(API_ENDPOINTS.CATEGORIES.LIST),
                FetchData<Brand[]>(API_ENDPOINTS.BRANDS.LIST)
            ]);
            setCategories(Array.isArray(catsRes) ? catsRes : (catsRes as any).data || []);
            setBrands(Array.isArray(brandsRes) ? brandsRes : (brandsRes as any).data || []);
        } catch (error) {
            console.error('Failed to fetch taxonomies:', error);
        }
    };

    // Cargar dependencias
    useEffect(() => {
        fetchTaxonomies();
    }, []);

    // Cargar producto actual
    useEffect(() => {
        if (!currentBase?.id) return;
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await FetchData<any>(API_ENDPOINTS.PRODUCTS.DETAIL(currentBase.id));
                if (data) {
                    setCurrentProduct(data);
                    setCategoryId(data.id_categoria?.toString() || '');
                    setBrandId(data.id_marca?.toString() || '');
                }
            } catch (error) {
                console.error('Error fetching product details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [currentIndex, currentBase]);

    const handleSaveAndNext = async () => {
        if (!currentProduct) return;
        setSaving(true);
        try {
            await FetchData(
                API_ENDPOINTS.PRODUCTS.UPDATE(currentProduct.id_producto),
                'PUT',
                {
                    body: {
                        nombre: currentProduct.nombre,
                        descripcion: currentProduct.descripcion,
                        id_categoria: categoryId ? parseInt(categoryId) : null,
                        id_marca: brandId ? parseInt(brandId) : null,
                        activo: currentProduct.activo,
                        necesita_revision: false
                    }
                }
            );
            handleNext();
        } catch (error) {
            console.error('Error updating product', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNewCategory = async () => {
        if (!newCategoryName || newCategoryName.trim() === '') return;
        setLoading(true);
        try {
            const res = await FetchData<any>(API_ENDPOINTS.CATEGORIES.LIST, 'POST', {
                body: { nombre: newCategoryName.trim() }
            });
            const catId = res.id_categoria || res.category?.id_categoria;
            if (res && catId) {
                await fetchTaxonomies();
                setCategoryId(catId.toString());
                setIsAddingCategory(false);
                setNewCategoryName('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNewBrand = async () => {
        if (!newBrandName || newBrandName.trim() === '') return;
        setLoading(true);
        try {
            const res = await FetchData<any>(API_ENDPOINTS.BRANDS.LIST, 'POST', {
                body: { nombre: newBrandName.trim() }
            });
            const brId = res.id_marca || res.brand?.id_marca;
            if (res && brId) {
                await fetchTaxonomies();
                setBrandId(brId.toString());
                setIsAddingBrand(false);
                setNewBrandName('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (!currentProduct || loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando producto...</p>
            </div>
        );
    }

    const progressPercent = ((currentIndex + 1) / total) * 100;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header del Progreso */}
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6 relative">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Completar Producto {currentIndex + 1} de {total}
                        </h2>
                        <h1 className="text-3xl font-extrabold text-foreground">{currentProduct.nombre}</h1>
                    </div>
                    <div className="text-lg font-bold text-primary">
                        {currentIndex + 1}/{total}
                    </div>
                </div>
                {/* Barra de progreso visual */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Columna Izquierda: Clasificación & Variantes */}
                <div className="md:col-span-2 space-y-6">
                    {/* Clasificación */}
                    <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                           Clasificación
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                   Categoría {currentBase.categoria_sugerida ? <span className="text-amber-500 normal-case font-normal">(Sugerida: {currentBase.categoria_sugerida})</span> : ''}
                                </label>
                                {!isAddingCategory ? (
                                    <div className="space-y-2">
                                        <Select value={categoryId} onValueChange={setCategoryId}>
                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                <SelectValue placeholder="Sin especificar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => (
                                                    <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>{c.nombre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => { setIsAddingCategory(true); setNewCategoryName(currentBase.categoria_sugerida || ''); }}>
                                            + Crear {`"${currentBase.categoria_sugerida || 'nueva'}"`}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 border border-white/10 p-2 rounded-md bg-white/5">
                                        <input
                                            placeholder="Nueva categoría..."
                                            className="h-8 w-full px-2 text-xs bg-background/50 border border-white/10 rounded"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button type="button" size="sm" className="h-7 text-[10px] flex-1" onClick={handleSaveNewCategory} disabled={loading}>
                                                Guardar
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] flex-1 border-white/10" onClick={() => setIsAddingCategory(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                   Marca {currentBase.marca_sugerida ? <span className="text-amber-500 normal-case font-normal">(Sugerida: {currentBase.marca_sugerida})</span> : ''}
                                </label>
                                {!isAddingBrand ? (
                                    <div className="space-y-2">
                                        <Select value={brandId} onValueChange={setBrandId}>
                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                <SelectValue placeholder="Sin especificar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brands.map(b => (
                                                    <SelectItem key={b.id_marca} value={b.id_marca.toString()}>{b.nombre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => { setIsAddingBrand(true); setNewBrandName(currentBase.marca_sugerida || ''); }}>
                                            + Crear {`"${currentBase.marca_sugerida || 'nueva'}"`}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 border border-white/10 p-2 rounded-md bg-white/5">
                                        <input
                                            placeholder="Nueva marca..."
                                            className="h-8 w-full px-2 text-xs bg-background/50 border border-white/10 rounded"
                                            value={newBrandName}
                                            onChange={e => setNewBrandName(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button type="button" size="sm" className="h-7 text-[10px] flex-1" onClick={handleSaveNewBrand} disabled={loading}>
                                                Guardar
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] flex-1 border-white/10" onClick={() => setIsAddingBrand(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Variantes y Precios */}
                    <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <ProductVariantsTab product={currentProduct} />
                    </div>
                </div>

                {/* Columna Derecha: Imágenes y Controles */}
                <div className="space-y-6">
                    {/* Imágenes */}
                    <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                           Imágenes
                        </h3>
                        {/* Wrapper for tab content to look seamless */}
                        <div className="-mt-4">
                           <ProductImagesTab product={currentProduct} />
                        </div>
                    </div>

                    {/* Panel de Controles Flotantes */}
                    <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl sticky top-6">
                        <Button 
                            size="lg" 
                            className="w-full font-bold shadow-lg shadow-primary/20 h-14 text-lg mb-4"
                            onClick={handleSaveAndNext}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                            Guardar y Sig.
                        </Button>

                        <div className="flex justify-between items-center text-muted-foreground">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handlePrev} 
                                disabled={currentIndex === 0 || saving}
                                className="flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" /> Ant.
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleNext}
                                disabled={saving}
                                className="flex items-center hover:text-foreground"
                            >
                                Saltar <SkipForward className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
