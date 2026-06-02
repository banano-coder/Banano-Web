import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ShieldAlert, CheckCircle2, XCircle, Clock, Check, X, Eye } from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';

interface RequestItem {
    id_solicitud: number;
    id_usuario_solicitante: number;
    tipo_accion: string;
    target_id: number;
    target_nombre: string;
    motivo: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    id_usuario_autorizador?: number;
    comentario_autorizador?: string;
    fecha_creacion: string;
    fecha_resolucion?: string;
    solicitante_nombre: string;
    solicitante_email: string;
    autorizador_nombre?: string;
    payload?: any;
}

export const AuthorizationRequests: React.FC = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterEstado, setFilterEstado] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');

    // Response Modal State
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await FetchData<any>(`${API_ENDPOINTS.SOLICITUDES.LIST}?estado=${filterEstado}`);
            const dataList = res?.data || res || [];
            setRequests(dataList);
        } catch (e) {
            console.error("Error fetching authorization requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterEstado]);

    const handleResolve = async (action: 'aprobado' | 'rechazado') => {
        if (!selectedRequest) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await FetchData<any>(API_ENDPOINTS.SOLICITUDES.RESPOND(selectedRequest.id_solicitud), 'POST', {
                body: {
                    estado: action,
                    comentario_autorizador: comment
                }
            });

            setSuccessMessage(`Solicitud ${action === 'aprobado' ? 'aprobada y ejecutada' : 'rechazada'} correctamente.`);
            setSelectedRequest(null);
            setComment('');
            fetchRequests();

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Error al responder a la solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    const getActionBadge = (type: string) => {
        switch (type) {
            case 'ELIMINAR_PRODUCTO':
                return <Badge className="bg-red-500 hover:bg-red-600 font-bold text-[10px]">Eliminar Producto</Badge>;
            case 'ELIMINAR_VARIANTE':
                return <Badge className="bg-orange-500 hover:bg-orange-600 font-bold text-[10px]">Eliminar Variante</Badge>;
            case 'REGISTRAR_SALIDA':
                return <Badge className="bg-amber-500 hover:bg-amber-600 font-bold text-[10px]">Salida Stock</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pendiente':
                return <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />;
            case 'aprobado':
                return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />;
            case 'rechazado':
                return <XCircle className="h-4.5 w-4.5 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                    <span className="text-xs font-semibold">{successMessage}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 backdrop-blur-md border border-border p-4 rounded-xl">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        Solicitudes de Autorización
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                        Revisa y aprueba o rechaza solicitudes de eliminación enviadas por vendedores.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        size="sm" 
                        variant={filterEstado === 'pendiente' ? 'default' : 'outline'} 
                        onClick={() => setFilterEstado('pendiente')}
                        className="text-xs font-bold"
                    >
                        Pendientes
                    </Button>
                    <Button 
                        size="sm" 
                        variant={filterEstado === 'aprobado' ? 'default' : 'outline'} 
                        onClick={() => setFilterEstado('aprobado')}
                        className="text-xs font-bold"
                    >
                        Aprobadas
                    </Button>
                    <Button 
                        size="sm" 
                        variant={filterEstado === 'rechazado' ? 'default' : 'outline'} 
                        onClick={() => setFilterEstado('rechazado')}
                        className="text-xs font-bold"
                    >
                        Rechazadas
                    </Button>
                </div>
            </div>

            <Card className="bg-card/65 backdrop-blur-md border border-border shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Solicitante</TableHead>
                                    <TableHead>Acción</TableHead>
                                    <TableHead>Item Objetivo</TableHead>
                                    <TableHead className="w-[300px]">Motivo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    {filterEstado !== 'pendiente' && <TableHead>Resuelto por</TableHead>}
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="p-12 text-center text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                            Cargando solicitudes...
                                        </TableCell>
                                    </TableRow>
                                ) : requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="p-12 text-center text-muted-foreground italic">
                                            No hay solicitudes {filterEstado === 'pendiente' ? 'pendientes' : filterEstado === 'aprobado' ? 'aprobadas' : 'rechazadas'}.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map(r => (
                                        <TableRow key={r.id_solicitud} className="hover:bg-muted/10 transition-colors">
                                            <TableCell className="font-semibold text-foreground">
                                                <div>{r.solicitante_nombre}</div>
                                                <div className="text-[10px] text-muted-foreground font-normal">{r.solicitante_email}</div>
                                            </TableCell>
                                            <TableCell>{getActionBadge(r.tipo_accion)}</TableCell>
                                            <TableCell className="font-mono text-xs text-foreground/90 font-bold">
                                                {r.target_nombre} <span className="text-[10px] text-muted-foreground font-normal font-sans">(ID: {r.target_id})</span>
                                            </TableCell>
                                            <TableCell className="text-xs text-foreground/80 max-w-[300px] truncate" title={r.motivo}>
                                                {r.motivo}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-medium text-xs">
                                                {new Date(r.fecha_creacion).toLocaleDateString()}
                                            </TableCell>
                                            {filterEstado !== 'pendiente' && (
                                                <TableCell className="font-medium text-xs">
                                                    <div>{r.autorizador_nombre || 'Sistema'}</div>
                                                    {r.comentario_autorizador && (
                                                        <div className="text-[10px] text-muted-foreground italic max-w-[150px] truncate" title={r.comentario_autorizador}>
                                                            "{r.comentario_autorizador}"
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                {r.estado === 'pendiente' ? (
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 text-xs font-bold gap-1 bg-slate-800 hover:bg-slate-700 text-white"
                                                        onClick={() => setSelectedRequest(r)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Resolver
                                                    </Button>
                                                ) : (
                                                    <div className="flex justify-end items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                                                        {getStatusIcon(r.estado)}
                                                        <span className={r.estado === 'aprobado' ? 'text-emerald-500' : 'text-red-500'}>
                                                            {r.estado}
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Resolve Request Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-[480px] bg-card border border-border backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            Resolver Solicitud de Autorización
                        </DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4 py-2">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-semibold">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs bg-muted/30 p-3.5 rounded-xl border border-border/40">
                                <div>
                                    <span className="text-muted-foreground font-semibold">Solicitante:</span>
                                    <div className="font-bold text-foreground mt-0.5">{selectedRequest.solicitante_nombre}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-semibold">Fecha envío:</span>
                                    <div className="font-bold text-foreground mt-0.5">{new Date(selectedRequest.fecha_creacion).toLocaleString()}</div>
                                </div>
                                <div className="col-span-2 border-t border-border/40 pt-2.5">
                                    <span className="text-muted-foreground font-semibold">Acción solicitada:</span>
                                    <div className="mt-1 flex items-center gap-2">
                                        {getActionBadge(selectedRequest.tipo_accion)}
                                        <span className="font-mono font-bold text-foreground">{selectedRequest.target_nombre}</span>
                                    </div>
                                </div>
                                {selectedRequest.tipo_accion === 'REGISTRAR_SALIDA' && (() => {
                                    const payload = typeof selectedRequest.payload === 'string'
                                        ? JSON.parse(selectedRequest.payload || '{}')
                                        : (selectedRequest.payload || {});
                                    const cantidades = payload.cantidades || {};
                                    return (
                                        <div className="col-span-2 border-t border-border/40 pt-2.5">
                                            <span className="text-muted-foreground font-semibold">Cantidades solicitadas a restar por almacén:</span>
                                            <div className="mt-1.5 space-y-1 bg-background border border-border/60 rounded-lg p-2.5">
                                                {Object.entries(cantidades).map(([whId, qty]) => (
                                                    <div key={whId} className="flex justify-between items-center text-xs">
                                                        <span className="font-semibold text-foreground/80">Almacén #{whId}:</span>
                                                        <span className="font-bold text-red-500 font-mono">-{String(qty)} unidades</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div className="col-span-2 border-t border-border/40 pt-2.5">
                                    <span className="text-muted-foreground font-semibold">Explicación / Motivo del vendedor:</span>
                                    <div className="mt-1 p-2.5 bg-background border border-border/60 rounded-lg text-foreground italic leading-relaxed">
                                        "{selectedRequest.motivo}"
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground">Comentario de Respuesta (Opcional)</label>
                                <Textarea 
                                    placeholder="Ej: Aprobado porque se descontinuó, Rechazado porque aún hay stock en sistema..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    rows={3}
                                    className="text-sm bg-background border-border/60"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-row justify-between sm:justify-between items-center border-t pt-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setSelectedRequest(null)}
                            disabled={submitting}
                        >
                            Cerrar
                        </Button>
                        <div className="flex gap-2">
                            <Button 
                                variant="destructive" 
                                className="font-bold gap-1 h-9 text-xs"
                                disabled={submitting}
                                onClick={() => handleResolve('rechazado')}
                            >
                                <X className="h-4 w-4" /> Rechazar
                            </Button>
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 h-9 text-xs"
                                disabled={submitting}
                                onClick={() => handleResolve('aprobado')}
                            >
                                <Check className="h-4 w-4" /> Aprobar y Ejecutar
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
