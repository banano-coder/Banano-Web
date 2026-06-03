import React, { useState, useEffect } from 'react';
import {
    User, Store, Palette, Bell, Save,
    Loader2, Lock, Shield, Smartphone,
    Mail, Type, CheckCircle2, AlertCircle,
    Plus, Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const COUNTRIES = [
    { name: 'Colombia', code: '57', iso: 'co' },
    { name: 'México', code: '52', iso: 'mx' },
    { name: 'Argentina', code: '54', iso: 'ar' },
    { name: 'Perú', code: '51', iso: 'pe' },
    { name: 'Venezuela', code: '58', iso: 've' },
    { name: 'Chile', code: '56', iso: 'cl' },
    { name: 'Ecuador', code: '593', iso: 'ec' },
    { name: 'España', code: '34', iso: 'es' },
    { name: 'Panamá', code: '507', iso: 'pa' },
    { name: 'Uruguay', code: '598', iso: 'uy' },
    { name: 'Bolivia', code: '591', iso: 'bo' },
    { name: 'Paraguay', code: '595', iso: 'py' },
    { name: 'Costa Rica', code: '506', iso: 'cr' },
    { name: 'Rep. Dominicana', code: '1809', iso: 'do' },
    { name: 'USA/Canadá', code: '1', iso: 'us' },
];

interface ProfileData {
    id_usuario: number;
    nombre: string;
    email: string;
}

interface SettingsData {
    whatsapp?: { numero: string; mensaje_bienvenida: string };
    stock?: { umbral_minimo: number };
    tienda?: {
        nombre: string;
        email_contacto: string;
        abierto: boolean;
        telefono?: string;
        direccion?: string;
        direccion_secundaria?: string;
        direcciones?: string[];
        mostrar_info?: boolean;
        hero_titulo?: string;
        hero_descripcion?: string;
    };
    tema?: { default: string };
    catalogo?: {
        ocultar_sin_stock: boolean;
        modo_etiqueta_stock: 'exacto' | 'generico';
        simbolo_moneda: string;
        mostrar_decimales: boolean;
        porcentaje_incremento_bcv?: number;
    };
}

export const SettingsManager: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [settings, setSettings] = useState<SettingsData>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password change state
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const currentDirecciones = settings.tienda?.direcciones || [
        settings.tienda?.direccion || '',
        ...(settings.tienda?.direccion_secundaria ? [settings.tienda.direccion_secundaria] : [])
    ].filter(Boolean);

    const safeDirecciones = currentDirecciones.length > 0 ? currentDirecciones : [''];

    const handleAddressChange = (index: number, val: string) => {
        const updated = [...safeDirecciones];
        updated[index] = val;
        setSettings(s => ({
            ...s,
            tienda: {
                ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }),
                direcciones: updated,
                direccion: updated[0] || '',
                direccion_secundaria: updated[1] || ''
            }
        }));
    };

    const handleAddAddress = () => {
        const updated = [...safeDirecciones, ''];
        setSettings(s => ({
            ...s,
            tienda: {
                ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }),
                direcciones: updated
            }
        }));
    };

    const handleRemoveAddress = (index: number) => {
        if (safeDirecciones.length <= 1) {
            handleAddressChange(0, '');
            return;
        }
        const updated = safeDirecciones.filter((_, i) => i !== index);
        setSettings(s => ({
            ...s,
            tienda: {
                ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }),
                direcciones: updated,
                direccion: updated[0] || '',
                direccion_secundaria: updated[1] || ''
            }
        }));
    };

    useEffect(() => {
        fetchData();
        // Cargar tema desde localStorage como fallback inicial rápido
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (theme: string) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, settingsRes] = await Promise.all([
                fetch('/api/profile'),
                fetch('/api/settings')
            ]);

            if (profileRes.ok) setProfile(await profileRes.json());
            if (settingsRes.ok) {
                const data = await settingsRes.json();
                setSettings(data);
                if (data.tema?.default) {
                    applyTheme(data.tema.default);
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: profile?.nombre, email: profile?.email })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar perfil' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/profile/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Contraseña actualizada' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Error al cambiar contraseña' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleUpdateSetting = async (clave: string, valor: any) => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clave, valor })
            });

            const data = await res.json();

            if (res.ok) {
                // Actualizar estado local y forzar refetch para sincronizar
                setSettings(prev => ({ ...prev, [clave]: valor }));
                if (clave === 'tema' && valor.default) {
                    applyTheme(valor.default);
                }
                setMessage({ type: 'success', text: `Configuración de ${clave} guardada` });

                // Opcional: recargar datos para estar 100% seguros
                // fetchData(); 
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al guardar configuración' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h2>
                    <p className="text-muted-foreground">Administra tu perfil, la tienda y las preferencias del sistema.</p>
                </div>
                {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-card/30 backdrop-blur-md rounded-xl p-1">
                    <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary">
                        <User className="h-4 w-4" /> Perfil
                    </TabsTrigger>
                    <TabsTrigger value="store" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary">
                        <Store className="h-4 w-4" /> Tienda
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary">
                        <Palette className="h-4 w-4" /> Preferencias
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card/50 backdrop-blur-sm border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground"><Shield className="h-5 w-5 text-primary" /> Información Personal</CardTitle>
                                <CardDescription>Cambia tu nombre y correo electrónico principal.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSaveProfile}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-foreground/80 font-semibold tracking-tight">Nombre</Label>
                                        <div className="relative">
                                            <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                className="pl-9 bg-background/50 border-border text-foreground"
                                                value={profile?.nombre || ''}
                                                onChange={e => setProfile(p => p ? { ...p, nombre: e.target.value } : null)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground/80 font-semibold tracking-tight">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="pl-9 bg-background/50 border-border text-foreground"
                                                value={profile?.email || ''}
                                                onChange={e => setProfile(p => p ? { ...p, email: e.target.value } : null)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button disabled={saving} type="submit" className="w-full">
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Guardar Cambios
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground"><Lock className="h-5 w-5 text-primary" /> Seguridad</CardTitle>
                                <CardDescription>Actualiza tu contraseña periódicamente.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleUpdatePassword}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-semibold tracking-tight">Contraseña Actual</Label>
                                        <Input
                                            type="password"
                                            className="bg-background/50 border-border text-foreground"
                                            value={passwords.current}
                                            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-semibold tracking-tight">Nueva Contraseña</Label>
                                        <Input
                                            type="password"
                                            className="bg-background/50 border-border text-foreground"
                                            value={passwords.new}
                                            onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-semibold tracking-tight">Confirmar Nueva Contraseña</Label>
                                        <Input
                                            type="password"
                                            className="bg-background/50 border-border text-foreground"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button disabled={saving} variant="secondary" type="submit" className="w-full">
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Actualizar Contraseña
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="store" className="space-y-4 mt-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Shield className="h-5 w-5 text-primary" /> Estado de la Tienda
                            </CardTitle>
                            <CardDescription>Controla si el catálogo público está accesible o cerrado por mantenimiento.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-border/60 bg-background/30">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${settings.tienda?.abierto ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-lg font-black uppercase tracking-tight">
                                            {settings.tienda?.abierto ? 'Tienda Activa' : 'Tienda Desactivada'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {settings.tienda?.abierto
                                            ? 'Los clientes pueden ver productos y realizar pedidos.'
                                            : 'El catálogo está oculto para los clientes.'}
                                    </p>
                                </div>
                                <div
                                    onClick={() => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { nombre: '', email_contacto: '' }), abierto: !s.tienda?.abierto } }))}
                                    className={`w-14 h-7 rounded-full transition-all cursor-pointer relative shadow-inner ${settings.tienda?.abierto ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-slate-400 ring-4 ring-slate-400/20'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${settings.tienda?.abierto ? 'translate-x-[1.75rem]' : ''}`} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end bg-muted/30 border-t border-border py-4">
                            <Button onClick={() => handleUpdateSetting('tienda', settings.tienda)} disabled={saving} size="sm" className="font-bold">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Aplicar Estado de Tienda
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground"><Smartphone className="h-5 w-5 text-green-500" /> Configuración de WhatsApp</CardTitle>
                            <CardDescription>Define dónde y cómo recibes los pedidos.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-semibold tracking-tight">Número de WhatsApp</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={(() => {
                                            const full = settings.whatsapp?.numero || '';
                                            const match = [...COUNTRIES]
                                                .sort((a, b) => b.code.length - a.code.length)
                                                .find(c => full.startsWith(c.code));
                                            return match?.code || '57';
                                        })()}
                                        onValueChange={(code) => {
                                            const full = settings.whatsapp?.numero || '';
                                            const prevMatch = [...COUNTRIES]
                                                .sort((a, b) => b.code.length - a.code.length)
                                                .find(c => full.startsWith(c.code));
                                            const numberOnly = prevMatch ? full.slice(prevMatch.code.length) : full;
                                            setSettings(s => ({
                                                ...s,
                                                whatsapp: {
                                                    ...(s.whatsapp || { mensaje_bienvenida: '' }),
                                                    numero: code + numberOnly
                                                }
                                            }));
                                        }}
                                    >
                                        <SelectTrigger className="w-[110px] bg-background/50 border-border text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRIES.map(c => (
                                                <SelectItem key={`${c.code}-${c.name}`} value={c.code}>
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={`https://flagcdn.com/w20/${c.iso}.png`}
                                                            width="20"
                                                            alt={c.name}
                                                            className="rounded-sm"
                                                        />
                                                        <span className="text-xs font-mono">+{c.code}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Número sin el +ni código"
                                        className="flex-1 bg-background/50 border-border text-foreground font-mono"
                                        value={(() => {
                                            const full = settings.whatsapp?.numero || '';
                                            const match = [...COUNTRIES]
                                                .sort((a, b) => b.code.length - a.code.length)
                                                .find(c => full.startsWith(c.code));
                                            return match ? full.slice(match.code.length) : full;
                                        })()}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, ''); // Solo números
                                            const full = settings.whatsapp?.numero || '';
                                            const match = [...COUNTRIES]
                                                .sort((a, b) => b.code.length - a.code.length)
                                                .find(c => full.startsWith(c.code));
                                            const code = match?.code || '57';
                                            setSettings(s => ({
                                                ...s,
                                                whatsapp: {
                                                    ...(s.whatsapp || { mensaje_bienvenida: '' }),
                                                    numero: code + val
                                                }
                                            }));
                                        }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">El número se guardará automáticamente con el prefijo seleccionado.</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-semibold tracking-tight">Mensaje de Bienvenida</Label>
                                <Input
                                    className="bg-background/50 border-border text-foreground"
                                    value={settings.whatsapp?.mensaje_bienvenida || ''}
                                    onChange={e => setSettings(s => ({ ...s, whatsapp: { ...(s.whatsapp || { numero: '' }), mensaje_bienvenida: e.target.value } }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end bg-muted/30 border-t border-border py-4">
                            <Button onClick={() => handleUpdateSetting('whatsapp', settings.whatsapp)} disabled={saving} size="sm">
                                Guardar WhatsApp
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Información Pública de la Tienda</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-semibold tracking-tight">Nombre de la Tienda</Label>
                                <Input
                                    className="bg-background/50 border-border text-foreground"
                                    value={settings.tienda?.nombre || ''}
                                    onChange={e => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { email_contacto: '', abierto: true }), nombre: e.target.value } }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-semibold tracking-tight">Email de Contacto</Label>
                                <Input
                                    className="bg-background/50 border-border text-foreground"
                                    value={settings.tienda?.email_contacto || ''}
                                    onChange={e => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { nombre: '', abierto: true }), email_contacto: e.target.value } }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80 font-semibold tracking-tight">Teléfono de Contacto</Label>
                                <Input
                                    className="bg-background/50 border-border text-foreground"
                                    placeholder="Ej: 300 123 4567"
                                    value={settings.tienda?.telefono || ''}
                                    onChange={e => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }), telefono: e.target.value } }))}
                                />
                            </div>
                            <div className="col-span-full space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-foreground/80 font-semibold tracking-tight">Direcciones de Sucursales / Tienda</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddAddress}
                                        className="h-8 border-primary/30 text-primary hover:bg-primary/10 gap-1.5 font-bold"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Agregar Dirección
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {safeDirecciones.map((dir, idx) => (
                                        <div key={idx} className="flex gap-2 items-end">
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                                                    {idx === 0 ? 'Dirección Principal' : `Dirección Sucursal ${idx}`}
                                                </span>
                                                <Input
                                                    className="bg-background/50 border-border text-foreground"
                                                    placeholder={idx === 0 ? "Ej: Calle 123 #45-67, Ciudad" : "Ej: Avenida Siempre Viva 742, Ciudad"}
                                                    value={dir}
                                                    onChange={e => handleAddressChange(idx, e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveAddress(idx)}
                                                className="h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg flex-shrink-0"
                                                disabled={safeDirecciones.length <= 1 && !dir}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/30 transition-all hover:bg-background/40">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Mostrar en Catálogo</Label>
                                    <p className="text-[10px] text-muted-foreground italic">Mostrar información de contacto (Email, Teléfono, Dirección) en el catálogo.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.tienda?.mostrar_info ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                        {settings.tienda?.mostrar_info ? 'Activado' : 'Desactivado'}
                                    </span>
                                    <div
                                        onClick={() => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }), mostrar_info: !s.tienda?.mostrar_info } }))}
                                        className={`w-11 h-6 rounded-full transition-all cursor-pointer relative shadow-inner ${settings.tienda?.mostrar_info ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.tienda?.mostrar_info ? 'translate-x-5' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full space-y-4 pt-4 border-t border-border/50">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70">Personalización de Bienvenida (Hero)</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-semibold tracking-tight">Título de Tienda</Label>
                                        <Input
                                            className="bg-background/50 border-border text-foreground text-lg font-bold"
                                            placeholder="Ej: Deliciosos Bananos Frescos"
                                            value={settings.tienda?.hero_titulo || ''}
                                            onChange={e => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }), hero_titulo: e.target.value } }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-semibold tracking-tight">Descripción</Label>
                                        <textarea
                                            className="w-full min-h-[100px] p-3 rounded-md bg-background/50 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Ej: La mejor selección de productos derivados del banano..."
                                            value={settings.tienda?.hero_descripcion || ''}
                                            onChange={e => setSettings(s => ({ ...s, tienda: { ...(s.tienda || { nombre: '', email_contacto: '', abierto: true }), hero_descripcion: e.target.value } }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end bg-muted/30 border-t border-border py-4">
                            <Button onClick={() => handleUpdateSetting('tienda', settings.tienda)} disabled={saving} size="sm">
                                Guardar Datos de Tienda
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground"><Store className="h-5 w-5 text-orange-500" /> Configuración del Catálogo</CardTitle>
                            <CardDescription>Personaliza cómo se muestran tus productos al público.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70">Inventario</h4>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/30 transition-all hover:bg-background/40">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Ocultar sin Stock</Label>
                                            <p className="text-[10px] text-muted-foreground italic">No mostrar productos con stock cero.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${settings.catalogo?.ocultar_sin_stock ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                                {settings.catalogo?.ocultar_sin_stock ? 'Activado' : 'Desactivado'}
                                            </span>
                                            <div
                                                onClick={() => setSettings(s => ({ ...s, catalogo: { ...(s.catalogo || { modo_etiqueta_stock: 'exacto', simbolo_moneda: '$', mostrar_decimales: true }), ocultar_sin_stock: !s.catalogo?.ocultar_sin_stock } }))}
                                                className={`w-11 h-6 rounded-full transition-all cursor-pointer relative shadow-inner ${settings.catalogo?.ocultar_sin_stock ? 'bg-primary' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.catalogo?.ocultar_sin_stock ? 'translate-x-5' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Etiquetas de Stock</Label>
                                        <Select
                                            value={settings.catalogo?.modo_etiqueta_stock || 'exacto'}
                                            onValueChange={(val: any) => setSettings(s => ({ ...s, catalogo: { ...(s.catalogo || { ocultar_sin_stock: false, simbolo_moneda: '$', mostrar_decimales: true }), modo_etiqueta_stock: val } }))}
                                        >
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="exacto">Número Exacto (Ej: 15 disponibles)</SelectItem>
                                                <SelectItem value="generico">Genérico (Ej: En Stock / Agotado)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-500/70">Precios</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Símbolo Moneda</Label>
                                            <Input
                                                value={settings.catalogo?.simbolo_moneda || '$'}
                                                onChange={e => setSettings(s => ({ ...s, catalogo: { ...(s.catalogo || { ocultar_sin_stock: false, modo_etiqueta_stock: 'exacto', mostrar_decimales: true }), simbolo_moneda: e.target.value } }))}
                                                className="bg-background/50 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Decimales</Label>
                                            <div className="flex items-center h-10 gap-3 px-3 rounded-lg border border-border/40 bg-background/30 justify-between transition-all hover:bg-background/40">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${settings.catalogo?.mostrar_decimales ? 'text-primary' : 'text-muted-foreground/60'}`}>
                                                    {settings.catalogo?.mostrar_decimales ? 'Activado' : 'Desactivado'}
                                                </span>
                                                <div
                                                    onClick={() => setSettings(s => ({ ...s, catalogo: { ...(s.catalogo || { ocultar_sin_stock: false, modo_etiqueta_stock: 'exacto', simbolo_moneda: '$' }), mostrar_decimales: !s.catalogo?.mostrar_decimales } }))}
                                                    className={`w-11 h-6 rounded-full transition-all cursor-pointer relative shadow-inner ${settings.catalogo?.mostrar_decimales ? 'bg-primary' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.catalogo?.mostrar_decimales ? 'translate-x-5' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                                        Tip: Si tus precios son enteros, desactiva los decimales para una vista más limpia.
                                    </p>
                                    
                                    <div className="border-t border-border/50 pt-4 mt-4 space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Incremento Sin Promo (%)</Label>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="Ej: 15"
                                            value={settings.catalogo?.porcentaje_incremento_bcv ?? ''}
                                            onChange={e => setSettings(s => ({ ...s, catalogo: { ...(s.catalogo || { ocultar_sin_stock: false, modo_etiqueta_stock: 'exacto', mostrar_decimales: true, simbolo_moneda: '$' }), porcentaje_incremento_bcv: e.target.value ? parseFloat(e.target.value) : undefined } }))}
                                            className="bg-background/50 font-bold max-w-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end bg-muted/30 border-t border-border py-4">
                            <Button onClick={() => handleUpdateSetting('catalogo', settings.catalogo)} disabled={saving} size="sm">
                                Guardar Configuración de Catálogo
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card/50 backdrop-blur-sm border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground"><Palette className="h-5 w-5 text-purple-500" /> Tema del Dashboard</CardTitle>
                                <CardDescription>Elige cómo quieres ver tu panel de control.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleUpdateSetting('tema', { default: 'light' })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.tema?.default === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background/50'}`}
                                    >
                                        <div className="w-full h-12 bg-white rounded shadow-inner border" />
                                        <span className={`text-sm font-medium ${settings.tema?.default === 'light' ? 'text-primary' : 'text-foreground'}`}>Light Mode</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdateSetting('tema', { default: 'dark' })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.tema?.default === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background/50'}`}
                                    >
                                        <div className="w-full h-12 bg-slate-800 rounded shadow-inner" />
                                        <span className={`text-sm font-medium ${settings.tema?.default === 'dark' ? 'text-primary' : 'text-foreground'}`}>Dark Mode</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground"><Bell className="h-5 w-5 text-amber-500" /> Inventario y Alertas</CardTitle>
                                <CardDescription>Personaliza los avisos de stock.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-semibold tracking-tight">Umbral de Stock Bajo</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            className="w-24 bg-background/50 border-border text-foreground text-center text-lg font-bold"
                                            value={settings.stock?.umbral_minimo || 5}
                                            onChange={e => setSettings(s => ({ ...s, stock: { umbral_minimo: parseInt(e.target.value) } }))}
                                        />
                                        <p className="text-sm text-muted-foreground leading-tight">Marcar productos como "Críticos" cuando el stock sea menor o igual a este valor.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end bg-muted/30 border-t border-border py-4">
                                <Button onClick={() => handleUpdateSetting('stock', settings.stock)} disabled={saving} size="sm">
                                    Guardar Umbral
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
