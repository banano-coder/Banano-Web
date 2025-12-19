import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from './CartConfig';
import { addCartItem } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleAddToCart = () => {
    addCartItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-card text-card-foreground flex flex-col h-full transform transition-all hover:scale-105 border border-border">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
        <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Agregar
        </Button>
      </CardFooter>
    </Card>
  );
};
