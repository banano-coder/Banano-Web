import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./UserList";
import { CommissionsReport } from "./CommissionsReport";
import { Users, DollarSign } from "lucide-react";

export const UsersManager = () => {
    return (
        <div className="flex flex-col space-y-6">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-extrabold text-foreground drop-shadow-sm font-outfit">Gestión de Usuarios y Comisiones</h1>
                <p className="text-sm text-muted-foreground font-medium font-inter">Administra accesos y calcula el pago de comisiones.</p>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="bg-card/45 border border-border backdrop-blur-md h-12 w-full justify-start rounded-xl p-1 shadow-sm mb-6 flex-wrap lg:flex-nowrap">
                    <TabsTrigger value="list" className="rounded-lg h-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 flex items-center gap-2">
                        <Users className="h-4 w-4" /> Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="commissions" className="rounded-lg h-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Comisiones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="m-0 border-none p-0 outline-none">
                    <UserList />
                </TabsContent>
                
                <TabsContent value="commissions" className="m-0 border-none p-0 outline-none">
                    <CommissionsReport />
                </TabsContent>
            </Tabs>
        </div>
    );
};
