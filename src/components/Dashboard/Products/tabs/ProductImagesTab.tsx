import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Product, ProductImage, Variant } from '@/types';
import { Loader2, Upload, Trash, Star, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductImagesTabProps {
    product: Product;
}

export const ProductImagesTab: React.FC<ProductImagesTabProps> = ({ product }) => {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string>("all");

    // "all" = show all images (gallery view)
    // "generic" = show images with id_variante_producto === null
    // "123" = show images for variant 123
    
    // For Upload: 
    // If viewing "all", we default to "generic" or ask? 
    // Let's add a robust selector for upload.

    const [uploadVariantId, setUploadVariantId] = useState<string>("generic");

    const fetchRes = async () => {
        if (!product?.id_producto) return;
        setLoading(true);
        try {
            // Fetch Images
            const imgRes = await FetchData<any>(API_ENDPOINTS.PRODUCTS.IMAGES(product.id_producto));
            setImages(imgRes.data || []);
            
            // Fetch Variants for filter
            const varRes = await FetchData<any>(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto));
            setVariants(varRes.data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRes();
    }, [product]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        
        // Associate with variant if selected
        if (uploadVariantId && uploadVariantId !== "generic") {
            formData.append('id_variante_producto', uploadVariantId);
        }

        try {
            await FetchData(
                API_ENDPOINTS.PRODUCTS.IMAGES(product.id_producto), 
                'POST', 
                { body: formData }
            );
            fetchRes();
        } catch (error) {
            console.error("Error uploading image", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
            e.target.value = ''; 
        }
    };

    const handleDelete = async (imgId: number) => {
        if(!confirm("¿Eliminar imagen?")) return;
        try {
            await FetchData(API_ENDPOINTS.IMAGES.ITEM(product.id_producto, imgId), 'DELETE');
            fetchRes();
        } catch (error) {
            console.error("Error deleting image", error);
            alert("No se pudo eliminar la imagen. Verifique la consola.");
        }
    };

    const handleSetPrincipal = async (imgId: number) => {
        try {
            await FetchData(
                `${API_ENDPOINTS.IMAGES.ITEM(product.id_producto, imgId)}?principal=true`, 
                'PATCH'
            );
            fetchRes();
        } catch (error) {
            console.error("Error setting principal image", error);
        }
    };

    // Filter logic
    const filteredImages = images.filter(img => {
        if (selectedVariantId === "all") return true;
        if (selectedVariantId === "generic") return img.id_variante_producto == null;
        return img.id_variante_producto?.toString() === selectedVariantId;
    });

    const getVariantName = (vId: number | null) => {
        if (!vId) return "General";
        const v = variants.find(x => x.id_variante_producto === vId);
        return v ? `${v.sku}` : "Desconocido";
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // If relative, prepend external API base (need to pass this or configure logic)
        // Since we are client side, import.meta.env.PUBLIC_EXTERNAL_API_BASE works
        const baseUrl = import.meta.env.PUBLIC_EXTERNAL_API_BASE || 'http://localhost:3000';
        return `${baseUrl}${url}`;
    };

    return (
        <div className="space-y-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                     <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Imágenes</SelectItem>
                            <SelectItem value="generic">Generales (Producto)</SelectItem>
                            {variants.map(v => (
                                <SelectItem key={v.id_variante_producto} value={v.id_variante_producto.toString()}>
                                    Var: {v.sku}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={fetchRes}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                    <span className="text-xs font-medium mr-2">Subir a:</span>
                    <Select value={uploadVariantId} onValueChange={setUploadVariantId}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="generic">General</SelectItem>
                            {variants.map(v => (
                                <SelectItem key={v.id_variante_producto} value={v.id_variante_producto.toString()}>
                                    {v.sku}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="relative">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id="image-upload" 
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        <label htmlFor="image-upload">
                            <Button variant="default" size="sm" asChild disabled={uploading} className="cursor-pointer h-8">
                                <span>
                                    {uploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-2 h-3 w-3" />}
                                    Subir
                                </span>
                            </Button>
                        </label>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-muted-foreground">Cargando galería...</div>
            ) : filteredImages.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                    No hay imágenes para esta vista.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredImages.map(img => (
                        <Card key={img.id_imagen_producto} className="relative group overflow-hidden border-2 transition-all hover:border-primary/50">
                            {img.es_principal && (
                                <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-sm flex items-center">
                                    <Star className="w-3 h-3 mr-1 fill-current" /> Principal
                                </div>
                            )}
                             <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                                {getVariantName(img.id_variante_producto ?? null)}
                            </div>

                            <div className="aspect-square bg-muted">
                                <img src={getImageUrl(img.url)} alt="Product" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-red-400 hover:bg-transparent"
                                    onClick={() => handleDelete(img.id_imagen_producto)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                                {!img.es_principal && (
                                    <Button 
                                        variant="ghost" className="h-6 text-white hover:text-yellow-400 hover:bg-transparent text-xs px-2"
                                        onClick={() => handleSetPrincipal(img.id_imagen_producto)}
                                    >
                                        Principal
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
