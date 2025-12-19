import React, { useState } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';

interface ChangePasswordDialogProps {
    open: boolean;
    onClose: () => void;
    user: { id_usuario: string; nombre: string } | null;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose, user }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!user) return;

        setLoading(true);
        setError('');

        try {
            await FetchData(API_ENDPOINTS.USERS.UPDATE(user.id_usuario, 'password'), 'PATCH', {
                body: { password }
            });
            onClose();
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Error actualizando password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Ingrese la nueva contraseña para el usuario <strong>{user?.nombre}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-password" className="text-right">
                                Nueva
                            </Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="confirm-password" className="text-right">
                                Confirmar
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="col-span-3"
                                required
                            />
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
