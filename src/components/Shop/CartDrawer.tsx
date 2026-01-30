import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, type CartItem } from '@/store/cartStore';
import { Button } from "@/components/ui/button";
import { X, Trash2, ArrowRight, Minus, Plus, Loader2, Phone, Mail, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export const CartDrawer: React.FC = () => {
    const { settings } = useSettings();
    const $cartItems = useStore(cartItems);
    const items = Object.values($cartItems);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const [customerName, setCustomerName] = React.useState('');
    const [customerEmail, setCustomerEmail] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.nombre) setCustomerName(user.nombre);
                if (user.email) setCustomerEmail(user.email);
                if (user.telefono) setCustomerPhone(user.telefono);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }

        const openListener = () => dialogRef.current?.showModal();
        window.addEventListener('open-cart', openListener);
        return () => window.removeEventListener('open-cart', openListener);
    }, []);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsSubmitting(true);

        // 1. Prepare Backend Data
        const orderData: any = {
            cliente_nombre: customerName.trim() || "Invitado",
            items: items.map(item => {
                if (item.variantId === undefined) {
                    console.error("CartDrawer: ERROR - Item sin variantId detectado:", item);
                }
                return {
                    id_variante: item.variantId,
                    cantidad: item.quantity
                };
            }),
            nota: ""
        };

        // Add optional fields only if they have values to keep it clean like Postman
        if (customerEmail?.trim()) orderData.cliente_email = customerEmail.trim();
        if (customerPhone?.trim()) orderData.cliente_telefono = customerPhone.trim();

        let backendWaUrl = null;

        // 2. Register Order in Backend
        try {
            const jsonPayload = JSON.stringify(orderData);
            console.log("CartDrawer: Enviando JSON al proxy:", jsonPayload);

            const res = await fetch('/api/guest/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonPayload
            });

            if (res.ok) {
                const data = await res.json();
                backendWaUrl = data.waUrl;
                console.log("Order registered successfully in backend");
            } else {
                console.error("Failed to register order in backend:", await res.text());
            }
        } catch (error) {
            console.error("Network error trying to register order:", error);
        }

        // 3. Clear Cart
        try {
            const mod = await import('@/store/cartStore');
            mod.clearCart();
        } catch (e) {
            console.error("Error clearing cart", e);
        }

        // 4. Redirect to WhatsApp
        if (backendWaUrl) {
            window.open(backendWaUrl, '_blank');
        } else {
            // Fallback to frontend-generated URL if backend fails
            const phoneNumber = settings?.whatsapp?.numero || "573001234567";
            const name = customerName.trim() || "Cliente";
            const currency = settings?.catalogo?.simbolo_moneda || '$';
            const showDecimals = settings?.catalogo?.mostrar_decimales !== false;

            const formatPrice = (p: number) => showDecimals
                ? p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : Math.round(p).toLocaleString();

            const itemsList = items.map(item => `   - ${item.name} (x${item.quantity}): ${currency}${formatPrice(item.price * item.quantity)}`).join('\n');
            const message = settings?.whatsapp?.mensaje_bienvenida
                ? `${settings.whatsapp.mensaje_bienvenida}\n\n${itemsList}\n\n*Total: ${currency}${formatPrice(total)}*`
                : `*Hola Banano Shop!* 🍌\n\nMi nombre es *${name}* e hice un pedido:\n\n${itemsList}\n\n*Total: ${currency}${formatPrice(total)}*\n\n¿Cómo procedo con el pago?`;

            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }

        setIsSubmitting(false);
        dialogRef.current?.close();
    };

    const closeCart = () => dialogRef.current?.close();

    return (
        <dialog
            id="cart-dialog"
            ref={dialogRef}
            className="backdrop:bg-black/50 bg-transparent p-0 w-full md:max-w-md h-full max-h-screen m-0 ml-auto shadow-2xl open:animate-in open:slide-in-from-right-full backdrop:animate-in backdrop:fade-in"
        >
            <div className="bg-card border-l border-border text-card-foreground h-full flex flex-col w-full">
                <div className="p-4 border-b border-border flex justify-between items-center bg-primary/5">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-primary">Tu Canasta</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeCart} className="text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Tu carrito está vacío.</p>
                            <p className="text-sm mt-1">¡Explora el catálogo y agrega bananos!</p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const key = item.variantId ? `${item.id}-${item.variantId}` : item.id;
                            const attrString = item.attributes ? Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ') : '';

                            return (
                                <div key={key} className="flex gap-4 bg-secondary/20 p-3 rounded-lg border border-transparent hover:border-border transition-colors group">
                                    <div className="relative">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md shadow-sm" />
                                        <span className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                            x{item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-sm truncate pr-2">{item.name}</h3>
                                            {attrString && <p className="text-[10px] text-muted-foreground truncate">{attrString}</p>}
                                            {item.sku && <p className="text-[10px] text-muted-foreground/80 mt-0.5">SKU: {item.sku}</p>}
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-primary text-sm font-bold">
                                                {(() => {
                                                    const itemTotal = item.price * item.quantity;
                                                    const currency = settings?.catalogo?.simbolo_moneda || '$';
                                                    const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
                                                    const formatted = showDecimals
                                                        ? itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                        : Math.round(itemTotal).toLocaleString();
                                                    return `${currency}${formatted}`;
                                                })()}
                                            </div>

                                            <div className="flex items-center border border-input rounded-md bg-background shadow-sm h-7 overflow-hidden">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-full w-7 rounded-none hover:bg-muted p-0"
                                                    onClick={() => import('@/store/cartStore').then(mod => mod.updateItemQuantity(String(key), -1))}
                                                >
                                                    {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                                                </Button>
                                                <div className="w-8 text-center text-xs font-semibold select-none">{item.quantity}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-full w-7 rounded-none hover:bg-muted p-0"
                                                    onClick={() => import('@/store/cartStore').then(mod => mod.updateItemQuantity(String(key), 1))}
                                                    disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t border-border bg-card space-y-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                        <div className="space-y-3">
                            <div className="relative group">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Tu Nombre"
                                    className="w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="Tu Email (opcional)"
                                    className="w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="Tu Teléfono (opcional)"
                                    className="w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-muted-foreground font-medium">Subtotal</span>
                            <span className="text-xl font-bold text-primary">
                                {(() => {
                                    const currency = settings?.catalogo?.simbolo_moneda || '$';
                                    const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
                                    const formatted = showDecimals
                                        ? total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : Math.round(total).toLocaleString();
                                    return `${currency}${formatted}`;
                                })()}
                            </span>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={isSubmitting || !customerName.trim()}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <img src="/icons/whatsapp-white.svg" className="w-5 h-5 mr-2" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            )}
                            Pedir por WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        {!customerName.trim() && <p className="text-[10px] text-center text-destructive">Por favor ingresa tu nombre para continuar.</p>}
                    </div>
                )}
            </div>
        </dialog>
    );
};
