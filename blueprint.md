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
- **Seller Stock Entry in Multiple Warehouses**:
    - Modified backend `inventario.routes.js` to allow salespeople (vendedores) to register stock entries (`entrada`) in any warehouse without sucursal restriction.
    - Updated frontend `ProductVariantsTab.tsx` to enable the quick stock warehouse input fields for vendedores, allowing them to enter values for all locations.
- **Logo Usage Refinement**:
    - Restored `/public/logo_original.png` to the original transparent banana mascot image, which is used throughout the pages/system (header, hero title, footer).
    - Kept `/public/app_icon.png` as the colorful gradient background icon, ensuring it is only used for app installation/shortcuts (like desktop icons).
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
*   **Interactive Statistics Dashboard in Reports**:
    *   Integrated dynamic metrics panels directly on the standalone **Reportes** page dashboard.
    *   Warehouse selector and custom date range filters (`Desde`/`Hasta`) update metrics in real-time.
    *   Four glassmorphic KPI status cards showing: Total Stock, Stock Crítico alerts count, Despachos transaction count, and Costo de Salidas total cost of sorties.
    *   Custom interactive SVG Area Line Chart showing unit dispatch history with date/quantity tooltip hover cards.
    *   Custom SVG horizontal bar chart displaying ranking of top 5 variants dispatched with fuchsia-to-pink gradients.
    *   Synchronized CSV/PDF downloads with the selected warehouse and date filters.
*   **Cash Flow filtering by Warehouse**:
    *   Integrated `id_almacen` support across cash balance summaries, accounts list, and detailed transaction logs.
    *   Added a sucursal dropdown selector at the top of the **Caja y Dinero** page, enabling managers/admins to inspect financial states per branch in real-time.
    *   Automated default branch selections inside bank and cash accounts creation forms.
*   **Variant Soft Deletion**:
    *   Migrated variant deactivation triggers into a proper soft delete (`DELETE /variants/:id` request).
    *   Created database migrations to track deleted items using an `eliminado` field and automatically filter them out from products variants list queries.
    *   Added a dedicated "Activa" toggle field in the variant edit dialog to preserve status adjustments without deletion.

## Current Architecture: Inventory
- **Table `producto`**: Logical unit. Aggregates `total_stock` and `variants_count`.
- **Table `variante_producto`**: Physical unit. Holds `sku`, `precio`, and `codigo_barras`.
- **Table `inventario`**: Stores single row per variant with `stock`.
- **Flow**: Adjusting stock creates a record in `movimiento_inventario` and updates `inventario.stock`.

## Recent Changes
- **WhatsApp Button Restriction in Layout**:
    - Restricted the floating WhatsApp button visibility inside `Layout.astro` by checking `Astro.url.pathname`.
    - The button is now hidden on all dashboard routes (`/dashboard/*`) and only renders on the public storefront catalog or other non-dashboard pages, as requested.
- **Single-Variant Layout Optimization**:
    - Modified both `BatchStockEntry.tsx` and `InventoryReports.tsx` to handle single-variant products differently: instead of rendering a grouped product header row and sub-variant rows with `↳`, products with exactly one variant are rendered as a single row. The product name is displayed directly in the first column ("Producto"), saving substantial vertical space.
    - Updated `downloadPDF` in `InventoryReports.tsx` to adopt the identical layout rule (collapsing single-variant products into a single line and including a "Producto" column), while keeping multi-variant products cleanly grouped.
- **Batch Stock Entry API Endpoints Correction**:
    - Fixed the category and brand endpoints in `BatchStockEntry.tsx` from `/api/categorias` and `/api/marcas` (which returned 404) to the correct proxy paths `API_ENDPOINTS.CATEGORIES.LIST` (`/api/categories`) and `API_ENDPOINTS.BRANDS.LIST` (`/api/brands`), allowing warehouses, categories, brands, and products to load properly.
- **Cash Flow filtering by Warehouse, Variant Soft Deletion & Native Alerts Cleanup**:
    - Integrated sucursal dropdown filter in the Money Management dashboard.
    - Updated backend endpoints `/cuentas`, `/money/resumen`, and `/money/movimientos` to support `id_almacen` queries.
    - Added database migration `migrate_variant_soft_delete.js` to support soft deletes on variants.
    - Refactored frontend variant lists to use the DELETE method, and added active checkboxes in the edit modal.
    - Replaced all native browser `alert()` and `confirm()` dialogs in the dashboard views (`MoneyManagement.tsx`, `ProductInventoryTab.tsx`, `ProductImagesTab.tsx`, `LabelGenerator.tsx`, `OrdersManager.tsx`, `POSSystem.tsx`) with styled inline alert cards matching the global glassmorphic dashboard theme and Radix UI `<AlertDialog>` components.
- **Interactive Reports Statistics & Custom Charts**:
    - Implemented a dynamic metrics dashboard on the reports page.
    - Added custom interactive SVG timeline chart (Area Line Chart) with dynamic tooltip calculations on mouse hover.
    - Added custom SVG horizontal bar chart for top products.
    - Updated backend API proxies with `salidas-serie.ts` to support retrieval of temporal exit patterns.
    - Integrated warehouse and date range filters directly updating the metric components via parallel API fetches.
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
- **Batch Stock Entry Pagination**: Paginate the products table inside `BatchStockEntry.tsx` to optimize client-side rendering performance with large datasets.
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

## Detailed Plan: POS Layout Visual Optimization
1. **Layout Card Separation**: Extract the Carrito (Cart) and Datos de la Venta (Sales Form) cards into separate helper rendering methods (`renderCarritoCard` and `renderDatosVentaCard`) in `POSSystem.tsx`.
2. **Main Layout Grid**: Keep the responsive 2-column layout for `lg` and up: `lg:grid-cols-[3fr_2fr] xl:grid-cols-[1.6fr_1fr] 2xl:grid-cols-[2fr_1fr]`.
3. **Stacked Sidebar**: Render both cards stacked vertically in the right-side column using `renderSidebarContent()`, with the Cart occupying the top (max-h 35%) and the Data Form taking the remaining height.
4. **Form Grid Alignment**:
   - Customer details grid: Lay out fields compactly: Cédula (`col-span-3`), Nombre (`col-span-5`), Teléfono (`col-span-4`) on Row 1; Email (`col-span-6`), Observación (`col-span-6`) on Row 2.
   - Payment list grid: Use spacious grid alignments to prevent text clipping: Cuenta Destino (`col-span-7`) and Método (`col-span-5`) on Row 1; Referencia (`col-span-6`) and Monto USD (`col-span-6`) on Row 2; Monto local (`col-span-6`) and Tasa (`col-span-6`) on Row 3 for non-USD payments.
5. **Verification**: Run `npm run build` and manually inspect the dashboard to ensure correct rendering.

## Detailed Plan: Independent Reports Module
1. **Remove Tab in Product Management**: Open `ProductsManagement.tsx` and delete the "Reportes" `<TabsTrigger>` and `<TabsContent>` containing `<InventoryReports />`. Remove the import of `InventoryReports`.
2. **Create Standalone Astro Page**: Create `src/pages/dashboard/reports.astro`. Embed `Layout`, `Header`, `Sidebar`, `Footer`, `AuthGuard` (allowed roles: admin, manager, vendedor, viewer), and render the `<InventoryReports client:load />` component wrapped in a beautiful title and card layout.
3. **Update Navigation Menu**: Add a new nav link to `/dashboard/reports` labeled "Reportes" right under "Almacenes" in `Sidebar.astro`.
4. **Verification**: Run `npm run build` and test the pages in the browser.

## Detailed Plan: Align Reports with Multi-Warehouse Architecture
1. **Backend Route Parameter**: Update `reports.routes.js` to accept `id_almacen` in query parameters and append `m.id_almacen = $X` to SQL query conditions for `/reports/inventario/top-salidas`, `/reports/inventario/salidas-serie`, `/reports/movimientos/kpis`, and `/reports/movimientos/detalle`.
2. **Astro Route Proxies**: Update proxy endpoints for reports (`top-salidas.ts`, `movimientos-detalle.ts`, `movimientos-kpis.ts`) to forward `id_almacen` query parameters to the backend.
3. **Frontend Warehouse Selector**: Fetch active warehouses dynamically in `InventoryReports.tsx` and render a fuchsia-styled `<select>` dropdown at the top of the dashboard.
4. **PDF/CSV Personalization**: Update PDF subtitles and CSV filenames to dynamically reflect the selected warehouse name.
5. **Verification**: Verify project compilation with `npm run build`.

## Detailed Plan: Interactive Statistics Dashboard in Reports
1. **Astro API Proxy**: Add `src/pages/api/reports/salidas-serie.ts` to proxy requests to backend `/reports/inventario/salidas-serie`, forwarding `id_almacen`, `from`, `to`, and `granularity` search parameters along with authorization cookies.
2. **Filters & State Integration**: Add React states for date ranges (defaulting to the last 30 days), KPIs (`kpiData`), top sales (`topSales`), stock counts (`stockTotal`), critical items count (`criticalCount`), and historical outputs (`seriesData`).
3. **Layout Rendering**: Render responsive filters card with warehouse select and date range controls. Below it, display 4 glassmorphic KPI cards (Total Stock, Stock Crítico, Despachos, Costo de Salidas) with fuchsia and colored highlights.
4. **Custom SVG Graphics**:
   - `LineChart`: Build responsive SVG Area Line Chart with custom path commands (`M` and `L` layout mapping), linear area gradients, glowing stroke, gridlines, axes labels, and dynamic tooltips on mouse hover.
   - `BarChart`: Build horizontal progress bars with fuchsia-to-pink gradient fills representing the top variants.
5. **Download Filters Synchronization**: Pass selected `from`, `to`, and `id_almacen` filters in CSV and PDF download fetch requests to make reports match the dashboard view.
6. **Verification**: Run `npm run build` to verify compiling results.

## Detailed Plan: Cash Flow and Money Movements by Branch (Sucursal)
1. **Database Schema Integration**: Confirm that financial accounts (`public.cuenta`) contain `id_almacen` references linking them to warehouses/sucursales.
2. **Backend API Parameter Support**:
   - Update `GET /cuentas` to parse `id_almacen` and filter active accounts.
   - Update `GET /money/resumen` to accept `id_almacen` and restrict balance totals and transaction metrics by branch.
   - Update `GET /money/movimientos` to accept `id_almacen` and join `public.cuenta` to restrict transaction logs to accounts under that warehouse.
3. **Frontend Unified Selector Filter**: Add `selectedWarehouseId` state and render a dropdown in the `MoneyManagement.tsx` header. Load accounts, summaries, and transactions with the dynamic sucursal query filter in real-time.
4. **Form Automation**: Default the sucursal select input value in the "Crear Nueva Cuenta" modal to match the active top-level filter.

## Detailed Plan: Product Variant Soft Delete & Active Toggle
1. **Database Migration Script**: Create and run `migrate_variant_soft_delete.js` adding the `eliminado` column to `public.variante_producto`.
2. **Backend Deletion Endpoint**: Convert backend `DELETE /variants/:id` to perform soft delete (`SET eliminado = true, activo = false`). Prevent updates or queries on soft-deleted variants in `GET` / `PATCH` variants routes.
3. **Frontend Deletion Confirmation**: Rename deactivation handler to `handleDeleteVariant`, use proper `DELETE` method call, and confirm variant deletion with `"¿Seguro que deseas eliminar esta variante?"`.
4. **Frontend Form Active Status**: Add `activo` field to form state and insert an "Activa (Disponible para venta)" checkbox inside the variant edit modal to let users deactivate variants without deleting them.

## Detailed Plan: Label Generator Layout Unification and Rotation (No IVA)
1. **Revert to Stacked Layout**: Update `LabelGenerator.tsx` so that both the print engine (`handlePrint`) and live preview render the original vertically-stacked layout (Logo Header, Barcode, Barcode Text, Product Title, and Price Line).
2. **Apply CSS rotation for Vertical format**: Apply `-90deg` rotation and dimensions swap in CSS when vertical orientation is active.
3. **Keep IVA completely removed**: Ensure only final list price is displayed, with no tax base or IVA percentage references.
4. **Compile and Verify**: Run `npm run build` to confirm compiling results are clean.

## Detailed Plan: Enlarge Label Details, Split Price, and Persist Settings
1. **Enlarge Label Typography**: Update sizes in CSS inside `handlePrint` and live preview. Increase logo and shop name heights, SKU code size, and product title fonts. Adjust barcode SVG height to prevent page height overflow.
2. **Align Price Row (Left/Right)**: Convert price row into a full-width container (`width: 100%`) using flex layout with `justify-content: space-between` and horizontal padding. This ensures "PRECIO:" sits on the far left and the amount on the far right.
3. **Robust Settings Storage**: Refactor `useState` inside `LabelGenerator.tsx` to load values immediately from `localStorage` using lazy initializers (function state initializers). This prevents lifecycle race conditions from resetting user settings.

## Detailed Plan: Layout Optimization for Single-Variant Products
1. **Batch Stock Entry Layout Update**:
   - In `BatchStockEntry.tsx`, modify the table rows rendering logic.
   - For product groups with **more than 1 variant**, keep the current layout: a header row for the product name and subsequent variant rows starting with `↳`.
   - For product groups with **exactly 1 variant**, do not render the product header row. Instead, render a single row where the first column ("Producto") contains the product name (styled `font-semibold text-foreground/80`), and the other columns display the variant details directly.
2. **Inventory Reports Layout Update**:
   - In `InventoryReports.tsx`, add the "Producto" column as the first column of the table (matching `BatchStockEntry.tsx`).
   - Modify the table rows rendering logic to behave identically to the Batch Stock Entry layout:
     - Multi-variant products: Render a header row with `colSpan=9` for the product name, and subsequent variant rows with the `↳` arrow in the "Producto" column.
     - Single-variant products: Do not render the product header row. Render a single variant row where the "Producto" column displays the product name directly.
3. **Report Exports Update (PDF/CSV)**:
   - Update `downloadPDF` in `InventoryReports.tsx` to follow the same visual optimization:
     - Multi-variant products: Render a group header row (colSpan=9) and subsequent rows with the `↳` prefix in the "Producto" column.
     - Single-variant products: Omit the group header row and write the product name in the first column of the variant row.
   - Adjust column headers and widths in PDF generation to accommodate the new "Producto" column.
4. **Compile and Verify**: Run `npm run build` to verify compiling results are clean.

## Detailed Plan: Remove WhatsApp Button from Internal Dashboard
1. **Layout Conditional Check**:
   - Inside `src/layouts/Layout.astro` frontmatter, obtain the current pathname from `Astro.url.pathname`.
   - Create a boolean helper: `const showWhatsApp = !Astro.url.pathname.startsWith("/dashboard");` to identify if we are outside the dashboard.
2. **Conditional Render**:
   - Wrap the `<WhatsAppButton client:load />` component inside the layout template `<body>` tag with `{showWhatsApp && <WhatsAppButton client:load />}`.
3. **Verification**:
   - Build the frontend project with `npm run build` to guarantee compilation is successful.

## Detailed Plan: Batch Stock Entry Pagination
1. **State & Effect Hook Additions**:
   - Add state `page` initialized to `1` and page size `PAGE_SIZE = 25`.
   - Add a `useEffect` hook to reset `page` to `1` when filters (`selectedWarehouseId`, `search`, `selectedCategories`, `selectedBrands`) change.
2. **Paginating Product Groups**:
   - Inside the render function of `BatchStockEntry.tsx`, group the `filteredRows` array by `id_producto` using a `Map`.
   - Convert the group map entries to an array: `const groupEntries = Array.from(productGroups.entries());`.
   - Calculate `totalPages` as `Math.ceil(groupEntries.length / PAGE_SIZE)`.
   - Slice the array to get only the groups for the current page: `groupEntries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)`.
   - Iterate over the sliced page entries to build table rows.
3. **Pagination Controls UI**:
   - Render pagination controls (First, Previous, numeric pages with ellipses, Next, Last buttons) inside the table card footer if `totalPages > 1`.
   - Apply the fuchsia and glassmorphism styling to match the rest of the application.
4. **Verification**:
   - Run `npm run build` to verify compiling results are clean.

## Detailed Plan: Mobile Responsive Dashboard and Layout Widescreen Fixes
1. **Fix Body Background Color in Layout**:
   - In [Layout.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/layouts/Layout.astro), remove `background-color: #fff;` from the global style block for the body. This ensures that the page background defaults to the Tailwind CSS theme variables, resolving the white background gap on horizontal overflow.
2. **Apply min-w-0 on Main Flex Children**:
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

## Detailed Plan: POS Layout Visual Optimization
1. **Layout Card Separation**: Extract the Carrito (Cart) and Datos de la Venta (Sales Form) cards into separate helper rendering methods (`renderCarritoCard` and `renderDatosVentaCard`) in `POSSystem.tsx`.
2. **Main Layout Grid**: Keep the responsive 2-column layout for `lg` and up: `lg:grid-cols-[3fr_2fr] xl:grid-cols-[1.6fr_1fr] 2xl:grid-cols-[2fr_1fr]`.
3. **Stacked Sidebar**: Render both cards stacked vertically in the right-side column using `renderSidebarContent()`, with the Cart occupying the top (max-h 35%) and the Data Form taking the remaining height.
4. **Form Grid Alignment**:
   - Customer details grid: Lay out fields compactly: Cédula (`col-span-3`), Nombre (`col-span-5`), Teléfono (`col-span-4`) on Row 1; Email (`col-span-6`), Observación (`col-span-6`) on Row 2.
   - Payment list grid: Use spacious grid alignments to prevent text clipping: Cuenta Destino (`col-span-7`) and Método (`col-span-5`) on Row 1; Referencia (`col-span-6`) and Monto USD (`col-span-6`) on Row 2; Monto local (`col-span-6`) and Tasa (`col-span-6`) on Row 3 for non-USD payments.
5. **Verification**: Run `npm run build` and manually inspect the dashboard to ensure correct rendering.

## Detailed Plan: Independent Reports Module
1. **Remove Tab in Product Management**: Open `ProductsManagement.tsx` and delete the "Reportes" `<TabsTrigger>` and `<TabsContent>` containing `<InventoryReports />`. Remove the import of `InventoryReports`.
2. **Create Standalone Astro Page**: Create `src/pages/dashboard/reports.astro`. Embed `Layout`, `Header`, `Sidebar`, `Footer`, `AuthGuard` (allowed roles: admin, manager, vendedor, viewer), and render the `<InventoryReports client:load />` component wrapped in a beautiful title and card layout.
3. **Update Navigation Menu**: Add a new nav link to `/dashboard/reports` labeled "Reportes" right under "Almacenes" in `Sidebar.astro`.
4. **Verification**: Run `npm run build` and test the pages in the browser.

## Detailed Plan: Align Reports with Multi-Warehouse Architecture
1. **Backend Route Parameter**: Update `reports.routes.js` to accept `id_almacen` in query parameters and append `m.id_almacen = $X` to SQL query conditions for `/reports/inventario/top-salidas`, `/reports/inventario/salidas-serie`, `/reports/movimientos/kpis`, and `/reports/movimientos/detalle`.
2. **Astro Route Proxies**: Update proxy endpoints for reports (`top-salidas.ts`, `movimientos-detalle.ts`, `movimientos-kpis.ts`) to forward `id_almacen` query parameters to the backend.
3. **Frontend Warehouse Selector**: Fetch active warehouses dynamically in `InventoryReports.tsx` and render a fuchsia-styled `<select>` dropdown at the top of the dashboard.
4. **PDF/CSV Personalization**: Update PDF subtitles and CSV filenames to dynamically reflect the selected warehouse name.
5. **Verification**: Verify project compilation with `npm run build`.

## Detailed Plan: Interactive Statistics Dashboard in Reports
1. **Astro API Proxy**: Add `src/pages/api/reports/salidas-serie.ts` to proxy requests to backend `/reports/inventario/salidas-serie`, forwarding `id_almacen`, `from`, `to`, and `granularity` search parameters along with authorization cookies.
2. **Filters & State Integration**: Add React states for date ranges (defaulting to the last 30 days), KPIs (`kpiData`), top sales (`topSales`), stock counts (`stockTotal`), critical items count (`criticalCount`), and historical outputs (`seriesData`).
3. **Layout Rendering**: Render responsive filters card with warehouse select and date range controls. Below it, display 4 glassmorphic KPI cards (Total Stock, Stock Crítico, Despachos, Costo de Salidas) with fuchsia and colored highlights.
4. **Custom SVG Graphics**:
   - `LineChart`: Build responsive SVG Area Line Chart with custom path commands (`M` and `L` layout mapping), linear area gradients, glowing stroke, gridlines, axes labels, and dynamic tooltips on mouse hover.
   - `BarChart`: Build horizontal progress bars with fuchsia-to-pink gradient fills representing the top variants.
5. **Download Filters Synchronization**: Pass selected `from`, `to`, and `id_almacen` filters in CSV and PDF download fetch requests to make reports match the dashboard view.
6. **Verification**: Run `npm run build` to verify compiling results.

## Detailed Plan: Cash Flow and Money Movements by Branch (Sucursal)
1. **Database Schema Integration**: Confirm that financial accounts (`public.cuenta`) contain `id_almacen` references linking them to warehouses/sucursales.
2. **Backend API Parameter Support**:
   - Update `GET /cuentas` to parse `id_almacen` and filter active accounts.
   - Update `GET /money/resumen` to accept `id_almacen` and restrict balance totals and transaction metrics by branch.
   - Update `GET /money/movimientos` to accept `id_almacen` and join `public.cuenta` to restrict transaction logs to accounts under that warehouse.
3. **Frontend Unified Selector Filter**: Add `selectedWarehouseId` state and render a dropdown in the `MoneyManagement.tsx` header. Load accounts, summaries, and transactions with the dynamic sucursal query filter in real-time.
4. **Form Automation**: Default the sucursal select input value in the "Crear Nueva Cuenta" modal to match the active top-level filter.

## Detailed Plan: Product Variant Soft Delete & Active Toggle
1. **Database Migration Script**: Create and run `migrate_variant_soft_delete.js` adding the `eliminado` column to `public.variante_producto`.
2. **Backend Deletion Endpoint**: Convert backend `DELETE /variants/:id` to perform soft delete (`SET eliminado = true, activo = false`). Prevent updates or queries on soft-deleted variants in `GET` / `PATCH` variants routes.
3. **Frontend Deletion Confirmation**: Rename deactivation handler to `handleDeleteVariant`, use proper `DELETE` method call, and confirm variant deletion with `"¿Seguro que deseas eliminar esta variante?"`.
4. **Frontend Form Active Status**: Add `activo` field to form state and insert an "Activa (Disponible para venta)" checkbox inside the variant edit modal to let users deactivate variants without deleting them.

## Detailed Plan: Label Generator Layout Unification and Rotation (No IVA)
1. **Revert to Stacked Layout**: Update `LabelGenerator.tsx` so that both the print engine (`handlePrint`) and live preview render the original vertically-stacked layout (Logo Header, Barcode, Barcode Text, Product Title, and Price Line).
2. **Apply CSS rotation for Vertical format**: Apply `-90deg` rotation and dimensions swap in CSS when vertical orientation is active.
3. **Keep IVA completely removed**: Ensure only final list price is displayed, with no tax base or IVA percentage references.
4. **Compile and Verify**: Run `npm run build` to confirm compiling results are clean.

## Detailed Plan: Enlarge Label Details, Split Price, and Persist Settings
1. **Enlarge Label Typography**: Update sizes in CSS inside `handlePrint` and live preview. Increase logo and shop name heights, SKU code size, and product title fonts. Adjust barcode SVG height to prevent page height overflow.
2. **Align Price Row (Left/Right)**: Convert price row into a full-width container (`width: 100%`) using flex layout with `justify-content: space-between` and horizontal padding. This ensures "PRECIO:" sits on the far left and the amount on the far right.
3. **Robust Settings Storage**: Refactor `useState` inside `LabelGenerator.tsx` to load values immediately from `localStorage` using lazy initializers (function state initializers). This prevents lifecycle race conditions from resetting user settings.

## Detailed Plan: Layout Optimization for Single-Variant Products
1. **Batch Stock Entry Layout Update**:
   - In `BatchStockEntry.tsx`, modify the table rows rendering logic.
   - For product groups with **more than 1 variant**, keep the current layout: a header row for the product name and subsequent variant rows starting with `↳`.
   - For product groups with **exactly 1 variant**, do not render the product header row. Instead, render a single row where the first column ("Producto") contains the product name (styled `font-semibold text-foreground/80`), and the other columns display the variant details directly.
2. **Inventory Reports Layout Update**:
   - In `InventoryReports.tsx`, add the "Producto" column as the first column of the table (matching `BatchStockEntry.tsx`).
   - Modify the table rows rendering logic to behave identically to the Batch Stock Entry layout:
     - Multi-variant products: Render a header row with `colSpan=9` for the product name, and subsequent variant rows with the `↳` arrow in the "Producto" column.
     - Single-variant products: Do not render the product header row. Render a single variant row where the "Producto" column displays the product name directly.
3. **Report Exports Update (PDF/CSV)**:
   - Update `downloadPDF` in `InventoryReports.tsx` to follow the same visual optimization:
     - Multi-variant products: Render a group header row (colSpan=9) and subsequent rows with the `↳` prefix in the "Producto" column.
     - Single-variant products: Omit the group header row and write the product name in the first column of the variant row.
   - Adjust column headers and widths in PDF generation to accommodate the new "Producto" column.
4. **Compile and Verify**: Run `npm run build` to verify compiling results are clean.

## Detailed Plan: Remove WhatsApp Button from Internal Dashboard
1. **Layout Conditional Check**:
   - Inside `src/layouts/Layout.astro` frontmatter, obtain the current pathname from `Astro.url.pathname`.
   - Create a boolean helper: `const showWhatsApp = !Astro.url.pathname.startsWith("/dashboard");` to identify if we are outside the dashboard.
2. **Conditional Render**:
   - Wrap the `<WhatsAppButton client:load />` component inside the layout template `<body>` tag with `{showWhatsApp && <WhatsAppButton client:load />}`.
3. **Verification**:
   - Build the frontend project with `npm run build` to guarantee compilation is successful.

## Detailed Plan: Batch Stock Entry Pagination
1. **State & Effect Hook Additions**:
   - Add state `page` initialized to `1` and page size `PAGE_SIZE = 25`.
   - Add a `useEffect` hook to reset `page` to `1` when filters (`selectedWarehouseId`, `search`, `selectedCategories`, `selectedBrands`) change.
2. **Paginating Product Groups**:
   - Inside the render function of `BatchStockEntry.tsx`, group the `filteredRows` array by `id_producto` using a `Map`.
   - Convert the group map entries to an array: `const groupEntries = Array.from(productGroups.entries());`.
   - Calculate `totalPages` as `Math.ceil(groupEntries.length / PAGE_SIZE)`.
   - Slice the array to get only the groups for the current page: `groupEntries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)`.
   - Iterate over the sliced page entries to build table rows.
3. **Pagination Controls UI**:
   - Render pagination controls (First, Previous, numeric pages with ellipses, Next, Last buttons) inside the table card footer if `totalPages > 1`.
   - Apply the fuchsia and glassmorphism styling to match the rest of the application.
4. **Verification**:
   - Run `npm run build` to verify compiling results are clean.

## Detailed Plan: Mobile Responsive Dashboard and Layout Widescreen Fixes
1. **Fix Body Background Color in Layout**:
   - In [Layout.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/layouts/Layout.astro), remove `background-color: #fff;` from the global style block for the body. This ensures that the page background defaults to the Tailwind CSS theme variables, resolving the white background gap on horizontal overflow.
2. **Apply min-w-0 on Main Flex Children**:
   - In [products.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/products.astro), [money.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/money.astro), [reports.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/reports.astro), [sales.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/sales.astro), [users.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/users.astro), [almacenes.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/almacenes.astro), [orders.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/orders.astro), and [settings.astro](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/pages/dashboard/settings.astro), add `min-w-0` to the `<main>` wrapper (e.g. `class="flex-1 min-w-0 p-6 md:p-8"`). This tells the flex container that the main section is allowed to shrink below its default content size, letting internal `overflow-x-auto` triggers kick in on mobile viewports.
3. **Enhance Batch Stock Entry Inputs & Actions Layout**:
   - In [BatchStockEntry.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Inventory/BatchStockEntry.tsx), refactor the bottom batch config and save bar to use a responsive grid (`grid grid-cols-1 sm:grid-cols-2`) for the "Motivo" and "Referencia" inputs, and wrap the action buttons inside a flex container that scales down and wraps gracefully (`flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto`).
4. **Make Dashboard Navigation Tabs Scrollable**:
   - In [ProductsManagement.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Products/ProductsManagement.tsx), style the `TabsList` container with `w-full flex flex-nowrap overflow-x-auto justify-start h-auto scrollbar-none` classes to allow horizontal swiping/scrolling on mobile.
5. **Verify**:
   - Build and run the app to check for compilation issues.

## Detailed Plan: Server-Side Catalog Filtering (Categories, Brands, Price Ranges)
1. **Enhance Backend Products Catalog Route**:
   - In backend [catalog.routes.js](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/Proyectobanano/src/routes/catalog.routes.js), update the `GET /catalog/products` endpoint to parse `category`, `brand`, `min`, and `max` parameters.
   - Build the SQL where clause dynamically so it filters products by category ID (`id_categoria`), brand ID (`id_marca`), and filters by price using an `EXISTS` subquery verifying if the product contains active variants matching the price range (`min`/`max` on `precio_lista`).
   - Left-join the `public.categoria` and `public.marca` tables in the main SQL SELECT query to retrieve and return `category_name` and `brand_name` in the payload.
2. **Refactor Frontend Product Grid Component**:
   - In frontend [ProductGrid.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Shop/ProductGrid.tsx), update the products fetch hook to append `category`, `brand`, `min`, and `max` query parameters to the URLSearchParams.
   - Add `selectedCategory.id`, `selectedBrand.id`, `priceRange.min`, and `priceRange.max` to the `useEffect` dependency array so the frontend queries the database again whenever the user modifies filters.
   - Remove client-side filtering logic for categories, brands, and prices in the `filteredProducts` memoization, relying entirely on the server-filtered output instead.
3. **Verify**:
   - Compile the frontend and verify filtering behavior on the live catalog interface.

## Detailed Plan: Logo Usage Refinement
1. **Logo Reversion**:
   - Restore the original banana cartoon mascot (transparent background) to `public/logo_original.png` from previous commit history.
2. **Icon Separation**:
   - Reserve `public/app_icon.png` (with fuchsia/yellow gradient background) exclusively for PWA shortcuts and apple-touch-icon.
3. **Verify**:
   - Compile the frontend project with `npm run build` and inspect page layout headers and footers to ensure the transparent banana logo renders properly.

## Detailed Plan: Seller Stock Entry in Multiple Warehouses
1. **Backend Route Update**:
   - In backend [inventario.routes.js](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/Proyectobanano/src/routes/inventario.routes.js), modify the `POST /inventario/movimientos` endpoint.
   - Adjust the sucursal constraint check so that if `isVendedor` is `true`, it is bypassed when the movement type (`tipo`) is `'entrada'`.
   - In the `POST /inventario/movimientos/lote` endpoint, remove the sucursal restriction entirely (since batch stock movements are exclusively `'entrada'`).
2. **Frontend Component Update**:
   - In frontend [ProductVariantsTab.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Products/tabs/ProductVariantsTab.tsx), change `isDisabled` calculation in the quick stock management warehouse list: set `const isDisabled = false;` instead of restricting it based on `isVendedor` and `userWarehouseId`.
3. **Compile and Verify**:
   - Run `npm run build` on the frontend project to verify compiling results are clean.

