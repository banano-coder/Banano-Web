# Project Blueprint

## Overview

This project is a static-first web application built with Astro.js. It is designed to be developed within the Firebase Studio (formerly Project IDX) environment. The focus is on creating a fast, highly-performant, and scalable site that delivers minimal JavaScript by default, ensuring an exceptional user experience and top-tier Core Web Vitals.

## Implemented Features

*   **Logo & Branding**: Integrated original company logo and fuchsia theme.
*   **Soft Delete**: Implemented logical deletion for users to preserve audit history.
*   **Dynamic Hero**: Added dashboard settings to customize storefront hero text.
*   **Inventory Redesign**:
    *   **Products as Groupers**: Public listing shows aggregated stock and variant counts.
    *   **Variants as units of Stock**: SKUs and individual stock levels managed at the variant level.
    *   **Auto-Default**: Automatic creation of "Estándar" variant when creating new products.
*   **Audit Preservation**: Enhanced auditoria to keep actor names even after user deletion.
*   **Banana Icon in Hero Title**: Integrated the banana logo (/logo_original.png) into the main catalog title.
*   **Multi-Currency Cash Flow & POS Integration**:
    *   Dynamic user-creatable bank and cash accounts ("Cuentas") linked to specific warehouses.
    *   Real-time multi-currency payments (USD, COP, VES) and exchange rate inputs at the POS Checkout.
    *   Automatic stock decrements from the cashier's warehouse and ledger updates.
    *   Interactive cash flow summary, manual adjustments, and paginated audit transaction ledgers.

## Current Architecture: Inventory
- **Table `producto`**: Logical unit. Aggregates `total_stock` and `variants_count`.
- **Table `variante_producto`**: Physical unit. Holds `sku`, `precio`, and `codigo_barras`.
- **Table `inventario`**: Stores single row per variant with `stock`.
- **Flow**: Adjusting stock creates a record in `movimiento_inventario` and updates `inventario.stock`.

## Recent Changes
- **Multi-Warehouse Selector & Stock Queries**:
    - Created the database migration `migrate_inventory_warehouses.js` to add `id_almacen` references to `public.inventario` and `public.movimiento_inventario`, and added compound unique constraint.
    - Updated variants list endpoint query on backend to handle specific `id_almacen` or return consolidated stocks sum.
    - Updated Astro variants route proxy to forward request search parameters (like `?id_almacen=X`) to the external API backend.
    - Redesigned `ProductInventoryTab.tsx` with a header select control to toggle stock visibility between consolidated and specific warehouses.
    - Added "Almacén de Destino/Origen" selector to the "Registrar Movimiento" dialog, ensuring real-time stock levels of the target warehouse are fetched and displayed in variant list options.
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
- **Catalog Home Link & Mobile Search Bar Space**: Add home navigation buttons in the catalog and collapse/optimize the filters container on mobile viewports.
- **User-Warehouse Association**: Associate user accounts with specific sucursales and lock POS stock levels to their assigned store.
- **POS/Sales Interface Aesthetic Redesign**: Redesign the POS panel to align with the global fuchsia/glassmorphism design theme.

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

## Detailed Plan: Catalog Home Link & Mobile Search Bar Space
1. **Logo Link & Floating Home Button**: Wrap the existing logo and title in `src/pages/index.astro` in an anchor tag linking to `/`. Create `FloatingHomeButton.tsx` on the bottom-left (`fixed bottom-[30px] left-[30px]`) that scrolls to top smoothly on scroll. Add it to `index.astro`.
2. **Filters Collapsible State**: In `src/components/Shop/ProductGrid.tsx`, add a React state `showMobileFilters` initialized to `false`.
3. **Responsive Search & Filter Toggle Row**: Restructure the filter panel so that on mobile, the search text input and a fuchsia styled "Filtros" button occupy a single horizontal row, hiding all other dropdowns and price inputs by default.
4. **Conditional Expanded Display**: Underneath the search row, wrap the price range inputs, sort select, category select, and brand select in a div that is shown on mobile only when `showMobileFilters` is `true`. Keep them always visible on desktop (`md:` breakpoint).
5. **Verification**: Build the project and test responsiveness, ensuring no horizontal scroll is introduced and that space consumption on mobile is significantly reduced.

## Detailed Plan: Multi-Warehouse Inventory (Consolidated Stock)
1. **Database Migration Script**: Create `migrate_inventory_warehouses.js` in `Proyectobanano/src/scripts` to add `id_almacen` references to `public.inventario` and `public.movimiento_inventario`, default them to `1` (Almacén Principal), and add unique constraint `uq_variante_almacen` to `inventario`.
2. **Catalog Query Consolidation**: Modify `catalog.routes.js` to calculate variant stock using a subquery that sums stock across all warehouses instead of a simple JOIN.
3. **Movement & Stock Updates**: Update `inventario.routes.js` to handle `id_almacen` for movements (`aplicarMovimiento`), default to `1` when missing, filter stock by `id_almacen` when requested, or sum them for consolidated stock.
4. **Verification**: Run database migration, test detail endpoints and post movements checking that stock is correctly tracked per warehouse.

## Detailed Plan: Warehouse Selector in Inventory Management
1. **Backend Route Parameter**: Update `variants.routes.js` `GET /api/products/:id/variants` to check for `id_almacen` in query parameters. If present, filter the subquery for variant stock by that warehouse; otherwise, return the consolidated sum.
2. **Fetch Warehouses**: In `ProductInventoryTab.tsx`, call `FetchData` to request all active warehouses from `/api/almacenes?activo=true`.
3. **Dropdown Filter Control**: Render a Select input in the tab header to toggle between "Consolidado" and specific warehouses. Update the fetch call to append `?id_almacen=X` when requesting variants.
4. **Movement Dialog Dropdown**: Render a Select input in the "Registrar Movimiento" dialog to choose the target warehouse (`id_almacen`), defaulting to the selected warehouse filter or Almacén Principal. Send this ID in the movement POST body.
5. **Verification**: Verify that selecting a warehouse updates variant stock numbers, and registering movements in different warehouses keeps stock levels isolated.

## Detailed Plan: User-Warehouse Association
1. **Database Migration**: Create `migrate_users_warehouse.js` in `Proyectobanano/src/scripts` to add column `id_almacen` (INT) to the `public.usuario` table, referencing `public.almacen(id_almacen)`, and default existing rows to `1`.
2. **Backend Authentication**: Update query in `auth.routes.js` `POST /login` to retrieve `id_almacen` from database, sign it into the JWT token, and return it in the JSON response payload.
3. **Backend Users Controller**:
    - Update `GET /users` in `users.routes.js` to return `id_almacen` and joined `almacen_nombre` for each user.
    - Update `POST /users` in `users.routes.js` to accept `id_almacen` and insert it.
    - Implement `PATCH /users/:id/warehouse` in `users.routes.js` to assign/update user warehouse.
4. **Backend Products Controller**: Update `GET /products` in `products.routes.js` to accept `id_almacen` query parameter, filtering the `LEFT JOIN public.inventario` join condition when provided to retrieve branch stock counts.
5. **Frontend User List**: Add "Sucursal" column to `UserList.tsx` displaying the assigned warehouse name or "Todas (Admin/Central)".
6. **Frontend User Forms**: Update `CreateUserDialog.tsx` and `EditRoleDialog.tsx` to fetch active warehouses and display a select dropdown to assign/update the user's sucursal.
7. **Frontend POS System**: Update `POSSystem.tsx` to read the cashier's `id_almacen` from localStorage and pass it to `API_ENDPOINTS.PRODUCTS.LIST` stock fetch call to lock POS stocks.

## Detailed Plan: POS/Sales Interface Aesthetic Redesign
1. **Layout & Backgrounds**: Replace hardcoded `#f8f5f0` and `#d1cdbc` with Tailwind's standard CSS tokens `bg-transparent` and `border-border`. Adjust height structure to prevent overflows.
2. **Branding Colors**: Update text shades to `text-foreground` and `text-primary`, and convert buttons and badges to fuchsia-themed configurations (`bg-primary`, `hover:bg-primary/90`, etc.).
3. **Card Glassmorphism**: Modify container `<Card>` tags to use `bg-card/85 backdrop-blur-sm shadow-xl` matching the other dashboard sections.
4. **Input Styles**: Adapt `<Input>` and `<select>` fields to inherit the standard dashboard theme styles.
5. **Verification**: Confirm visual compliance inside the "Ventas" dashboard tab.

## Detailed Plan: Inventory Filter by Warehouse
1. **State Addition**: Add `warehouses` listing and `selectedWarehouse` states to `ProductList.tsx`.
2. **Fetch active warehouses**: Retrieve the list of active warehouses on component initialization from `/api/almacenes?activo=true`.
3. **Add select filter**: Render a warehouse selector select dropdown in the search/filter row in `ProductList.tsx`.
4. **Pass parameter to query**: Append `id_almacen` to query parameters in the product listing fetch call, causing the backend to return stock specific to the selected warehouse.
5. **Verification**: Run `npx astro check` to verify changes.

## Detailed Plan: Multi-Currency Accounts & POS Integration
1. **Database Migration**: Create `migrate_money_accounts.js` in the backend. Define tables `cuenta` and `transaccion_caja`, and append `id_cuenta`, `moneda_pago`, `tasa_cambio`, `monto_pago_real`, `id_almacen`, and `id_usuario` to the `pedido` table schema.
2. **Backend Routers**:
   - Create `cuentas.routes.js` for accounts CRUD.
   - Create `money.routes.js` for cash flow transactions CRUD and summaries.
   - Export `aplicarMovimiento` function from `inventario.routes.js` to reuse it during sales checkout.
   - Create a dedicated `POST /pos/checkout` endpoint inside `pedidos.routes.js` to process cashier physical sales with real-time stock decreases, cliente upserts, transaction balance shifts, and cashier audit logs.
3. **Astro Proxies**: Create endpoints under `/api/money/cuentas/`, `/api/money/movimientos/`, `/api/money/resumen/`, and `/api/pos/checkout/` to forward requests safely.
4. **POS Interface Integration**: Update `POSSystem.tsx` to retrieve active financial accounts, render a Target Account dropdown, read its currency, allow Cashiers to input exchange rates for VES/COP, display the converted total in real-time, and call the checkout endpoint upon clicking "Confirmar Venta".
5. **Money Dashboard module**: Redesign `MoneyManagement.tsx` to let users view, create financial accounts, monitor balance cards per currency, and list/filter cash flow transactions or record manual adjustments.

## Detailed Plan: Header and Sticky Search Bar Optimization
1. **Header Refinement**: In `src/pages/index.astro`, reduce header vertical padding to `py-2.5 sm:py-4`. Set logo image height to `h-6 sm:h-8 md:h-10` and title font size to `text-base sm:text-xl md:text-2xl`. Shrink "Iniciar Sesión" text size to `text-[10px] sm:text-xs md:text-sm`, padding to `px-2.5 py-1 sm:px-4 sm:py-1.5`, and gap to `gap-1 sm:gap-1.5`. Use `whitespace-nowrap` to guarantee single-line fit on mobile screen widths.
2. **Sticky Filters**: In `src/components/Shop/ProductGrid.tsx`, add `sticky top-2 sm:top-4 z-30 bg-card/90 backdrop-blur-md shadow-md` class list to the main filters container. Ensure the scrolling catalog cards slide beneath it cleanly.
3. **User Edit Proxy Fix**: In `src/pages/api/users/[id]/[action].ts`, include `'warehouse'` in the `allowedActions` list to permit proxying patch requests for warehouse associations.
4. **POS Header & Redundant Button Cleanups**:
   - In `POSSystem.tsx`, retrieve and store `currentUser` from `localStorage` and fetch active `warehouses` list from the API on component load.
   - Display cashier details (name) and sucursal (warehouse name) inside the upper header component on both mobile and desktop viewports, using clean glassmorphism styles and icons.
   - Remove all exit buttons ("SALIR") and back arrow buttons from the POS page layout, since navigation is already handled by the dashboard's persistent sidebar and header.
5. **Verification**: Run build and inspect responsive scaling.

## Detailed Plan: Multiple Address List in Settings
1. **Interface Update**: Add `direcciones?: string[];` to `SettingsData['tienda']` interface in `SettingsManager.tsx`.
2. **Form Field list**:
   - Replace the address inputs with a dynamic list of text inputs.
   - Map over `settings.tienda.direcciones` (initializing with `[settings.tienda.direccion]` if undefined/empty).
   - Provide an "+ Agregar otra dirección" button that appends a new empty string to `direcciones`.
   - Provide a delete button (using Lucide `Trash`) next to each extra address input.
   - Update the state and ensure clicking "Guardar Datos de Tienda" persists this array.
3. **Catalog Footer Rendering**:
   - Update `src/pages/index.astro` footer.
   - If `tienda.direcciones` exists and has entries, map over them.
   - Display a flex layout of address cards:
     - If only 1 address: label it "Dirección".
     - If multiple addresses: label the first one "Dirección Principal", and the rest "Dirección Sucursal" or similar.
     - Fall back to the old `direccion` and `direccion_secundaria` fields if `direcciones` array is empty or undefined.
4. **Verification**: Run `npm run build` and test that the configuration saves and displays correctly.

*   **Inventory Redesign**:
    *   **Products as Groupers**: Public listing shows aggregated stock and variant counts.
    *   **Variants as units of Stock**: SKUs and individual stock levels managed at the variant level.
    *   **Auto-Default**: Automatic creation of "Estándar" variant when creating new products.
*   **Audit Preservation**: Enhanced auditoria to keep actor names even after user deletion.
*   **Banana Icon in Hero Title**: Integrated the banana logo (/logo_original.png) into the main catalog title.
*   **Multi-Currency Cash Flow & POS Integration**:
    *   Dynamic user-creatable bank and cash accounts ("Cuentas") linked to specific warehouses.
    *   Real-time multi-currency payments (USD, COP, VES) and exchange rate inputs at the POS Checkout.
    *   Automatic stock decrements from the cashier's warehouse and ledger updates.
    *   Interactive cash flow summary, manual adjustments, and paginated audit transaction ledgers.

## Current Architecture: Inventory
- **Table `producto`**: Logical unit. Aggregates `total_stock` and `variants_count`.
- **Table `variante_producto`**: Physical unit. Holds `sku`, `precio`, and `codigo_barras`.
- **Table `inventario`**: Stores single row per variant with `stock`.
- **Flow**: Adjusting stock creates a record in `movimiento_inventario` and updates `inventario.stock`.

## Recent Changes
- **Multi-Warehouse Selector & Stock Queries**:
    - Created the database migration `migrate_inventory_warehouses.js` to add `id_almacen` references to `public.inventario` and `public.movimiento_inventario`, and added compound unique constraint.
    - Updated variants list endpoint query on backend to handle specific `id_almacen` or return consolidated stocks sum.
    - Updated Astro variants route proxy to forward request search parameters (like `?id_almacen=X`) to the external API backend.
    - Redesigned `ProductInventoryTab.tsx` with a header select control to toggle stock visibility between consolidated and specific warehouses.
    - Added "Almacén de Destino/Origen" selector to the "Registrar Movimiento" dialog, ensuring real-time stock levels of the target warehouse are fetched and displayed in variant list options.
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
- **Catalog Home Link & Mobile Search Bar Space**: Add home navigation buttons in the catalog and collapse/optimize the filters container on mobile viewports.
- **User-Warehouse Association**: Associate user accounts with specific sucursales and lock POS stock levels to their assigned store.
- **POS/Sales Interface Aesthetic Redesign**: Redesign the POS panel to align with the global fuchsia/glassmorphism design theme.

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

## Detailed Plan: Catalog Home Link & Mobile Search Bar Space
1. **Logo Link & Floating Home Button**: Wrap the existing logo and title in `src/pages/index.astro` in an anchor tag linking to `/`. Create `FloatingHomeButton.tsx` on the bottom-left (`fixed bottom-[30px] left-[30px]`) that scrolls to top smoothly on scroll. Add it to `index.astro`.
2. **Filters Collapsible State**: In `src/components/Shop/ProductGrid.tsx`, add a React state `showMobileFilters` initialized to `false`.
3. **Responsive Search & Filter Toggle Row**: Restructure the filter panel so that on mobile, the search text input and a fuchsia styled "Filtros" button occupy a single horizontal row, hiding all other dropdowns and price inputs by default.
4. **Conditional Expanded Display**: Underneath the search row, wrap the price range inputs, sort select, category select, and brand select in a div that is shown on mobile only when `showMobileFilters` is `true`. Keep them always visible on desktop (`md:` breakpoint).
5. **Verification**: Build the project and test responsiveness, ensuring no horizontal scroll is introduced and that space consumption on mobile is significantly reduced.

## Detailed Plan: Multi-Warehouse Inventory (Consolidated Stock)
1. **Database Migration Script**: Create `migrate_inventory_warehouses.js` in `Proyectobanano/src/scripts` to add `id_almacen` references to `public.inventario` and `public.movimiento_inventario`, default them to `1` (Almacén Principal), and add unique constraint `uq_variante_almacen` to `inventario`.
2. **Catalog Query Consolidation**: Modify `catalog.routes.js` to calculate variant stock using a subquery that sums stock across all warehouses instead of a simple JOIN.
3. **Movement & Stock Updates**: Update `inventario.routes.js` to handle `id_almacen` for movements (`aplicarMovimiento`), default to `1` when missing, filter stock by `id_almacen` when requested, or sum them for consolidated stock.
4. **Verification**: Run database migration, test detail endpoints and post movements checking that stock is correctly tracked per warehouse.

## Detailed Plan: Warehouse Selector in Inventory Management
1. **Backend Route Parameter**: Update `variants.routes.js` `GET /api/products/:id/variants` to check for `id_almacen` in query parameters. If present, filter the subquery for variant stock by that warehouse; otherwise, return the consolidated sum.
2. **Fetch Warehouses**: In `ProductInventoryTab.tsx`, call `FetchData` to request all active warehouses from `/api/almacenes?activo=true`.
3. **Dropdown Filter Control**: Render a Select input in the tab header to toggle between "Consolidado" and specific warehouses. Update the fetch call to append `?id_almacen=X` when requesting variants.
4. **Movement Dialog Dropdown**: Render a Select input in the "Registrar Movimiento" dialog to choose the target warehouse (`id_almacen`), defaulting to the selected warehouse filter or Almacén Principal. Send this ID in the movement POST body.
5. **Verification**: Verify that selecting a warehouse updates variant stock numbers, and registering movements in different warehouses keeps stock levels isolated.

## Detailed Plan: User-Warehouse Association
1. **Database Migration**: Create `migrate_users_warehouse.js` in `Proyectobanano/src/scripts` to add column `id_almacen` (INT) to the `public.usuario` table, referencing `public.almacen(id_almacen)`, and default existing rows to `1`.
2. **Backend Authentication**: Update query in `auth.routes.js` `POST /login` to retrieve `id_almacen` from database, sign it into the JWT token, and return it in the JSON response payload.
3. **Backend Users Controller**:
    - Update `GET /users` in `users.routes.js` to return `id_almacen` and joined `almacen_nombre` for each user.
    - Update `POST /users` in `users.routes.js` to accept `id_almacen` and insert it.
    - Implement `PATCH /users/:id/warehouse` in `users.routes.js` to assign/update user warehouse.
4. **Backend Products Controller**: Update `GET /products` in `products.routes.js` to accept `id_almacen` query parameter, filtering the `LEFT JOIN public.inventario` join condition when provided to retrieve branch stock counts.
5. **Frontend User List**: Add "Sucursal" column to `UserList.tsx` displaying the assigned warehouse name or "Todas (Admin/Central)".
6. **Frontend User Forms**: Update `CreateUserDialog.tsx` and `EditRoleDialog.tsx` to fetch active warehouses and display a select dropdown to assign/update the user's sucursal.
7. **Frontend POS System**: Update `POSSystem.tsx` to read the cashier's `id_almacen` from localStorage and pass it to `API_ENDPOINTS.PRODUCTS.LIST` stock fetch call to lock POS stocks.

## Detailed Plan: POS/Sales Interface Aesthetic Redesign
1. **Layout & Backgrounds**: Replace hardcoded `#f8f5f0` and `#d1cdbc` with Tailwind's standard CSS tokens `bg-transparent` and `border-border`. Adjust height structure to prevent overflows.
2. **Branding Colors**: Update text shades to `text-foreground` and `text-primary`, and convert buttons and badges to fuchsia-themed configurations (`bg-primary`, `hover:bg-primary/90`, etc.).
3. **Card Glassmorphism**: Modify container `<Card>` tags to use `bg-card/85 backdrop-blur-sm shadow-xl` matching the other dashboard sections.
4. **Input Styles**: Adapt `<Input>` and `<select>` fields to inherit the standard dashboard theme styles.
5. **Verification**: Confirm visual compliance inside the "Ventas" dashboard tab.

## Detailed Plan: Inventory Filter by Warehouse
1. **State Addition**: Add `warehouses` listing and `selectedWarehouse` states to `ProductList.tsx`.
2. **Fetch active warehouses**: Retrieve the list of active warehouses on component initialization from `/api/almacenes?activo=true`.
3. **Add select filter**: Render a warehouse selector select dropdown in the search/filter row in `ProductList.tsx`.
4. **Pass parameter to query**: Append `id_almacen` to query parameters in the product listing fetch call, causing the backend to return stock specific to the selected warehouse.
5. **Verification**: Run `npx astro check` to verify changes.

## Detailed Plan: Multi-Currency Accounts & POS Integration
1. **Database Migration**: Create `migrate_money_accounts.js` in the backend. Define tables `cuenta` and `transaccion_caja`, and append `id_cuenta`, `moneda_pago`, `tasa_cambio`, `monto_pago_real`, `id_almacen`, and `id_usuario` to the `pedido` table schema.
2. **Backend Routers**:
   - Create `cuentas.routes.js` for accounts CRUD.
   - Create `money.routes.js` for cash flow transactions CRUD and summaries.
   - Export `aplicarMovimiento` function from `inventario.routes.js` to reuse it during sales checkout.
   - Create a dedicated `POST /pos/checkout` endpoint inside `pedidos.routes.js` to process cashier physical sales with real-time stock decreases, cliente upserts, transaction balance shifts, and cashier audit logs.
3. **Astro Proxies**: Create endpoints under `/api/money/cuentas/`, `/api/money/movimientos/`, `/api/money/resumen/`, and `/api/pos/checkout/` to forward requests safely.
4. **POS Interface Integration**: Update `POSSystem.tsx` to retrieve active financial accounts, render a Target Account dropdown, read its currency, allow Cashiers to input exchange rates for VES/COP, display the converted total in real-time, and call the checkout endpoint upon clicking "Confirmar Venta".
5. **Money Dashboard module**: Redesign `MoneyManagement.tsx` to let users view, create financial accounts, monitor balance cards per currency, and list/filter cash flow transactions or record manual adjustments.

## Detailed Plan: Header and Sticky Search Bar Optimization
1. **Header Refinement**: In `src/pages/index.astro`, reduce header vertical padding to `py-2.5 sm:py-4`. Set logo image height to `h-6 sm:h-8 md:h-10` and title font size to `text-base sm:text-xl md:text-2xl`. Shrink "Iniciar Sesión" text size to `text-[10px] sm:text-xs md:text-sm`, padding to `px-2.5 py-1 sm:px-4 sm:py-1.5`, and gap to `gap-1 sm:gap-1.5`. Use `whitespace-nowrap` to guarantee single-line fit on mobile screen widths.
2. **Sticky Filters**: In `src/components/Shop/ProductGrid.tsx`, add `sticky top-2 sm:top-4 z-30 bg-card/90 backdrop-blur-md shadow-md` class list to the main filters container. Ensure the scrolling catalog cards slide beneath it cleanly.
3. **User Edit Proxy Fix**: In `src/pages/api/users/[id]/[action].ts`, include `'warehouse'` in the `allowedActions` list to permit proxying patch requests for warehouse associations.
4. **POS Header & Redundant Button Cleanups**:
   - In `POSSystem.tsx`, retrieve and store `currentUser` from `localStorage` and fetch active `warehouses` list from the API on component load.
   - Display cashier details (name) and sucursal (warehouse name) inside the upper header component on both mobile and desktop viewports, using clean glassmorphism styles and icons.
   - Remove all exit buttons ("SALIR") and back arrow buttons from the POS page layout, since navigation is already handled by the dashboard's persistent sidebar and header.
5. **Verification**: Run build and inspect responsive scaling.

## Detailed Plan: Multiple Address List in Settings
1. **Interface Update**: Add `direcciones?: string[];` to `SettingsData['tienda']` interface in `SettingsManager.tsx`.
2. **Form Field list**:
   - Replace the address inputs with a dynamic list of text inputs.
   - Map over `settings.tienda.direcciones` (initializing with `[settings.tienda.direccion]` if undefined/empty).
   - Provide an "+ Agregar otra dirección" button that appends a new empty string to `direcciones`.
   - Provide a delete button (using Lucide `Trash`) next to each extra address input.
   - Update the state and ensure clicking "Guardar Datos de Tienda" persists this array.
3. **Catalog Footer Rendering**:
   - Update `src/pages/index.astro` footer.
   - If `tienda.direcciones` exists and has entries, map over them.
   - Display a flex layout of address cards:
     - If only 1 address: label it "Dirección".
     - If multiple addresses: label the first one "Dirección Principal", and the rest "Dirección Sucursal" or similar.
     - Fall back to the old `direccion` and `direccion_secundaria` fields if `direcciones` array is empty or undefined.
4. **Verification**: Run `npm run build` and test that the configuration saves and displays correctly.

## Detailed Plan: Input Focus Preservation in POS System
1. **Identify Issue**: The input element for Cédula and other customer data (Nombre, Email, etc.) in `POSSystem.tsx` was losing focus on every keystroke because `SidebarContent` was declared as a nested functional component inside `POSSystem`.
2. **Refactor**: Rename `SidebarContent` to `renderSidebarContent` and change its JSX invocation from `<SidebarContent />` to a direct function execution `{renderSidebarContent()}`. This prevents unmounting and remounting of the sidebar sub-tree on state updates.
3. **Verify**: Ensure the build runs correctly with 0 compilation errors.

## Detailed Plan: Mobile POS Checkout & API Base Fix
1. **Environment Configuration**: Trim and remove the trailing space in the frontend `.env` file for `PUBLIC_EXTERNAL_API_BASE` to prevent proxy target encoding issues.
2. **Backend Route Implementation**: In `Proyectobanano/src/routes/pedidos.routes.js`, require `aplicarMovimiento` from `./inventario.routes`. Implement the `POST /pos/checkout` route using a secure transaction. The route will accept the customer information, selected cash account, payment currency, exchange rate, and items, performing variant stock verification, client upsert, database order insertion, warehouse stock updates, cash account balance updates, cash flow transaction logging, and cashier auditing.
3. **Sales History Integration**: Add a `hideHeader` prop to `OrdersManager.tsx` and render it inside `SalesManagement.tsx` under the "Historial de Ventas" tab to replace the placeholder with the active transactional sales history list.
4. **Verification**: Build the application, confirm all routes resolve correctly, and verify transactions and sales history logs from both desktop and mobile viewports.
