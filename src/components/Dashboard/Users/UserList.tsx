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
    Search, Key, Settings, Ban, CheckCircle, ChevronLeft, ChevronRight, Trash, Trash2,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { EditRoleDialog } from './EditRoleDialog';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';

interface User {
    id_usuario: string;
    nombre: string;
    email: string;
    roles: string[];
    activo: boolean;
}

interface UsersApiResponse {
    data: User[];
    page: number;
    limit: number;
    total: number;
}

export const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
    const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
    const [userToToggleStatus, setUserToToggleStatus] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null); // For Hard Delete
    const [statusLoading, setStatusLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);


    const handleHardDelete = async () => {
        if (!userToDelete) return;
        setStatusLoading(true);
        try {
            await FetchData(API_ENDPOINTS.USERS.DELETE(userToDelete.id_usuario), 'DELETE');
            setMessage({ type: 'success', text: 'Usuario eliminado permanentemente.' });
            await fetchUsers();
            setUserToDelete(null);
        } catch (error: any) {
            console.error('Error deleting user:', error);
            setMessage({
                type: 'error',
                text: error.message || 'No se pudo eliminar el usuario. Puede que tenga registros asociados.'
            });
        } finally {
            setStatusLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            if (searchTerm) queryParams.append('search', searchTerm);

            // Using the centralized API endpoint
            const url = `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`;

            const data = await FetchData<UsersApiResponse>(url);

            if (data && Array.isArray(data.data)) {
                setUsers(data.data);
                // Calculate total pages based on total records and limit
                setTotalPages(Math.ceil(data.total / data.limit) || 1);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // In case of error, we can optionally clear users or keep previous data 
            // setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            // Reset to page 1 if search changes
            if (page !== 1 && searchTerm !== '') {
                setPage(1);
            } else {
                fetchUsers();
            }
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Fetch on page change (skip if triggered by search reset which handles it)
    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleToggleStatus = async () => {
        if (!userToToggleStatus) return;
        setStatusLoading(true);
        try {
            await FetchData(API_ENDPOINTS.USERS.UPDATE(userToToggleStatus.id_usuario, 'status'), 'PATCH', {
                body: { activo: !userToToggleStatus.activo }
            });
            await fetchUsers(); // Refresh list to show new status
            setUserToToggleStatus(null);
        } catch (error) {
            console.error('Error toggling user status:', error);
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
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <CreateUserDialog onUserCreated={fetchUsers} />
            </div>

            <Card>
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">Usuarios del Sistema</CardTitle>
                    {message && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border animate-in fade-in slide-in-from-right-1 ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                            <span className="text-xs font-medium">{message.text}</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No se encontraron usuarios.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id_usuario}>
                                        <TableCell className="font-medium">{user.nombre}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'viewer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.activo ? (
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
                                                    title="Cambiar Password"
                                                    onClick={() => setSelectedUserForPassword(user)}
                                                >
                                                    <Key className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title="Editar Rol"
                                                    onClick={() => setSelectedUserForRole(user)}
                                                >
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title={user.activo ? "Desactivar" : "Activar"}
                                                    onClick={() => setUserToToggleStatus(user)}
                                                >
                                                    {user.activo ? (
                                                        <Ban className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title="Eliminar permanentemente"
                                                    onClick={() => setUserToDelete(user)}
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

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || loading}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ChangePasswordDialog
                open={!!selectedUserForPassword}
                onClose={() => setSelectedUserForPassword(null)}
                user={selectedUserForPassword}
            />

            <EditRoleDialog
                open={!!selectedUserForRole}
                onClose={() => setSelectedUserForRole(null)}
                onUserUpdated={fetchUsers}
                user={selectedUserForRole}
            />

            <AlertDialog open={!!userToToggleStatus} onOpenChange={() => setUserToToggleStatus(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {userToToggleStatus?.activo ? '¿Desactivar usuario?' : '¿Activar usuario?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas {userToToggleStatus?.activo ? 'desactivar' : 'activar'} al usuario <strong>{userToToggleStatus?.nombre}</strong>?
                            {userToToggleStatus?.activo && " El usuario no podrá acceder al sistema."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={statusLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleStatus} disabled={statusLoading} className={userToToggleStatus?.activo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>
                            {statusLoading ? 'Procesando...' : (userToToggleStatus?.activo ? 'Desactivar' : 'Activar')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!userToDelete} onOpenChange={(val) => !val && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar usuario de forma permanente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará al usuario <strong>{userToDelete?.nombre}</strong> del sistema. Esta acción no se puede deshacer.
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
        </div >
    );
};
