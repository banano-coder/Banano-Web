import { map } from 'nanostores';

export interface CartItem {
  id: string;
  variantId?: number;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  maxStock: number;
  image: string;
  attributes?: Record<string, string>;
}

export const cartItems = map<Record<string, CartItem>>({});

export function addCartItem(item: Omit<CartItem, 'quantity'>, amount: number = 1) {
  // Configurable: check maxStock
  if (item.maxStock !== undefined && item.maxStock <= 0) {
    alert("No hay stock disponible para este producto.");
    return;
  }

  // Key strategy: if variantId exists, use `${id}-${variantId}`, else just `${id}`
  const key = (item.variantId !== undefined) ? `${item.id}-${item.variantId}` : item.id;

  const existingItem = cartItems.get()[key];
  if (existingItem) {
    if (existingItem.quantity + amount > item.maxStock) {
      alert(`Solo quedan ${item.maxStock} unidades en stock.`);
      return;
    }
    cartItems.setKey(key, {
      ...existingItem,
      quantity: existingItem.quantity + amount,
    });
  } else {
    // We already checked maxStock > 0 above (if logic called)
    // But verify amount vs maxStock for new item too
    if (amount > item.maxStock) {
      alert(`Solo quedan ${item.maxStock} unidades en stock.`);
      return;
    }

    cartItems.setKey(key, {
      ...item,
      quantity: amount,
    });
  }
}

export function removeCartItem(key: string) {
  const existingItem = cartItems.get()[key];
  if (existingItem) {
    if (existingItem.quantity > 1) {
      // If we want "remove" to just decrement, we'd do this,
      // but "trash" icon usually means "delete all".
      // The new UI will have explicit +/- buttons. 
      // Let's keep this as "delete all" for the trash icon usage, 
      // but actually the trash icon logic in new UI might differ.
      // Let's just remove it entirely.
      const current = cartItems.get();
      const { [key]: _, ...rest } = current;
      cartItems.set(rest);
    } else {
      // Already logic for remove
      const current = cartItems.get();
      const { [key]: _, ...rest } = current;
      cartItems.set(rest);
    }
  }
}

export function updateItemQuantity(key: string, delta: number) {
  const existingItem = cartItems.get()[key];
  if (!existingItem) return;

  const newQty = existingItem.quantity + delta;

  if (newQty <= 0) {
    // Remove item if quantity goes to 0 or less
    const current = cartItems.get();
    const { [key]: _, ...rest } = current;
    cartItems.set(rest);
    return;
  }

  if (existingItem.maxStock && newQty > existingItem.maxStock) {
    alert(`Solo quedan ${existingItem.maxStock} unidades en stock.`);
    return;
  }

  cartItems.setKey(key, { ...existingItem, quantity: newQty });
}

export function clearCart() {
  cartItems.set({});
}
