// This file centralizes all API endpoints for the client application.
// These point to our local Astro API routes (proxies), not the external backend directly.

export const API_ENDPOINTS = {
  LOGIN: `/api/auth/login`,
  REGISTER: `/api/auth/signup`,
  ME: `/api/auth/me`,
  CATALOG: {
    PRODUCTS: `/api/catalog/products`,
    CATEGORIES: `/api/catalog/categories`,
    BRANDS: `/api/catalog/brands`
  },
  CATEGORIES: {
    LIST: `/api/categories`,
    ITEM: (id: string | number) => `/api/categories/${id}`
  },
  BRANDS: {
    LIST: `/api/brands`,
    ITEM: (id: string | number) => `/api/brands/${id}`
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
  },
  BULK: {
    PARSE_FILE: `/api/bulk/parse-file`,
    CREATE: `/api/bulk/create`
  },
  ALMACENES: {
    LIST: `/api/almacenes`,
    ITEM: (id: string | number) => `/api/almacenes/${id}`
  },
  MONEY: {
    CUENTAS: `/api/money/cuentas`,
    CUENTA: (id: string | number) => `/api/money/cuentas/${id}`,
    MOVIMIENTOS: `/api/money/movimientos`,
    RESUMEN: `/api/money/resumen`
  },
  EXPENSES: {
    LIST: `/api/expenses`,
    CREATE: `/api/expenses`,
    DELETE: (id: string | number) => `/api/expenses/${id}`,
    CATEGORIES: `/api/expenses/categories`,
    CATEGORY_ITEM: (id: string | number) => `/api/expenses/categories/${id}`,
    WEEKLY_SUMMARY: `/api/expenses/weekly-summary`
  },
  POS: {
    CHECKOUT: `/api/pos/checkout`
  }
};
