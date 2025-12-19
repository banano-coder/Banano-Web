export interface Product {
    id_producto: number;
    nombre: string;
    sku_base: string;
    descripcion: string;
    activo: boolean;
    precio: number;
    Categoria: { nombre: string }; // Keep consistent with what was in ProductList
    Marca: { nombre: string };     // Keep consistent with what was in ProductList
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
