import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, removeCartItem, type CartItem } from '@/store/cartStore';
import { Button } from "@/components/ui/button";
import { X, Trash2, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
    const $cartItems = useStore(cartItems);
    const items = Object.values($cartItems);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Global listener to open this dialog (simple event bus alternative)
    useEffect(() => {
        const handleOpen = () => {
            dialogRef.current?.showModal();
        };
        // We can attach this to window for simplicity in this disparate island architecture
        (window as any).openCart = handleOpen; // Or use custom event
        
        // Better: Custom Event
        const openListener = () => dialogRef.current?.showModal();
        window.addEventListener('open-cart', openListener);

        return () => window.removeEventListener('open-cart', openListener);
    }, []);

    const [customerName, setCustomerName] = React.useState(''); // State for user name
    
    // Attempt to load name from localStorage on mount
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.username) setCustomerName(user.username);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }
    }, []);

    const handleCheckout = () => {
        const phoneNumber = import.meta.env.PUBLIC_WHATSAPP_NUMBER || "573001234567"; // Fallback if env missing
        const name = customerName.trim() || "Cliente";
        
        // Format Items
        const itemsList = items.map(item => `   - ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}`).join('\n');
        
        // Format Message
        const message = `*Hola Banano Shop!* 🍌\n\nMi nombre es *${name}* y quisiera hacer el siguiente pedido:\n\n${itemsList}\n\n*Total: $${total.toFixed(2)}*\n\n¿Cómo procedo con el pago?`;
        
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(url, '_blank');
    };

    const closeCart = () => dialogRef.current?.close();

    return (
        <dialog 
            id="cart-dialog"
            ref={dialogRef} 
            className="backdrop:bg-black/50 bg-transparent p-0 w-full md:max-w-md h-full max-h-screen m-0 ml-auto shadow-2xl open:animate-in open:slide-in-from-right-full backdrop:animate-in backdrop:fade-in"
        >
            <div className="bg-card border-l border-border text-card-foreground h-full flex flex-col w-full">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">Tu Canasta</h2>
                    <Button variant="ghost" size="icon" onClick={closeCart} className="text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Tu carrito está vacío.</p>
                            <p className="text-sm mt-2">¡Agrega algunos bananos!</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-secondary/20 p-3 rounded-lg">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm">{item.name}</h3>
                                    <div className="text-primary text-sm font-medium">
                                        ${item.price.toFixed(2)} x {item.quantity}
                                    </div>
                                    <div className="text-muted-foreground text-xs mt-1">
                                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeCartItem(item.id)}
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t border-border bg-card space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                             <label htmlFor="customer-name" className="text-sm font-medium text-muted-foreground">Tu Nombre</label>
                             <input 
                                id="customer-name"
                                type="text" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Escribe tu nombre..."
                                className="w-full bg-background border border-input rounded-md p-2 text-foreground focus:outline-none focus:border-accent"
                             />
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                        <Button 
                            onClick={handleCheckout}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6"
                        >
                            Pedir por WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </dialog>
    );
};
