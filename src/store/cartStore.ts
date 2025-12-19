import { map } from 'nanostores';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export const cartItems = map<Record<string, CartItem>>({});

export function addCartItem(item: Omit<CartItem, 'quantity'>) {
  const existingItem = cartItems.get()[item.id];
  if (existingItem) {
    cartItems.setKey(item.id, {
      ...existingItem,
      quantity: existingItem.quantity + 1,
    });
  } else {
    cartItems.setKey(item.id, {
      ...item,
      quantity: 1,
    });
  }
}

export function removeCartItem(id: string) {
    const existingItem = cartItems.get()[id];
    if (existingItem && existingItem.quantity > 1) {
        cartItems.setKey(id, {
            ...existingItem,
            quantity: existingItem.quantity - 1
        })
    } else {
        // Note: 'map' doesn't have a direct 'delete' method for keys in the same way,
        // but we can re-set the object without the key.
        // Or simpler: just set quantity to 0 and filter in UI?
        // Better:
        const current = cartItems.get();
        const { [id]: _, ...rest } = current;
        cartItems.set(rest);
    }
}
