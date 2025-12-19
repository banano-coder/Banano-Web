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

interface EditRoleDialogProps {
    open: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
    user: { id_usuario: string; nombre: string; roles: string[] } | null;
}

const AVAILABLE_ROLES = [
    { id: 'viewer', label: 'Viewer' },
    { id: 'vendedor', label: 'Vendedor' },
    { id: 'manager', label: 'Manager' },
    { id: 'admin', label: 'Admin' },
];

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({ open, onClose, onUserUpdated, user }) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.roles && user.roles.length > 0) {
            setSelectedRole(user.roles[0]);
        } else {
            setSelectedRole('viewer');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            // Send as array to maintain API compatibility, but with single element
            await FetchData(API_ENDPOINTS.USERS.UPDATE(user.id_usuario, 'roles'), 'PATCH', {
                body: { roles: [selectedRole] }
            });
            onUserUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error actualizando roles');
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

