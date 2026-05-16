import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from './ProductList';
import { ManageTaxonomies } from '../Taxonomies/ManageTaxonomies';
import { InventoryReports } from '../Inventory/InventoryReports';
import { Box, Tags, FileText, UploadCloud } from 'lucide-react';
import { BulkProductUpload } from './BulkProductUpload';

import { API_ENDPOINTS } from '@/services/api';

export const ProductsManagement = () => {
    const [pendingCount, setPendingCount] = React.useState(0);

    React.useEffect(() => {
        const checkPending = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.PRODUCTS.LIST + '/pending');
                if (res.ok) {
                    const data = await res.json();
                    setPendingCount(Array.isArray(data) ? data.length : 0);
                }
            } catch (e) { console.error(e); }
        };
        checkPending();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">Gestión de Inventario</h1>
                    <p className="text-foreground/70 font-medium">Administra tu inventario, marcas y categorías en un solo lugar.</p>
                </div>
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="bg-card/60 backdrop-blur-md border border-foreground/10 p-1 shadow-sm">
                    <TabsTrigger value="inventory" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <Box className="h-4 w-4" /> Productos
                    </TabsTrigger>
                    <TabsTrigger value="taxonomies" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <Tags className="h-4 w-4" /> Categorías y Marcas
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <FileText className="h-4 w-4" /> Reportes
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold relative">
                        <UploadCloud className="h-4 w-4" /> Carga Masiva
                        {pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white"></span>
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-6">
                    <ProductList />
                </TabsContent>

                <TabsContent value="taxonomies" className="mt-6">
                    <ManageTaxonomies />
                </TabsContent>

                <TabsContent value="reports" className="mt-6">
                    <InventoryReports />
                </TabsContent>

                <TabsContent value="bulk" className="mt-6">
                    <BulkProductUpload />
                </TabsContent>
            </Tabs>
        </div>
    );
};
