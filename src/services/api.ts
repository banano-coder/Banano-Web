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
    UPDATE: (id: string, action: string) => `/api/users/${id}/${action}`
  },
  PRODUCTS: {
    LIST: `/api/products`,
    CREATE: `/api/products`,
    DETAIL: (id: string | number) => `/api/products/${id}`,
    UPDATE: (id: string | number) => `/api/products/${id}`,
    DELETE: (id: string | number) => `/api/products/${id}`
  }
}
