import React, { useEffect, useState } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
    id_usuario: string;
    nombre: string;
    email: string;
    roles: string[];
}

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    panelName: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles, panelName }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    if (!isLoaded) return null;

    if (!user) {
        return (
            <Card className="max-w-md mx-auto mt-12 border-dashed border-2">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <LogIn className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle>Sesión requerida</CardTitle>
                    <CardDescription>
                        Debes iniciar sesión para acceder al panel de {panelName}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={() => window.location.href = '/login'}>
                        Ir al Login
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const hasPermission = user.roles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
        return (
            <Card className="max-w-2xl mx-auto mt-12 border-red-200 bg-red-50/30">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-900 font-bold">Acceso Denegado</CardTitle>
                    <CardDescription className="text-red-700 text-base">
                        Lo sentimos, no tienes los permisos necesarios para ver el panel de <strong>{panelName}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center pb-8">
                    <div className="p-4 bg-white/50 rounded-lg border border-red-100 flex flex-col gap-2">
                        <p className="text-sm text-red-800">
                            Esta sección está restringida exclusivamente para:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {allowedRoles.map(role => (
                                <span key={role} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                        Tu rol actual es: <span className="font-semibold text-foreground uppercase">{user.roles.join(', ') || 'sin rol'}</span>
                    </p>
                    <div className="pt-4">
                        <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                            Volver al Inicio
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <>{children}</>;
};
