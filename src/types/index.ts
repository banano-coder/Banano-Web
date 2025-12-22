export interface Product {
    id_producto: number;
    nombre: string;
    sku_base: string;
    descripcion: string;
    activo: boolean;
    precio: number;
    // Flat fields from new query
    category_name?: string;
    brand_name?: string;
    total_stock?: number;
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
