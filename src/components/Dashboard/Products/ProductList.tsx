import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Plus, Edit, Ban, CheckCircle, ChevronLeft, ChevronRight, Trash, Trash2,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { CreateProductDialog } from './CreateProductDialog';
import { EditProductDialog } from './EditProductDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Product } from '@/types';

export const ProductList = () => {
    // Scaffold state
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For Edit
    const [productToToggle, setProductToToggle] = useState<Product | null>(null); // For Deactivate/Activate
    const [productToDelete, setProductToDelete] = useState<Product | null>(null); // For permanent deletion
    const [statusLoading, setStatusLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Logic similar to UserList
            const queryParams = new URLSearchParams();
            // queryParams.append('page', page.toString()); // If API supports it
            if (searchTerm) queryParams.append('search', searchTerm);
            queryParams.append('_t', Date.now().toString());

            const url = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
            const data = await FetchData<Product[]>(url); // API GET /products returns array directly or paginated object? 
            // "lista todos los productos ordenados por fecha_creacion desc." implying array?
            // UserList had specific structure. I'll assume array for now based on "lista todos".

            if (Array.isArray(data)) {
                setProducts(data);
                setTotalPages(1); // No pagination mentioned?
            } else {
                setProducts([]);
            }

        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 400); // Pequeño retraso para no saturar el servidor al escribir

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleToggleStatus = async () => {
        if (!productToToggle) return;
        setStatusLoading(true);
        try {
            // Se usa PUT para cambiar el estado (activar o desactivar)
            await FetchData(API_ENDPOINTS.PRODUCTS.UPDATE(productToToggle.id_producto), 'PUT', {
                body: { activo: !productToToggle.activo }
            });

            await fetchProducts();
            setMessage({
                type: 'success',
                text: `Producto ${productToToggle.activo ? 'desactivado' : 'activado'} correctamente.`
            });
            setProductToToggle(null);
        } catch (error) {
            console.error('Error toggling product status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleHardDelete = async () => {
        if (!productToDelete) return;
        setStatusLoading(true);
        try {
            await FetchData(API_ENDPOINTS.PRODUCTS.DELETE(productToDelete.id_producto), 'DELETE');
            setMessage({ type: 'success', text: 'Producto eliminado permanentemente.' });
            await fetchProducts();
            setProductToDelete(null);
        } catch (error: any) {
            console.error('Error deleting product:', error);
            setMessage({ type: 'error', text: error.message || 'No se pudo eliminar el producto. Puede que tenga pedidos asociados.' });
        } finally {
            setStatusLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                <CreateProductDialog onProductCreated={fetchProducts} />
            </div>
            <Card>
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">Inventario de Productos</CardTitle>
                    {message && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border animate-in fade-in slide-in-from-right-1 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                            <span className="text-xs font-medium">{message.text}</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-center">Variantes</TableHead>
                                <TableHead className="text-center">Stock Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        Cargando productos...
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No se encontraron productos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id_producto}>
                                        <TableCell className="font-medium">{product.nombre}</TableCell>
                                        <TableCell>{product.category_name || product.Categoria?.nombre || '-'}</TableCell>
                                        <TableCell>{product.brand_name || product.Marca?.nombre || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono">
                                                {product.variants_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                            {product.total_stock ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            {product.activo ? (
                                                <div className="flex flex-col gap-1">
                                                    <Badge className="bg-green-500 hover:bg-green-600 w-fit">Activo</Badge>
                                                    {product.necesita_revision && (
                                                        <Badge variant="outline" className="border-orange-500 text-orange-500 bg-orange-500/10 text-[10px] py-0">Borrador</Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge variant="destructive">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex items-center gap-1 h-8"
                                                    onClick={() => setSelectedProduct(product)}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    Ver / Gestionar
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title={product.activo ? "Desactivar" : "Activar"}
                                                    onClick={() => setProductToToggle(product)}
                                                >
                                                    {product.activo ? (
                                                        <Ban className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title="Eliminar permanentemente"
                                                    onClick={() => setProductToDelete(product)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>

            <EditProductDialog
                open={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onProductUpdated={fetchProducts}
                product={selectedProduct}
            />

            <AlertDialog open={!!productToToggle} onOpenChange={() => setProductToToggle(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {productToToggle?.activo ? '¿Desactivar producto?' : '¿Activar producto?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas {productToToggle?.activo ? 'desactivar' : 'activar'} el producto <strong>{productToToggle?.nombre}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={statusLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleStatus} disabled={statusLoading} className={productToToggle?.activo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>
                            {statusLoading ? 'Procesando...' : (productToToggle?.activo ? 'Desactivar' : 'Activar')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={!!productToDelete} onOpenChange={(val) => !val && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto de forma permanente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el producto <strong>{productToDelete?.nombre}</strong> del sistema. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={statusLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleHardDelete} disabled={statusLoading} className="bg-red-600 hover:bg-red-700">
                            {statusLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
