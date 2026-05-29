import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryReports } from './InventoryReports';
import { SalesProfitReports } from './SalesProfitReports';
import { Box, BarChart3, LineChart, DollarSign } from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="bg-card/60 backdrop-blur-md border border-border p-1 shadow-sm mb-6">
                    <TabsTrigger value="inventory" className="flex items-center gap-2 font-semibold text-xs">
                        <Box className="h-3.5 w-3.5" /> Reportes de Inventario
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex items-center gap-2 font-semibold text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-primary" /> Ventas y Ganancias
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="outline-none focus:outline-none">
                    <InventoryReports />
                </TabsContent>

                <TabsContent value="sales" className="outline-none focus:outline-none">
                    <SalesProfitReports />
                </TabsContent>
            </Tabs>
        </div>
    );
};
