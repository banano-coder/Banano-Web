import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from './ProductList';
import { ManageTaxonomies } from '../Taxonomies/ManageTaxonomies';
import { Box, Tags, UploadCloud, Barcode, PackagePlus } from 'lucide-react';
import { BulkProductUpload } from './BulkProductUpload';
import { LabelGenerator } from './LabelGenerator';
import { BatchStockEntry } from '../Inventory/BatchStockEntry';

import { API_ENDPOINTS } from '@/services/api';

export const ProductsManagement = () => {
    const [pendingCount, setPendingCount] = React.useState(0);
    const [activeTab, setActiveTab] = React.useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('inventory_active_tab') || 'inventory';
        }
        return 'inventory';
    });

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

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        localStorage.setItem('inventory_active_tab', val);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">Gestión de Inventario</h1>
                    <p className="text-foreground/70 font-medium">Administra tu inventario, marcas y categorías en un solo lugar.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-card/60 backdrop-blur-md border border-foreground/10 p-1 shadow-sm">
                    <TabsTrigger value="inventory" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <Box className="h-4 w-4" /> Productos
                    </TabsTrigger>
                    <TabsTrigger value="taxonomies" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <Tags className="h-4 w-4" /> Categorías y Marcas
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
                    <TabsTrigger value="batch-stock" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <PackagePlus className="h-4 w-4" /> Ingreso por Lote
                    </TabsTrigger>
                    <TabsTrigger value="labels" className="flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
                        <Barcode className="h-4 w-4" /> Generar Etiquetas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-6">
                    <ProductList />
                </TabsContent>

                <TabsContent value="taxonomies" className="mt-6">
                    <ManageTaxonomies />
                </TabsContent>

                <TabsContent value="bulk" className="mt-6">
                    <BulkProductUpload />
                </TabsContent>

                <TabsContent value="batch-stock" className="mt-6">
                    <BatchStockEntry />
                </TabsContent>

                <TabsContent value="labels" className="mt-6">
                    <LabelGenerator />
                </TabsContent>
            </Tabs>
        </div>
    );
};

