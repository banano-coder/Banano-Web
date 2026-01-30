// This file centralizes all API endpoints for the client application.
// These point to our local Astro API routes (proxies), not the external backend directly.

export const API_ENDPOINTS = {
  LOGIN: `/api/auth/login`,
  REGISTER: `/api/auth/signup`,
  ME: `/api/auth/me`,
  CATALOG: {
    PRODUCTS: `/api/catalog/products`,
    CATEGORIES: `/api/categories`,
    BRANDS: `/api/brands`
  },
  USERS: {
    LIST: `/api/users`,
    CREATE: `/api/users`,
    UPDATE: (id: string, action: string) => `/api/users/${id}/${action}`,
    DELETE: (id: string) => `/api/users/${id}`
  },
  PRODUCTS: {
    LIST: `/api/products`,
    CREATE: `/api/products`,
    DETAIL: (id: string | number) => `/api/products/${id}`,
    UPDATE: (id: string | number) => `/api/products/${id}`,
    DELETE: (id: string | number) => `/api/products/${id}`,
    VARIANTS: (id: string | number) => `/api/products/${id}/variants`,
    IMAGES: (id: string | number) => `/api/products/${id}/images`
  },
  VARIANTS: {
    ITEM: (id: string | number) => `/api/variants/${id}`
  },
  IMAGES: {
    ITEM: (productId: number | string, imgId: number | string) => `/api/products/${productId}/images/${imgId}`
  },
  INVENTORY: {
    MOVEMENTS: `/api/inventario/movimientos`,
    STOCK: (id: string | number) => `/api/inventario/stock/${id}`
  }
}
