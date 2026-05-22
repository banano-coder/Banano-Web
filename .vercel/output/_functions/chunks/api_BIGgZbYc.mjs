class HttpError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.message = message;
    this.data = data;
    this.name = "HttpError";
  }
}
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}
async function FetchData(url, method = "GET", options = {}) {
  const { body, responseType = "json", token: customToken, headers: customHeaders, ...restOptions } = options;
  try {
    const headers = {
      ...customHeaders || {}
    };
    const token = customToken || getCookie("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const config = {
      method,
      headers,
      cache: "no-store",
      ...restOptions
      // Pasa signal, cache, mode, etc.
    };
    if (body) {
      if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
        config.body = body;
      } else if (typeof body === "string") {
        config.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(body);
      }
    }
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");
      try {
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
      } catch {
        errorData = null;
      }
      const errorMessage = typeof errorData === "object" && errorData?.message ? errorData.message : `Error ${response.status}: ${response.statusText}`;
      throw new HttpError(response.status, errorMessage, errorData);
    }
    if (response.status === 204) {
      return null;
    }
    if (responseType === "blob") return await response.blob();
    if (responseType === "text") return await response.text();
    return await response.json();
  } catch (error) {
    console.error(`[FetchData Error] ${method} ${url}`, error);
    throw error;
  }
}

const API_ENDPOINTS = {
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
    ITEM: (id) => `/api/categories/${id}`
  },
  BRANDS: {
    LIST: `/api/brands`,
    ITEM: (id) => `/api/brands/${id}`
  },
  USERS: {
    LIST: `/api/users`,
    CREATE: `/api/users`,
    UPDATE: (id, action) => `/api/users/${id}/${action}`,
    DELETE: (id) => `/api/users/${id}`
  },
  PRODUCTS: {
    LIST: `/api/products`,
    CREATE: `/api/products`,
    DETAIL: (id) => `/api/products/${id}`,
    UPDATE: (id) => `/api/products/${id}`,
    DELETE: (id) => `/api/products/${id}`,
    VARIANTS: (id) => `/api/products/${id}/variants`,
    IMAGES: (id) => `/api/products/${id}/images`
  },
  VARIANTS: {
    ITEM: (id) => `/api/variants/${id}`
  },
  IMAGES: {
    ITEM: (productId, imgId) => `/api/products/${productId}/images/${imgId}`
  },
  INVENTORY: {
    MOVEMENTS: `/api/inventario/movimientos`,
    STOCK: (id) => `/api/inventario/stock/${id}`
  },
  BULK: {
    PARSE_FILE: `/api/bulk/parse-file`,
    CREATE: `/api/bulk/create`
  },
  ALMACENES: {
    LIST: `/api/almacenes`,
    ITEM: (id) => `/api/almacenes/${id}`
  }
};

export { API_ENDPOINTS as A, FetchData as F };
