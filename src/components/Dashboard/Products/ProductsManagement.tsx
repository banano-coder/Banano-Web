import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from './ProductList';
import { ManageTaxonomies } from '../Taxonomies/ManageTaxonomies';
import { InventoryReports } from '../Inventory/InventoryReports';
import { Box, Tags, FileText } from 'lucide-react';

export const ProductsManagement = () => {
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
            </Tabs>
        </div>
    );
};
