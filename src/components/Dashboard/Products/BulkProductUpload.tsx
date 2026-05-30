import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, ChevronRight, FileSpreadsheet, Loader2, Upload, X, PackageCheck, Download, ArrowRight } from 'lucide-react';
import { FetchData } from '@/services/fetch';
import { API_ENDPOINTS } from '@/services/api';
import type { Category, Brand } from '@/types';
import { ProductQueueEditor } from './ProductQueueEditor';

interface ParsedVariant {
  codigo?: string;
  descripcion: string;
  costo: number;
  precio_lista: number;
  stock?: number;
  stock_sucursales?: Record<number, number>;
}

interface ParsedProduct {
  nombre: string;
  categoria_nombre: string;
  marca_nombre?: string;
  variants: ParsedVariant[];
}

interface MappingItem {
  id_categoria: number | null;
  id_marca: number | null;
}

interface MappingState {
  [categoryNameInFile: string]: MappingItem; 
}

export const BulkProductUpload = () => {
  const [step, setStep] = useState<'upload' | 'success_created' | 'queue' | 'finished'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [createdProducts, setCreatedProducts] = useState<{id: number, nombre: string, categoria_sugerida?: string, marca_sugerida?: string}[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);



  const [pendingCount, setPendingCount] = useState(0);
  const [isResuming, setIsResuming] = useState(false);

  useEffect(() => {
    checkPending();
  }, []);

  const checkPending = async () => {
    try {
      const data = await FetchData<any>(API_ENDPOINTS.PRODUCTS.LIST + '/pending');
      if (Array.isArray(data) && data.length > 0) {
        setPendingCount(data.length);
        setCreatedProducts(data);
      } else {
        setPendingCount(0);
      }
    } catch (e) {
      console.error("Error checking pending products", e);
    }
  };

  const handleResume = () => {
    setStep('queue');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const rawResponse = await FetchData<any>(API_ENDPOINTS.BULK.PARSE_FILE, 'POST', {
        body: formData,
      });

      console.log("Raw Response from parse-file:", rawResponse);
      const parsedData = Array.isArray(rawResponse) ? rawResponse : (rawResponse?.products || rawResponse?.data);

      if (parsedData && parsedData.length > 0) {
        // En lugar de Mapeo, creamos directamente los productos base
        const productsToCreate = parsedData.map((p: any) => ({
          ...p,
          id_categoria: null,
          id_marca: null,
        }));
        
        const createRes = await FetchData<any>(API_ENDPOINTS.BULK.CREATE, 'POST', {
          body: { products: productsToCreate }
        });
        
        setCreatedProducts(
          (createRes.createdProducts || []).map((cp: any, idx: number) => ({
            ...cp,
            categoria_sugerida: parsedData[idx]?.categoria_sugerida || parsedData[idx]?.categoria_nombre,
            marca_sugerida: parsedData[idx]?.marca_sugerida || parsedData[idx]?.marca_nombre
          }))
        );
        setStep('success_created');
      } else {
        setMessage({ type: 'error', text: `Error de formato o vacío. Servidor devolvió: ${JSON.stringify(rawResponse)}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al procesar el archivo.' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setStep('upload');
    setCreatedProducts([]);
    setMessage(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {step === 'upload' && (
        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.15)]">
            <FileSpreadsheet className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Carga Masiva Jerárquica</h2>
            
            {pendingCount > 0 && (
              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl max-w-md mx-auto animate-pulse">
                <p className="text-orange-400 font-semibold flex items-center justify-center gap-2">
                   <AlertCircle className="h-4 w-4" /> Tienes {pendingCount} productos sin terminar de editar.
                </p>
                <Button 
                   onClick={handleResume}
                   className="mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 px-6 shadow-lg shadow-orange-900/20"
                >
                   Continuar Edición <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-[10px] text-orange-400/50 mt-2 uppercase tracking-widest font-bold">O sube un nuevo archivo abajo</p>
              </div>
            )}

            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Sube tu inventario para procesar jerarquías. Si dejas la celda de nombre vacía, el sistema asumirá que es otra variante del producto anterior.
            </p>
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-500 border-green-500/20 hover:bg-green-500/5 font-semibold shadow-sm"
                asChild
              >
                <a href="/api/bulk/template" download="plantilla_productos.xlsx">
                  <Download className="h-4 w-4 mr-2 animate-pulse" /> Descargar Plantilla Excel (Multisucursal)
                </a>
              </Button>
            </div>
          </div>

          <div className={`
            mt-8 border-2 border-dashed rounded-xl p-10 transition-all duration-300
            ${file ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}
          `}>
            <input
              type="file"
              id="bulk-file"
              className="hidden"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
            />
            <label htmlFor="bulk-file" className="cursor-pointer flex flex-col items-center gap-4">
              <Upload className={`h-12 w-12 ${file ? 'text-primary' : 'text-muted-foreground'} animate-bounce`} />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {file ? file.name : 'Haz clic para seleccionar o arrastra un archivo'}
                </p>
                <p className="text-sm text-muted-foreground">Formatos soportados: .xlsx, .xls, .csv</p>
              </div>
              {file && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                >
                  <X className="h-4 w-4 mr-2" /> Quitar archivo
                </Button>
              )}
            </label>
          </div>

          <div className="pt-4 flex justify-center">
            <Button 
              size="lg" 
              className="px-12 font-bold shadow-lg shadow-primary/20 h-12"
              disabled={!file || loading}
              onClick={handleParse}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
              Procesar Archivo
            </Button>
          </div>
          
          <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <h4 className="font-bold text-sm text-primary mb-1">Columnas Requeridas</h4>
              <p className="text-xs text-muted-foreground">codigo (opcional), nombre, descripcion (atributo variante), costo, precio_lista, [Nombres de Sucursales], categoria_nombre, marca_nombre (opcional)</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <h4 className="font-bold text-sm text-primary mb-1">Mapeo Completo</h4>
              <p className="text-xs text-muted-foreground">Deberás asociar la Marca y la Categoría antes de registrar finalmente.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <h4 className="font-bold text-sm text-primary mb-1">Cero Redundancia</h4>
              <p className="text-xs text-muted-foreground">Deja en blanco la celda de nombre para agregar otra variante al perfume anterior.</p>
            </div>
          </div>
        </div>
      )}

      {step === 'success_created' && (
        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-10 max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm mb-2">¡Productos Creados!</h2>
            <p className="text-muted-foreground text-lg">
              Se han registrado {createdProducts.length} productos base.
            </p>
          </div>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl max-h-[250px] overflow-y-auto p-2 space-y-2 custom-scrollbar text-left">
            {createdProducts.map((p, idx) => (
               <div key={p.id} className="p-3 bg-card border border-white/5 rounded-lg flex items-center">
                  <span className="text-muted-foreground font-mono text-sm mr-4">#{idx + 1}</span>
                  <span className="font-bold text-foreground truncate">{p.nombre}</span>
               </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
             <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-1/2 border-white/10 font-bold"
                onClick={reset}
             >
                Cargar más
             </Button>
             <Button 
                size="lg" 
                className="w-full sm:w-1/2 shadow-xl shadow-primary/20 font-bold bg-slate-800 hover:bg-slate-700 text-white"
                onClick={() => setStep('queue')}
             >
                Editar en Cola <ArrowRight className="h-4 w-4 ml-2" />
             </Button>
          </div>
        </div>
      )}

      {step === 'queue' && (
        <ProductQueueEditor 
            createdProducts={createdProducts} 
            onFinish={() => setStep('finished')} 
        />
      )}

      {step === 'finished' && (
        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Proceso Completado</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-lg">
              Los productos y sus jerarquías de variantes han sido registrados exitosamente.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" variant="outline" className="font-bold border-white/10" onClick={reset}>
               Cargar otro archivo
            </Button>
            <Button size="lg" className="font-bold shadow-lg shadow-primary/20 px-8" onClick={() => window.location.reload()}>
               Ir al inventario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
