import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, Plus, Edit, Trash2, CheckCircle2, AlertCircle, Loader2, Tags, Bookmark,
    Ban, Power
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";

interface Brand {
    id_marca: number;
    nombre: string;
    activo: boolean;
}

interface Category {
    id_categoria: number;
    nombre: string;
    id_padre: number | null;
    activo: boolean;
}

export const ManageTaxonomies = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('brands');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Dialog states
    const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ nombre: '', id_padre: '' });

    // Confirmation states
    const [brandToToggle, setBrandToToggle] = useState<Brand | null>(null);
    const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                fetch(API_ENDPOINTS.CATALOG.BRANDS),
                fetch(API_ENDPOINTS.CATALOG.CATEGORIES)
            ]);

            if (brandsRes.ok) {
                const bData = await brandsRes.json();
                setBrands(bData.data || []);
            }
            if (categoriesRes.ok) {
                const cData = await categoriesRes.json();
                setCategories(cData.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch taxonomies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingBrand ? 'PATCH' : 'POST';
            const url = editingBrand ? `${API_ENDPOINTS.CATALOG.BRANDS}/${editingBrand.id_marca}` : API_ENDPOINTS.CATALOG.BRANDS;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: formData.nombre })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Marca ${editingBrand ? 'actualizada' : 'creada'} correctamente.` });
                setIsBrandDialogOpen(false);
                setEditingBrand(null);
                setFormData({ nombre: '', id_padre: '' });
                fetchData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar la marca.' });
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingCategory ? 'PATCH' : 'POST';
            const url = editingCategory ? `${API_ENDPOINTS.CATALOG.CATEGORIES}/${editingCategory.id_categoria}` : API_ENDPOINTS.CATALOG.CATEGORIES;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    id_padre: formData.id_padre ? parseInt(formData.id_padre) : null
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: `Categoría ${editingCategory ? 'actualizada' : 'creada'} correctamente.` });
                setIsCategoryDialogOpen(false);
                setEditingCategory(null);
                setFormData({ nombre: '', id_padre: '' });
                fetchData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar la categoría.' });
        }
    };


    const handleToggleBrandStatus = async () => {
        if (!brandToToggle) return;
        setStatusLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.CATALOG.BRANDS}/${brandToToggle.id_marca}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: !brandToToggle.activo })
            });
            if (response.ok) {
                setMessage({ type: 'success', text: `Marca ${brandToToggle.activo ? 'desactivada' : 'activada'} correctamente.` });
                fetchData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cambiar el estado de la marca.' });
        } finally {
            setStatusLoading(false);
            setBrandToToggle(null);
        }
    };

    const handleToggleCategoryStatus = async () => {
        if (!categoryToToggle) return;
        setStatusLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.CATALOG.CATEGORIES}/${categoryToToggle.id_categoria}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: !categoryToToggle.activo })
            });
            if (response.ok) {
                setMessage({ type: 'success', text: `Categoría ${categoryToToggle.activo ? 'desactivada' : 'activada'} correctamente.` });
                fetchData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cambiar el estado de la categoría.' });
        } finally {
            setStatusLoading(false);
            setCategoryToToggle(null);
        }
    };

    const filteredBrands = brands.filter(b => b.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCategories = categories.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenCreateDialog = () => {
        setFormData({ nombre: '', id_padre: '' });
        if (activeTab === 'brands') {
            setEditingBrand(null);
            setIsBrandDialogOpen(true);
        } else {
            setEditingCategory(null);
            setIsCategoryDialogOpen(true);
        }
    };

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {message.text}
                </div>
            )}

            <Card className="bg-card/40 backdrop-blur-md border-white/10 shadow-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Tags className="h-5 w-5 text-primary" />
                            Listado General
                        </CardTitle>
                        <div className="flex items-center gap-3 w-full max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-9 bg-background/50 border-white/10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                size="sm"
                                onClick={handleOpenCreateDialog}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva {activeTab === 'brands' ? 'Marca' : 'Categoría'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b border-white/5 bg-transparent p-0 h-12">
                            <TabsTrigger value="brands" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-6 h-full">
                                Marcas
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-6 h-full">
                                Categorías
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="brands" className="m-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="text-muted-foreground">ID</TableHead>
                                        <TableHead className="text-muted-foreground">Nombre</TableHead>
                                        <TableHead className="text-muted-foreground">Estado</TableHead>
                                        <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredBrands.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                No se encontraron marcas.
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredBrands.map((brand) => (
                                        <TableRow key={brand.id_marca} className="hover:bg-white/5 border-white/5 transition-colors">
                                            <TableCell className="font-mono text-xs opacity-50">#{brand.id_marca}</TableCell>
                                            <TableCell className="font-medium">{brand.nombre}</TableCell>
                                            <TableCell>
                                                <Badge variant={brand.activo ? "default" : "secondary"} className={brand.activo ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                                                    {brand.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                        onClick={() => { setEditingBrand(brand); setFormData({ nombre: brand.nombre, id_padre: '' }); setIsBrandDialogOpen(true); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon"
                                                        className={`h-8 w-8 ${brand.activo ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10' : 'text-green-500 hover:text-green-600 hover:bg-green-500/10'}`}
                                                        title={brand.activo ? "Desactivar" : "Activar"}
                                                        onClick={() => setBrandToToggle(brand)}>
                                                        {brand.activo ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="categories" className="m-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead className="text-muted-foreground">ID</TableHead>
                                        <TableHead className="text-muted-foreground">Nombre</TableHead>
                                        <TableHead className="text-muted-foreground">Estado</TableHead>
                                        <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                No se encontraron categorías.
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCategories.map((cat) => (
                                        <TableRow key={cat.id_categoria} className="hover:bg-white/5 border-white/5 transition-colors">
                                            <TableCell className="font-mono text-xs opacity-50">#{cat.id_categoria}</TableCell>
                                            <TableCell className="font-medium">{cat.nombre}</TableCell>
                                            <TableCell>
                                                <Badge variant={cat.activo ? "default" : "secondary"} className={cat.activo ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}>
                                                    {cat.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                        onClick={() => { setEditingCategory(cat); setFormData({ nombre: cat.nombre, id_padre: cat.id_padre?.toString() || '' }); setIsCategoryDialogOpen(true); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon"
                                                        className={`h-8 w-8 ${cat.activo ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10' : 'text-green-500 hover:text-green-600 hover:bg-green-500/10'}`}
                                                        title={cat.activo ? "Desactivar" : "Activar"}
                                                        onClick={() => setCategoryToToggle(cat)}>
                                                        {cat.activo ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Brand Dialog */}
            <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl font-bold">
                            {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingBrand ? 'Modifica los detalles de la marca.' : 'Agrega una nueva marca para tus productos.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveBrand}>
                        <div className="grid gap-6 py-6">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right font-semibold text-foreground">
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    className="col-span-3 bg-background border-border text-foreground focus:ring-primary"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    placeholder="Inserte nombre de marca"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full sm:w-auto font-bold shadow-md">
                                {editingBrand ? 'Guardar Cambios' : 'Crear Marca'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl font-bold">
                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingCategory ? 'Modifica los detalles de la categoría.' : 'Agrega una nueva categoría para tus productos.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCategory}>
                        <div className="grid gap-6 py-6">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="catName" className="font-semibold text-foreground text-right">
                                    Nombre
                                </Label>
                                <Input
                                    id="catName"
                                    className="col-span-3 bg-background border-border text-foreground focus:ring-primary"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    placeholder="Inserte nombre de categoría"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full sm:w-auto font-bold shadow-md">
                                {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Brand Confirmation Dialog */}
            <AlertDialog open={!!brandToToggle} onOpenChange={() => !statusLoading && setBrandToToggle(null)}>
                <AlertDialogContent className="bg-card border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            ¿Estás seguro de que deseas {brandToToggle?.activo ? 'desactivar' : 'activar'} la marca <strong>{brandToToggle?.nombre}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={statusLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleToggleBrandStatus();
                            }}
                            className={brandToToggle?.activo ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                            disabled={statusLoading}
                        >
                            {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {brandToToggle?.activo ? 'Desactivar' : 'Activar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Category Confirmation Dialog */}
            <AlertDialog open={!!categoryToToggle} onOpenChange={() => !statusLoading && setCategoryToToggle(null)}>
                <AlertDialogContent className="bg-card border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            ¿Estás seguro de que deseas {categoryToToggle?.activo ? 'desactivar' : 'activar'} la categoría <strong>{categoryToToggle?.nombre}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={statusLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleToggleCategoryStatus();
                            }}
                            className={categoryToToggle?.activo ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                            disabled={statusLoading}
                        >
                            {statusLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {categoryToToggle?.activo ? 'Desactivar' : 'Activar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
