import React from 'react';
import { Button } from "@/components/ui/button";
import { useStore } from '@nanostores/react';
import { cartItems } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

export const CartWidget: React.FC = () => {
  const $cartItems = useStore(cartItems);
  const totalItems = Object.values($cartItems).reduce((acc, item) => acc + item.quantity, 0);

  const handleClick = () => {
      // Dispatch custom event to open the shared drawer
      window.dispatchEvent(new CustomEvent('open-cart'));
  };

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <Button 
        onClick={handleClick}
        className="rounded-full w-16 h-16 bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 relative"
      >
        <ShoppingCart className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
          {totalItems}
        </span>
      </Button>
    </div>
  );
};
