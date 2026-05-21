import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POSSystem } from './POSSystem';
import { ShoppingCart, LayoutGrid, History } from 'lucide-react';

export const SalesManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">Ventas y Facturación</h1>
                    <p className="text-foreground/70 font-medium">Gestiona tus ventas locales y el punto de venta en tiempo real.</p>
                </div>
            </div>

            <Tabs defaultValue="pos" className="w-full">
                <TabsList className="bg-card/60 backdrop-blur-md border border-foreground/10 p-1 shadow-sm mb-6">
                    <TabsTrigger value="pos" className="flex items-center gap-2 font-semibold">
                        <LayoutGrid className="h-4 w-4" /> Terminal de Ventas (POS)
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2 font-semibold">
                        <History className="h-4 w-4" /> Historial de Ventas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pos">
                    <POSSystem />
                </TabsContent>

                <TabsContent value="history">
                    <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl bg-card/20">
                        <div className="text-center space-y-3">
                            <History className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-muted-foreground font-medium">El historial de ventas se cargará automáticamente al finalizar transacciones.</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
