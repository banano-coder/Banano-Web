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
*   **Banana Icon in Hero Title**: Integrated the banana logo (/logo_original.png) into the main catalog title.

## Current Architecture: Inventory
- **Table `producto`**: Logical unit. Aggregates `total_stock` and `variants_count`.
- **Table `variante_producto`**: Physical unit. Holds `sku`, `precio`, and `codigo_barras`.
- **Table `inventario`**: Stores single row per variant with `stock`.
- **Flow**: Adjusting stock creates a record in `movimiento_inventario` and updates `inventario.stock`.

## Recent Changes
- **Route Consolidation**: Resolved warnings about duplicate API routes for `/api/brands` and `/api/categories`.
- **Cédula-Based Client System**: Transitioned from internal client IDs to a system-wide identification based on "Cédula" (ID number). This ensures unique identification and contact data validation.
- **Mobile Responsive POS (Sales Module)**:
    - Implemented mobile-first layout with bottom tab navigation (Catálogo / Carrito / Total).
    - Product grid adapts from 2 columns on mobile to 5 on large screens with reduced card sizes.
    - Sidebar (cart + sale form) switches to full-width view on mobile via tab toggle.
    - Added `removeFromCart` and `updateQuantity` helper functions for cart management.
    - Floating badge on cart icon shows item count, quick-total button shows subtotal.
    - All touch targets increased to minimum 44px for mobile usability.
    - Extracted `SidebarContent` as shared component for desktop sidebar and mobile cart view.

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
- **Warehouses Module (Almacenes)**: Integrate the new Warehouses management section.
    - Create `WarehouseManagement.tsx` component.
    - Setup Astro API routes for proxying requests.
    - Add to Sidebar navigation.
- **Banana Icon in Hero Title**: Add the yellow banana cartoon mascot to the main catalog hero banner.
- **Inventory Search Filters**: Expand the product management search bar with Category, Brand, and Status dropdown select controls.

## Detailed Plan: Bulk Product Creation
1. **API Integration**: Added `/api/bulk/parse-file` and `/api/bulk/create` to `api.ts`. Implemented Astro API proxy routes in `src/pages/api/bulk/` to forward requests to the external backend.
2. **Component Creation**: Develop `BulkProductUpload.tsx` using Tailwind CSS and Radix UI (Lucide icons).
    - **Stage 1: Upload**: File input with drag & drop support and **Download buttons** for both `.csv` and `.xlsx` templates.
    - **Stage 2: Preview & Mapping**: Hierarchical table showing parent products and nested variants. Includes selectors to fully map file groups to both system **Categories and Brands**.
    - **Stage 3: Confirmation**: Final submission to the backend.
3. **Integration**: Add the new component as a tab in the Inventory management section.
4. **Validation**: Ensure feedback for successful uploads and error handling for invalid files.

## Detailed Plan: Warehouses Module (Almacenes)
1. **Types Definition**: Add `Almacen` interface to `src/types/index.ts` with properties: `id_almacen`, `nombre`, `direccion`, `telefono`, `activo`, `created_at`, `updated_at`.
2. **API Endpoint Map**: Update `src/services/api.ts` to include the `ALMACENES` routes:
    - `LIST`: `/api/almacenes`
    - `ITEM`: `/api/almacenes/${id}`
3. **Astro Route Proxies**: Create two proxy routes under `src/pages/api/almacenes/`:
    - `index.ts`: Proxy requests to `GET /api/almacenes` and `POST /api/almacenes` to the external backend, adding authorization bearer token from the cookies.
    - `[id].ts`: Proxy requests to `GET /api/almacenes/:id`, `PATCH /api/almacenes/:id`, and `DELETE /api/almacenes/:id`.
4. **React Management Component**: Create `src/components/Dashboard/Warehouses/WarehouseManagement.tsx`.
    - Retrieve user profile/role from localStorage to enforce role-based actions:
        - View/Search/Filter: admin, manager, vendedor, viewer
        - Create/Edit/Delete: admin, manager (conditionally display actions and disable/enable buttons accordingly)
    - Build a stateful listing table with:
        - Search bar filtering by name or direction.
        - Status filter (active, logical deleted, or all).
        - Loading skeletons/spinners.
        - Cards/table with columns for ID, Name, Address, Phone, Status (Active/Inactive), and Actions.
    - Create/Edit Modal with form fields and validation.
    - Logical Delete button with confirmation modal.
    - Clean visual notifications/alerts for errors (e.g. 400 Bad Request, 409 Conflict) and successes.
5. **Dashboard Route & Navigation**:
    - Update `src/components/Dashboard/Sidebar.astro` to add "Almacenes" link pointing to `/dashboard/almacenes`.
    - Create `src/pages/dashboard/almacenes.astro` incorporating `AuthGuard`, matching the existing layout style, and loading `<WarehouseManagement client:load />`.
6. **Verification & Testing**: Verify building the project and check console diagnostics.

## Detailed Plan: Banana Icon in Hero Title
1. **Source Identificator**: Identify the banana mascot image (`/logo_original.png`) as used in the footer.
2. **Visual Enhancements**: Update `src/pages/index.astro` in the Hero Banner Section:
    - Wrap the banana image and title inside a centered flex container (`flex flex-col md:flex-row items-center justify-center gap-6`).
    - Scale the image dynamically: smaller on mobile (`h-20`), larger on desktop (`h-32`).
    - Add a custom floating micro-animation (`animate-float`) to make the design feel responsive and alive.
    - Implement a glowing drop shadow (`drop-shadow-[0_10px_20px_rgba(255,214,10,0.5)]`) matching the brand's Vibrant Yellow color.
    - Apply a subtle tilt on hover (`hover:rotate-12 hover:scale-110 transition-transform duration-300`).
3. **Styles Definition**: Add the `@keyframes float` CSS definition inside the `<style>` block in `src/pages/index.astro`.
4. **Verification**: Check the browser preview to verify the layout, ensuring responsiveness and proper rendering without console errors.

## Detailed Plan: Inventory Search Filters
1. **Option Fetching**: Retrieve list of categories and brands on component load from `/api/categories` and `/api/brands`.
2. **State Additions**: Add states for `selectedCategory`, `selectedBrand`, and `selectedStatus` (with options for Active, Inactive, and Draft/Revision).
3. **Layout Redesign**: Expand the search controls row in `ProductList.tsx` into a responsive flex-wrap grid. Include standard styled `<select>` dropdown inputs for Categories, Brands, and Status.
4. **Reset Button**: Offer a "Limpiar Filtros" (Clear Filters) action button when any filter is active.
5. **Filtering Logic**: Calculate `filteredProducts` using combined client-side filters matching names, SKUs, active categories, active brands, and item status. Use this array to map table rows.
6. **Verification**: Compile and preview the dashboard to verify live inventory filtering functions correctly.

