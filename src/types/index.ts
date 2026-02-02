export interface Product {
    id_producto: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    precio: number;
    category_name?: string;
    brand_name?: string;
    total_stock?: number;
    variants_count?: number;
    // Legacy nested objects (optional now)
    Categoria?: { nombre: string };
    Marca?: { nombre: string };
}

export interface ProductsApiResponse {
    data: Product[];
    page: number;
    limit: number;
    total: number;
}

export interface Category {
    id_categoria: number;
    nombre: string;
}

export interface Brand {
    id_marca: number;
    nombre: string;
}

export interface Variant {
    id_variante_producto: number;
    id_producto: number;
    sku: string;
    precio_lista: number;
    costo: number;
    codigo_barras?: string;
    atributos_json?: any;
    activo: boolean;
    stock_actual?: number;
}

export interface ProductImage {
    id_imagen_producto: number;
    id_producto: number;
    id_variante_producto?: number | null;
    url: string;
    es_principal: boolean;
    activo: boolean;
}

export interface InventoryMovement {
    id_movimiento_inventario: number;
    id_variante_producto: number;
    tipo: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    motivo?: string;
    ref_externa?: string;
    costo_unitario?: number;
    usuario_nombre?: string;
    created_at: string;
}
