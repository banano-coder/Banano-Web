import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';

import type { Almacen } from '@/types';

interface EditRoleDialogProps {
    open: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
    user: { id_usuario: string; nombre: string; roles: string[]; id_almacen?: number | null } | null;
}

const AVAILABLE_ROLES = [
    { id: 'viewer', label: 'Viewer' },
    { id: 'vendedor', label: 'Vendedor' },
    { id: 'manager', label: 'Manager' },
    { id: 'admin', label: 'Admin' },
];

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({ open, onClose, onUserUpdated, user }) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('none');
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await FetchData<{ data: Almacen[] } | Almacen[]>(`${API_ENDPOINTS.ALMACENES.LIST}?activo=true`);
                let list: Almacen[] = [];
                if (response && 'data' in response && Array.isArray(response.data)) {
                    list = response.data;
                } else if (Array.isArray(response)) {
                    list = response;
                }
                setWarehouses(list);
            } catch (err) {
                console.error("Error fetching warehouses in EditRoleDialog", err);
            }
        };
        if (open) {
            fetchWarehouses();
        }
    }, [open]);

    useEffect(() => {
        if (user) {
            if (user.roles && user.roles.length > 0) {
                setSelectedRole(user.roles[0]);
            } else {
                setSelectedRole('viewer');
            }

            if (user.id_almacen != null) {
                setSelectedWarehouse(user.id_almacen.toString());
            } else {
                setSelectedWarehouse('none');
            }
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            const warehouseVal = selectedWarehouse === 'none' ? null : parseInt(selectedWarehouse, 10);

            // Parallel updates: Roles and Warehouse
            await Promise.all([
                FetchData(API_ENDPOINTS.USERS.UPDATE(user.id_usuario, 'roles'), 'PATCH', {
                    body: { roles: [selectedRole] }
                }),
                FetchData(`/api/users/${user.id_usuario}/warehouse`, 'PATCH', {
                    body: { id_almacen: warehouseVal }
                })
            ]);

            onUserUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error actualizando roles o sucursal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Roles</DialogTitle>
                        <DialogDescription>
                            Seleccione el rol para el usuario <strong>{user?.nombre}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="role-select">Rol asignado</Label>
                             <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger id="role-select" className="w-full">
                                    <SelectValue placeholder="Seleccione un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ROLES.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="warehouse-select">Sucursal / Almacén de Trabajo</Label>
                             <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                <SelectTrigger id="warehouse-select" className="w-full">
                                    <SelectValue placeholder="Seleccione una sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Todas (Admin/Central)</SelectItem>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id_almacen} value={w.id_almacen.toString()}>
                                            {w.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

