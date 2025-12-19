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
    Search, Plus,  Edit, Ban, CheckCircle, ChevronLeft, ChevronRight 
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
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Logic similar to UserList
             const queryParams = new URLSearchParams();
            // queryParams.append('page', page.toString()); // If API supports it
            if (searchTerm) queryParams.append('search', searchTerm);

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
        fetchProducts();
    }, []);

    const handleToggleStatus = async () => {
        if (!productToToggle) return;
        setStatusLoading(true);
        try {
            // API DELETE /products/:id to deactivate (as per user request "DELETE ... desactiva")
            // Or if activating, we might need a different endpoint?
            // User said: "DELETE /api/products/:id ... desactiva (activo=false)"
            // User did NOT specify how to ACTIVATE. 
            // However, PUT /api/products/:id accepts "activo".
            // So for activation, I should use PUT with { activo: true }.
            // For deactivation, I can use DELETE or PUT { activo: false }. 
            // I'll use DELETE for deactivation as requested, and PUT for activation.
            
            if (productToToggle.activo) {
                 await FetchData(API_ENDPOINTS.PRODUCTS.DELETE(productToToggle.id_producto), 'DELETE');
            } else {
                 await FetchData(API_ENDPOINTS.PRODUCTS.UPDATE(productToToggle.id_producto), 'PUT', {
                     body: { activo: true }
                 });
            }

            await fetchProducts();
            setProductToToggle(null);
        } catch (error) {
            console.error('Error toggling product status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                        placeholder="Buscar productos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                 <CreateProductDialog onProductCreated={fetchProducts} />
            </div>
            <Card>
                <CardHeader className="py-4">
                     <CardTitle className="text-lg">Inventario de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        Cargando productos...
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No se encontraron productos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id_producto}>
                                        <TableCell className="font-medium">{product.nombre}</TableCell>
                                        <TableCell>{product.sku_base || '-'}</TableCell>
                                        <TableCell>{product.Categoria?.nombre || '-'}</TableCell>
                                        <TableCell>{product.Marca?.nombre || '-'}</TableCell>
                                        <TableCell>
                                            {product.activo ? (
                                                <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
                                            ) : (
                                                <Badge variant="destructive">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    title="Editar"
                                                    onClick={() => setSelectedProduct(product)}
                                                >
                                                    <Edit className="h-4 w-4 text-muted-foreground" />
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
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
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
        </div>
    );
};
