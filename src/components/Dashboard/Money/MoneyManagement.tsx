import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins } from 'lucide-react';

export const MoneyManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dinero y Caja</h1>
          <p className="text-muted-foreground">Gestión de flujo de caja, ingresos y egresos.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-bold uppercase tracking-widest">
          En Desarrollo
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Efectivo en Caja</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Esperando integración...</p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full border-dashed">
        <CardHeader>
          <CardTitle>Movimientos de Caja</CardTitle>
          <CardDescription>Aquí aparecerá el histórico de entradas y salidas de dinero.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center border-t">
          <div className="text-center space-y-2">
             <div className="p-4 bg-primary/5 rounded-full inline-block">
                <Coins className="h-8 w-8 text-primary/40" />
             </div>
             <p className="text-muted-foreground italic">El módulo de dinero se activará en la próxima fase.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
