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
    <Card className="overflow-hidden shadow-lg bg-card text-card-foreground flex flex-col h-full transform transition-all hover:scale-105 border border-border">
      <div className="h-32 md:h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
        />
      </div>
      <CardHeader className="p-3 md:p-6">
        <CardTitle className="text-base md:text-xl font-bold text-foreground line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-3 md:p-6 pt-0">
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 md:line-clamp-3">{product.description}</p>
        <p className="text-primary font-bold mt-2 text-sm md:text-base">
          {currency}{formattedPrice}
        </p>
      </CardContent>
      <CardFooter className="p-3 md:p-6 pt-0">
        <Button
          onClick={handleAction}
          variant="secondary"
          className="w-full font-bold h-8 md:h-10 text-xs md:text-sm uppercase tracking-tighter"
        >
          <ShoppingCart className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Ver
        </Button>
      </CardFooter>
    </Card>
  );
};
