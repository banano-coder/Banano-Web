import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from './CartConfig';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  settings?: any; // Using any for brevity or import hook types
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, settings }) => {
  const handleAction = () => {
    onSelect(product);
  };

  const currency = settings?.catalogo?.simbolo_moneda || '$';
  const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
  const formattedPrice = showDecimals
    ? product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(product.price).toLocaleString();

  return (
    <div 
      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-slate-100 dark:border-white/5 cursor-pointer"
      onClick={handleAction}
    >
      {/* Contenedor de Imagen Premium */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F8F8] dark:bg-slate-800/50 flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        {/* Badge Flotante (Opcional) */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md text-primary">
              <ShoppingCart className="h-4 w-4" />
           </div>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="p-6 flex flex-col flex-grow text-center">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-1">
          {product.brand || ''}
        </h3>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1">
          {product.name}
        </h2>
        
        <div className="mt-auto pt-2 space-y-3">
          <p className="text-2xl font-extrabold text-primary mb-2">
            <span className="text-sm font-bold align-top mr-1">{currency}</span>
            {formattedPrice}
          </p>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 uppercase tracking-widest text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
            >
              Ver Detalles
            </Button>
            
            <Button
              variant="outline"
              className="w-full rounded-2xl border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold h-12 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                const phone = settings?.whatsapp?.numero || import.meta.env.PUBLIC_WHATSAPP_NUMBER || "";
                const msg = `¡Hola! Me interesa el producto: ${product.name}. ¿Me podrían dar más información? 🍌`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
            >
              <svg viewBox="0 0 448 512" className="w-4 h-4" fill="currentColor">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.6-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
