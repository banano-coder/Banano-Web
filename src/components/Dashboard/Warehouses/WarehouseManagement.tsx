import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
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
    Search, Plus, Edit, Trash2, Warehouse, MapPin, Phone, 
    CheckCircle2, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Almacen } from '@/types';

export const WarehouseManagement: React.FC = () => {
    // State management
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'true', 'false'
    const [includeDeleted, setIncludeDeleted] = useState(false);
    
    // Auth & role check
    const [hasWritePermission, setHasWritePermission] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Almacen | null>(null);
    const [warehouseToDelete, setWarehouseToDelete] = useState<Almacen | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        activo: true
    });

    // Check user roles on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && Array.isArray(user.roles)) {
                    const rolesLower = user.roles.map((r: string) => r.toLowerCase());
                    setUserRole(rolesLower.join(', '));
                    setHasWritePermission(rolesLower.some((r: string) => ['admin', 'manager'].includes(r)));
                }
            } catch (e) {
                console.error("Error parsing user roles", e);
            }
        }
    }, []);

    // Dismiss feedback message after 5 seconds
    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => setFeedbackMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    // Fetch Warehouses
    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (statusFilter !== 'all') queryParams.append('activo', statusFilter);
            if (includeDeleted) queryParams.append('incluir_eliminados', 'true');

            const url = `${API_ENDPOINTS.ALMACENES.LIST}?${queryParams.toString()}`;
            const response = await FetchData<{ data: Almacen[] } | Almacen[]>(url);
            
            let list: Almacen[] = [];
            if (response && 'data' in response && Array.isArray(response.data)) {
                list = response.data;
            } else if (Array.isArray(response)) {
                list = response;
            }
            
            setWarehouses(list);
        } catch (error: any) {
            console.error('Failed to fetch warehouses:', error);
            setFeedbackMessage({
                type: 'error',
                text: error.message || 'Error al cargar listado de almacenes.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Debounce search term changes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchWarehouses();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, statusFilter, includeDeleted]);

    // Handle Create Submission
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            setFormError('El nombre es obligatorio.');
            return;
        }

        setActionLoading(true);
        setFormError('');

        try {
            await FetchData(API_ENDPOINTS.ALMACENES.LIST, 'POST', {
                body: {
                    nombre: formData.nombre.trim(),
                    direccion: formData.direccion.trim() || null,
                    telefono: formData.telefono.trim() || null,
                    activo: formData.activo
                }
            });
            
            setFeedbackMessage({
                type: 'success',
                text: 'Almacén creado exitosamente.'
            });
            setIsCreateOpen(false);
            resetForm();
            fetchWarehouses();
        } catch (error: any) {
            console.error('Error creating warehouse:', error);
            setFormError(error.message || 'No se pudo crear el almacén.');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Edit Submission
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWarehouse) return;
        if (!formData.nombre.trim()) {
            setFormError('El nombre es obligatorio.');
            return;
        }

        setActionLoading(true);
        setFormError('');

        try {
            await FetchData(API_ENDPOINTS.ALMACENES.ITEM(selectedWarehouse.id_almacen), 'PATCH', {
                body: {
                    nombre: formData.nombre.trim(),
                    direccion: formData.direccion.trim() || null,
                    telefono: formData.telefono.trim() || null,
                    activo: formData.activo
                }
            });

            setFeedbackMessage({
                type: 'success',
                text: 'Almacén actualizado exitosamente.'
            });
            setIsEditOpen(false);
            setSelectedWarehouse(null);
            resetForm();
            fetchWarehouses();
        } catch (error: any) {
            console.error('Error updating warehouse:', error);
            setFormError(error.message || 'No se pudo actualizar el almacén.');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Delete/Logical Delete
    const handleDeleteConfirm = async () => {
        if (!warehouseToDelete) return;
        setActionLoading(true);

        try {
            await FetchData(API_ENDPOINTS.ALMACENES.ITEM(warehouseToDelete.id_almacen), 'DELETE');
            
            setFeedbackMessage({
                type: 'success',
                text: 'Almacén eliminado (desactivado) exitosamente.'
            });
            setWarehouseToDelete(null);
            fetchWarehouses();
        } catch (error: any) {
            console.error('Error deleting warehouse:', error);
            setFeedbackMessage({
                type: 'error',
                text: error.message || 'No se pudo eliminar el almacén.'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            direccion: '',
            telefono: '',
            activo: true
        });
        setFormError('');
    };

    const openCreateDialog = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const openEditDialog = (warehouse: Almacen) => {
        setSelectedWarehouse(warehouse);
        setFormData({
            nombre: warehouse.nombre || '',
            direccion: warehouse.direccion || '',
            telefono: warehouse.telefono || '',
            activo: warehouse.activo
        });
        setFormError('');
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header section with Title & Role indicators */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                        <Warehouse className="h-6 w-6 text-primary" />
                        Gestión de Almacenes
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Administra y monitorea las ubicaciones físicas y de stock para los inventarios.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                        Rol: <span className="font-semibold capitalize text-foreground">{userRole || 'cargando...'}</span>
                    </span>
                    {hasWritePermission && (
                        <Button onClick={openCreateDialog} className="shadow-lg hover:shadow-primary/20 transition-all duration-200">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Almacén
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-card/50 p-4 rounded-xl border border-border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar por nombre o dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="statusFilter" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                            Filtrar Estado:
                        </Label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex h-9 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">Todos</option>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="includeDeleted"
                            checked={includeDeleted}
                            onChange={(e) => setIncludeDeleted(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="includeDeleted" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                            Incluir eliminados lógicamente
                        </Label>
                    </div>

                    <Button variant="ghost" size="icon" onClick={fetchWarehouses} title="Recargar">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Main table container */}
            <Card className="border border-border shadow-xl bg-card/85 backdrop-blur-sm overflow-hidden">
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0 border-b border-border bg-card/50">
                    <div>
                        <CardTitle className="text-lg">Locales registrados</CardTitle>
                        <CardDescription className="text-xs">Lista completa de bodegas y puntos de despacho.</CardDescription>
                    </div>
                    
                    {feedbackMessage && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border animate-in fade-in slide-in-from-right-1 ${
                            feedbackMessage.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {feedbackMessage.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                            <span className="text-xs font-medium">{feedbackMessage.text}</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Creado</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-48">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm">Cargando almacenes...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : warehouses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-32 text-muted-foreground italic text-sm">
                                            No se encontraron almacenes con los criterios de búsqueda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    warehouses.map((warehouse) => (
                                        <TableRow key={warehouse.id_almacen} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                #{warehouse.id_almacen}
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground">
                                                {warehouse.nombre}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {warehouse.direccion ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        {warehouse.direccion}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Sin dirección</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {warehouse.telefono ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        {warehouse.telefono}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Sin teléfono</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {warehouse.activo ? (
                                                    <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25">
                                                        Activo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25">
                                                        Inactivo
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {warehouse.created_at ? new Date(warehouse.created_at).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    {hasWritePermission ? (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                title="Editar"
                                                                onClick={() => openEditDialog(warehouse)}
                                                                className="hover:text-primary hover:bg-primary/10 h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                title="Eliminar (Desactivar)"
                                                                onClick={() => setWarehouseToDelete(warehouse)}
                                                                className="hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            title="Ver Detalle"
                                                            onClick={() => openEditDialog(warehouse)}
                                                            className="hover:text-primary hover:bg-primary/10 h-8 w-8"
                                                        >
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    )}
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

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleCreateSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-primary" />
                                Crear Nuevo Almacén
                            </DialogTitle>
                            <DialogDescription>
                                Completa el formulario para registrar un nuevo almacén en la red de inventario.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-nombre" className="font-semibold text-sm">
                                    Nombre del Almacén <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Almacén Central de Reparto"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-direccion" className="font-semibold text-sm">
                                    Dirección Física
                                </Label>
                                <Input
                                    id="create-direccion"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    placeholder="Av. Juan Pablo Duarte #45, Santiago"
                                    maxLength={255}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-telefono" className="font-semibold text-sm">
                                    Teléfono de Contacto
                                </Label>
                                <Input
                                    id="create-telefono"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="Ej. 809-555-0100"
                                    maxLength={50}
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="create-activo"
                                    checked={formData.activo}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="create-activo" className="font-medium text-sm cursor-pointer">
                                    Habilitar inmediatamente al crear
                                </Label>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={actionLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading ? 'Guardando...' : 'Crear Almacén'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit / Details Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-primary" />
                                {hasWritePermission ? 'Editar Almacén' : 'Detalles del Almacén'}
                            </DialogTitle>
                            <DialogDescription>
                                {hasWritePermission 
                                    ? 'Modifica los campos del almacén seleccionado.' 
                                    : 'Visualización de datos generales del almacén.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre" className="font-semibold text-sm">
                                    Nombre del Almacén <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Almacén Central de Reparto"
                                    required
                                    disabled={!hasWritePermission}
                                    maxLength={100}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-direccion" className="font-semibold text-sm">
                                    Dirección Física
                                </Label>
                                <Input
                                    id="edit-direccion"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    placeholder="Av. Juan Pablo Duarte #45, Santiago"
                                    disabled={!hasWritePermission}
                                    maxLength={255}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-telefono" className="font-semibold text-sm">
                                    Teléfono de Contacto
                                </Label>
                                <Input
                                    id="edit-telefono"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="Ej. 809-555-0100"
                                    disabled={!hasWritePermission}
                                    maxLength={50}
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="edit-activo"
                                    checked={formData.activo}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                    disabled={!hasWritePermission}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="edit-activo" className="font-medium text-sm cursor-pointer">
                                    Marcar como Activo
                                </Label>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={actionLoading}>
                                {hasWritePermission ? 'Cancelar' : 'Cerrar'}
                            </Button>
                            {hasWritePermission && (
                                <Button type="submit" disabled={actionLoading}>
                                    {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Logical Delete Confirmation AlertDialog */}
            <AlertDialog open={!!warehouseToDelete} onOpenChange={(open) => !open && setWarehouseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            ¿Eliminar Almacén?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción realizará un <strong>borrado lógico</strong> del almacén <strong>{warehouseToDelete?.nombre}</strong>.
                            El registro quedará archivado como inactivo y oculto por defecto, pero se mantendrá su historial en la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={actionLoading}
                            className="bg-destructive hover:bg-destructive/95 text-destructive-foreground"
                        >
                            {actionLoading ? 'Desactivando...' : 'Desactivar y archivar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
