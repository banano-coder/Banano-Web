# Project Blueprint

## Overview

This project is a static-first web application built with Astro.js. It is designed to be developed within the Firebase Studio (formerly Project IDX) environment. The focus is on creating a fast, highly-performant, and scalable site that delivers minimal JavaScript by default, ensuring an exceptional user experience and top-tier Core Web Vitals.

## Implemented Features

*   **Logo & Branding**: Integrated original company logo and fuchsia theme.
*   **Soft Delete**: Implemented logical deletion for users to preserve audit history.
*   **Dynamic Hero**: Added dashboard settings to customize storefront hero text.
*   **Inventory Redesign**:
    *   **Products as Groupers**: Public listing shows aggregated stock and variant counts.
    *   **Variants as Units of Stock**: SKUs and individual stock levels managed at the variant level.
    *   **Auto-Default**: Automatic creation of "Estándar" variant when creating new products.
*   **Audit Preservation**: Enhanced auditoria to keep actor names even after user deletion.

## Current Architecture: Inventory
- **Table `producto`**: Logical unit. Aggregates `total_stock` and `variants_count`.
- **Table `variante_producto`**: Physical unit. Holds `sku`, `precio`, and `codigo_barras`.
- **Table `inventario`**: Stores single row per variant with `stock`.
- **Flow**: Adjusting stock creates a record in `movimiento_inventario` and updates `inventario.stock`.

## Recent Changes
- **Route Consolidation**: Resolved warnings about duplicate API routes for `/api/brands` and `/api/categories`.
- **Cédula-Based Client System**: Transitioned from internal client IDs to a system-wide identification based on "Cédula" (ID number). This ensures unique identification and contact data validation.

## Current Architecture: Clients & Orders
- **Client Identification**: Clients are identified and upserted based on their `cliente_cedula` (Unique).
- **Order Linking**: Orders are linked directly to `cedula_cliente` instead of an internal serial ID.
- **Data Validation**: Checkout requires Cédula, Name, Email, and Phone. Conflict resolution (409) is implemented for overlapping contact info.

## Planned Changes
- **Bulk Product Creation**: Implement the UI for parsing Excel/CSV files and creating products in bulk.
    - Create `BulkProductUpload.tsx` component.
    - Integrate "Carga Masiva" tab in `ProductsManagement.tsx`.
    - Implement file upload and mapping logic (Category names to IDs).
- **Frontend Alignment**: Update `CartDrawer.tsx` to include Cédula field and mandatory contact info.
- **Dashboard Orders**: Update `OrdersManager.tsx` to display `cedula_cliente` in listing and details.

## Detailed Plan: Bulk Product Creation
1. **API Integration**: Added `/api/bulk/parse-file` and `/api/bulk/create` to `api.ts`. Implemented Astro API proxy routes in `src/pages/api/bulk/` to forward requests to the external backend.
2. **Component Creation**: Develop `BulkProductUpload.tsx` using Tailwind CSS and Radix UI (Lucide icons).
    - **Stage 1: Upload**: File input with drag & drop support and **Download buttons** for both `.csv` and `.xlsx` templates.
    - **Stage 2: Preview & Mapping**: Hierarchical table showing parent products and nested variants. Includes selectors to fully map file groups to both system **Categories and Brands**.
    - **Stage 3: Confirmation**: Final submission to the backend.
3. **Integration**: Add the new component as a tab in the Inventory management section.
4. **Validation**: Ensure feedback for successful uploads and error handling for invalid files.

