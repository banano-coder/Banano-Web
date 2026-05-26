import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Almacen } from '@/types';

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ onUserCreated }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<Almacen[]>([]);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'viewer',
        id_almacen: 'none'
    });
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
                console.error("Error fetching warehouses in CreateUserDialog", err);
            }
        };
        if (open) {
            fetchWarehouses();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                id_almacen: formData.id_almacen === 'none' ? null : parseInt(formData.id_almacen, 10)
            };
            await FetchData(API_ENDPOINTS.USERS.CREATE, 'POST', {
                body: payload
            });
            setOpen(false);
            setFormData({ nombre: '', email: '', password: '', rol: 'viewer', id_almacen: 'none' });
            onUserCreated();
        } catch (err: any) {
            setError(err.message || 'Error creating user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del nuevo usuario.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombre" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rol" className="text-right">
                                Rol
                            </Label>
                            <div className="col-span-3">
                                <select 
                                    id="rol"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="vendedor">Vendedor</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="create-almacen" className="text-right">
                                Sucursal
                            </Label>
                            <div className="col-span-3">
                                <select 
                                    id="create-almacen"
                                    value={formData.id_almacen}
                                    onChange={(e) => setFormData({ ...formData, id_almacen: e.target.value })}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="none">Todas (Admin/Central)</option>
                                    {warehouses.map(w => (
                                        <option key={w.id_almacen} value={w.id_almacen.toString()}>
                                            {w.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
