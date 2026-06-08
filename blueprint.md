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
*   **Void Sale (Anular Venta) Flow**:
    *   Direct voiding for admin/manager with customizable option to refund cash balances.
    *   Authorization request submission for vendedor role requiring reason and refund details.
    *   Automatic stock reversion to order warehouse and transaction audit logging.
*   **Auto-Sliding Image Carousel on Product Cards**:
    *   Products in the public catalog showing more than one image automatically rotate through their active images.
    *   Subtle cross-fade animations with slight scaling transitions for a highly premium, smooth feel.
    *   Dynamic dot indicators at the bottom indicating active slide status.
    *   Pause-on-hover logic preventing slides from changing while users interact.
*   **Dashboard Floating Toasts**: Converted inline alert banners in key modules (POS, Money, Expenses, Cashea) to floating overlay toasts on the top-right corner, improving visibility and layout consistency.

## Current Architecture: Inventory
- **Table `producto`**: Logical unit. Aggregates `total_stock` and `variants_count`.
- **Table `variante_producto`**: Physical unit. Holds `sku`, `precio`, and `codigo_barras`.
- **Table `inventario`**: Stores single row per variant with `stock`.
- **Flow**: Adjusting stock creates a record in `movimiento_inventario` and updates `inventario.stock`.

## Recent Changes
- **Dashboard Floating Notifications (Toasts) Refactor**:
    - Replaced inline feedback boxes in `POSSystem.tsx`, `MoneyManagement.tsx`, `ExpensesManagement.tsx`, and `CasheaManager.tsx` with overlay toasts positioned on `fixed top-6 right-6 z-[9999]`.
    - Integrated standard layout classes like `shadow-2xl`, animations (`animate-in slide-in-from-top-2`), and responsive width classes.
    - Imported and updated icon usage to `CheckCircle` and `AlertTriangle` with custom dismissal actions.
- **POS Checkout Sticky Vertical Height Expansion**:
    - Removed fixed height constraint (`h-[calc(100vh-240px)]`) and overflow limits on the main POS container.
    - Made the desktop checkout sidebar container sticky (`sticky top-6 h-fit`) so it stays visible while scrolling through products.
    - Removed height limits and scrollboxes inside `renderDatosVentaCard`, allowing all customer fields, payment logs, totals, and buttons to render at their natural full height.
    - Added a `max-h-[220px] overflow-y-auto` threshold to the cart items list inside `renderCarritoCard` so it remains compact when containing many items.
- **Cashea Payment Option in POS Checkout**:
    - Added the "Cashea" payment option to the cashier dropdown menu.
    - Enhanced the accounts select menu to dynamically append a `- [Cashea]` label for accounts with `es_cashea = true`.
    - Integrated automatic account/method matching: selecting a Cashea account automatically changes the method to "Cashea", and manually selecting the "Cashea" method automatically sets the destination to the first active Cashea account.
    - Added backend-compliant checkout validations preventing payments with the "Cashea" method on regular accounts and vice versa.
- **Batch Stock Entry Layout Optimization**:
    - Converted category and brand filters from horizontal badge/pill list grids into clean, compact `<select>` dropdown lists, matching the warehouse sucursal selector.
    - Moved the product search bar below the category and brand dropdown selectors.
    - Repositioned the batch configuration input bar ("Motivo del ingreso", "Referencia", action buttons) to the bottom of the page, underneath the product variants list card.
- **Auto-Sliding Image Carousel on Product Cards**:
    - Backend: Modified the product catalog query inside `catalog.routes.js` to aggregate all active product image URLs into a JSON array (`imagenes`).
    - Frontend: Added `images?: string[]` to the `Product` interface definition in `CartConfig.tsx`. Mapped `imagenes` array inside `ProductGrid.tsx`. Updated `ProductCard.tsx` to handle auto-sliding, cross-fades, page dots indicators, and mouse hover detection.
- **Void Sale (Anular Venta) Feature**:
    - Backend: Added helper function `anularPedidoInterno` in `pedidos.routes.js` and route `POST /api/pedidos/:id/anular` (restricted to admin/manager). Updated `solicitudes.routes.js` to process and resolve `'ANULAR_VENTA'` action requests, running inside database transaction.
    - Frontend: Integrated "Anular Venta" or "Solicitar Anulación" button in the order details modal (`OrdersManager.tsx`). Implemented dialog to collect reason and cash deduction option. Added `'ANULAR_VENTA'` badge and details display in `AuthorizationRequests.tsx`. Created proxy API endpoints.
- **Sales Profitability Query Correction**:
    - Fixed the backend SQL queries in `reports.routes.js` that calculate overall KPIs and daily chart series.
    - Previously, joining `pedido` and `pedido_item` multiplied the aggregated total income when orders had multiple items.
    - Resolved this by calculating `total_ingresos` (overall and daily) on the orders table directly via separate subqueries/CTEs, while keeping item-level cost sums on the joined table structure.
- **WhatsApp Button Restriction in Layout**:
    - Restricted the floating WhatsApp button visibility inside `Layout.astro` by checking `Astro.url.pathname`.
    - The button is now hidden on all dashboard routes (`/dashboard/*`) and only renders on the public storefront catalog or other non-dashboard pages, as requested.
- **Single-Variant Layout Optimization**:
    - Modified both `BatchStockEntry.tsx` and `InventoryReports.tsx` to handle single-variant products differently: instead of rendering a grouped product header row and sub-variant rows with `↳`, products with exactly one variant are rendered as a single row. The product name is displayed directly in the first column ("Producto"), saving substantial vertical space.
    - Updated `downloadPDF` in `InventoryReports.tsx` to adopt the identical layout rule (collapsing single-variant products into a single line and including a "Producto" column), while keeping multi-variant products cleanly grouped.
- **Batch Stock Entry API Endpoints Correction**:
    - Fixed the category and brand endpoints in `BatchStockEntry.tsx`.
- **Cash Flow filtering by Warehouse, Variant Soft Deletion & Native Alerts Cleanup**:
    - Integrated sucursal dropdown filter in the Money Management dashboard.
    - Updated backend endpoints `/cuentas`, `/money/resumen`, and `/money/movimientos` to support `id_almacen` queries.
    - Added database migration `migrate_variant_soft_delete.js` to support soft deletes on variants.
    - Refactored frontend variant lists to use the DELETE method, and added active checkboxes in the edit modal.
    - Replaced all native browser `alert()` and `confirm()` dialogs in the dashboard views with styled inline alert cards.
- **Interactive Reports Statistics & Custom Charts**:
    - Implemented a dynamic metrics dashboard on the reports page.
    - Added custom interactive SVG timeline chart (Area Line Chart) with dynamic tooltip calculations on mouse hover.
    - Added custom SVG horizontal bar chart for top products.
- **Multi-Warehouse Selector & Stock Queries**:
    - Created the database migration `migrate_inventory_warehouses.js`.
    - Updated variants list endpoint query on backend to handle specific `id_almacen` or return consolidated stocks sum.
- **Route Consolidation**: Resolved warnings about duplicate API routes for `/api/brands` and `/api/categories`.
- **Cédula-Based Client System**: Transitioned from internal client IDs to a system-wide identification based on "Cédula".
- **Mobile Responsive POS (Sales Module)**:
    - Implemented mobile-first layout with bottom tab navigation (Catálogo / Carrito / Total).

## Current Architecture: Clients & Orders
- **Client Identification**: Clients are identified and upserted based on their `cliente_cedula` (Unique).
- **Order Linking**: Orders are linked directly to `cedula_cliente` instead of an internal serial ID.
- **Data Validation**: Checkout requires Cédula, Name, Email, and Phone.

## Planned Changes
- **Batch Stock Entry Pagination**: Paginate the products table inside `BatchStockEntry.tsx`.
- **Bulk Product Creation**: Implement the UI for parsing Excel/CSV files and creating products in bulk.
- **Frontend Alignment**: Update `CartDrawer.tsx` to include Cédula field and mandatory contact info.
- **Dashboard Orders**: Update `OrdersManager.tsx` to display `cedula_cliente`.
- **Warehouses Module (Almacenes)**: Integrate the new Warehouses management section.
- **Banana Icon in Hero Title**: Add the yellow banana cartoon mascot to the main catalog hero banner.
- **Inventory Search Filters**: Expand the product management search bar.
- **Catalog Home Link & Mobile Search Bar Space**: Add home navigation buttons.
- **User-Warehouse Association**: Associate user accounts with specific sucursales.
- **POS/Sales Interface Aesthetic Redesign**: Redesign the POS panel to align with the global fuchsia/glassmorphism design theme.

## Detailed Plan: Bulk Product Creation
1. **API Integration**: Added `/api/bulk/parse-file` and `/api/bulk/create` to `api.ts`.
2. **Component Creation**: Develop `BulkProductUpload.tsx` using Tailwind CSS and Radix UI.
3. **Integration**: Add the new component as a tab in the Inventory management section.
4. **Validation**: Ensure feedback for successful uploads and error handling for invalid files.

## Detailed Plan: Warehouses Module (Almacenes)
1. **Types Definition**: Add `Almacen` interface.
2. **API Endpoint Map**: Update `src/services/api.ts` to include the `ALMACENES` routes.
3. **Astro Route Proxies**: Create proxy routes under `src/pages/api/almacenes/`.
4. **React Management Component**: Create `src/components/Dashboard/Warehouses/WarehouseManagement.tsx`.
5. **Dashboard Route & Navigation**: Update `Sidebar.astro` and create `dashboard/almacenes.astro`.
6. **Verification & Testing**: Verify building the project and check console diagnostics.

## Detailed Plan: Banana Icon in Hero Title
1. **Source Identificator**: Identify the banana mascot image (`/logo_original.png`).
2. **Visual Enhancements**: Update `src/pages/index.astro` in the Hero Banner Section.
3. **Styles Definition**: Add the `@keyframes float` CSS definition.
4. **Verification**: Check the browser preview.

## Detailed Plan: Inventory Search Filters
1. **Option Fetching**: Retrieve list of categories and brands.
2. **State Additions**: Add states for `selectedCategory`, `selectedBrand`, and `selectedStatus`.
3. **Layout Redesign**: Expand the search controls row in `ProductList.tsx`.
4. **Reset Button**: Offer a "Limpiar Filtros" action button.
5. **Filtering Logic**: Calculate `filteredProducts`.
6. **Verification**: Compile and preview the dashboard.

## Detailed Plan: Catalog Home Link & Mobile Search Bar Space
1. **Logo Link & Floating Home Button**: Add home navigation buttons.
2. **Filters Collapsible State**: In `src/components/Shop/ProductGrid.tsx`, add a React state `showMobileFilters`.
3. **Responsive Search & Filter Toggle Row**: Restructure the filter panel.
4. **Conditional Expanded Display**: Wrap the price range inputs, sort select, etc.
5. **Verification**: Build the project and test responsiveness.

## Detailed Plan: Multi-Warehouse Inventory (Consolidated Stock)
1. **Database Migration Script**: Create `migrate_inventory_warehouses.js`.
2. **Catalog Query Consolidation**: Modify `catalog.routes.js` to sum stock across all warehouses.
3. **Movement & Stock Updates**: Update `inventario.routes.js` to handle `id_almacen` for movements.
4. **Verification**: Run database migration and test stock tracking.

## Detailed Plan: Warehouse Selector in Inventory Management
1. **Backend Route Parameter**: Update `variants.routes.js`.
2. **Fetch Warehouses**: In `ProductInventoryTab.tsx`, call `FetchData` to request warehouses.
3. **Dropdown Filter Control**: Render a Select input in the tab header.
4. **Movement Dialog Dropdown**: Render a Select input in the "Registrar Movimiento" dialog.
5. **Verification**: Verify that selecting a warehouse updates variant stock numbers.

## Detailed Plan: User-Warehouse Association
1. **Database Migration**: Create `migrate_users_warehouse.js`.
2. **Backend Authentication**: Update `POST /login` to retrieve `id_almacen`.
3. **Backend Users Controller**: Update `GET`, `POST`, and `PATCH` routes for user warehouse management.
4. **Backend Products Controller**: Filter `LEFT JOIN public.inventario` by `id_almacen`.
5. **Frontend User List**: Add "Sucursal" column to `UserList.tsx`.
6. **Frontend User Forms**: Update `CreateUserDialog.tsx` and `EditRoleDialog.tsx`.
7. **Frontend POS System**: Update `POSSystem.tsx` to read the cashier's `id_almacen`.

## Detailed Plan: POS/Sales Interface Aesthetic Redesign
1. **Layout & Backgrounds**: Replace hardcoded background colors with theme tokens.
2. **Branding Colors**: Update text and buttons to fuchsia-themed configurations.
3. **Card Glassmorphism**: Modify container `<Card>` tags.
4. **Input Styles**: Adapt input and select fields.
5. **Verification**: Confirm visual compliance inside the "Ventas" dashboard tab.

## Detailed Plan: Inventory Filter by Warehouse
1. **State Addition**: Add `warehouses` listing and `selectedWarehouse` states to `ProductList.tsx`.
2. **Fetch active warehouses**: Retrieve the list of active warehouses.
3. **Add select filter**: Render a warehouse selector select dropdown.
4. **Pass parameter to query**: Append `id_almacen` to query parameters.
5. **Verification**: Run `npx astro check`.

## Detailed Plan: Multi-Currency Accounts & POS Integration
1. **Database Migration**: Create `migrate_money_accounts.js`.
2. **Backend Routers**: Create `cuentas.routes.js`, `money.routes.js`, and `POST /pos/checkout` in `pedidos.routes.js`.
3. **Astro Proxies**: Create endpoints for `/api/money/` and `/api/pos/checkout/`.
4. **POS Interface Integration**: Update `POSSystem.tsx` for account dropdowns and currency conversions.
5. **Money Dashboard module**: Redesign `MoneyManagement.tsx` for account monitoring.

## Detailed Plan: Header and Sticky Search Bar Optimization
1. **Header Refinement**: Adjust padding and font sizes in `src/pages/index.astro`.
2. **Sticky Filters**: Add sticky class to the main filters container in `ProductGrid.tsx`.
3. **User Edit Proxy Fix**: Include `'warehouse'` in allowedActions in `src/pages/api/users/[id]/[action].ts`.
4. **POS Header & Redundant Button Cleanups**: Display cashier details and remove redundant buttons in `POSSystem.tsx`.
5. **Verification**: Run build and inspect responsive scaling.

## Detailed Plan: Multiple Address List in Settings
1. **Interface Update**: Add `direcciones?: string[];` to `SettingsData['tienda']`.
2. **Form Field list**: Replace address inputs with a dynamic list of text inputs.
3. **Catalog Footer Rendering**: Update `src/pages/index.astro` footer.
4. **Verification**: Run `npm run build` and test settings.

## Detailed Plan: Input Focus Preservation in POS System
1. **Identify Issue**: Sidebar component re-rendering causing focus loss.
2. **Refactor**: Rename `SidebarContent` to `renderSidebarContent` and execute as a function.
3. **Verify**: Ensure the build runs correctly.

## Detailed Plan: Mobile POS Checkout & API Base Fix
1. **Environment Configuration**: Trim trailing space in `.env`.
2. **Backend Route Implementation**: Implement `POST /pos/checkout` using a secure transaction.
3. **Sales History Integration**: Integrate `OrdersManager.tsx` in `SalesManagement.tsx`.
4. **Verification**: Verify build and route resolution.

## Detailed Plan: POS Layout Visual Optimization
1. **Layout Card Separation**: Extract Cart and Form into separate rendering methods.
2. **Main Layout Grid**: Maintain responsive grid layout.
3. **Stacked Sidebar**: Stack cards on the right-side column.
4. **Form Grid Alignment**: Compact grid for customer and payment details.
5. **Verification**: Inspect dashboard rendering.

## Detailed Plan: Independent Reports Module
1. **Remove Tab in Product Management**: Remove `InventoryReports` from `ProductsManagement.tsx`.
2. **Create Standalone Astro Page**: Create `dashboard/reports.astro`.
3. **Update Navigation Menu**: Add "Reportes" link to `Sidebar.astro`.
4. **Verification**: Test the pages in the browser.

## Detailed Plan: Align Reports with Multi-Warehouse Architecture
1. **Backend Route Parameter**: Update `reports.routes.js` SQL queries.
2. **Astro Route Proxies**: Update proxy endpoints for reports.
3. **Frontend Warehouse Selector**: Add warehouse select dropdown in `InventoryReports.tsx`.
4. **PDF/CSV Personalization**: Dynamically update titles and filenames.
5. **Verification**: Verify project compilation.

## Detailed Plan: Interactive Statistics Dashboard in Reports
1. **Astro API Proxy**: Add `salidas-serie.ts`.
2. **Filters & State Integration**: Add states for dates, KPIs, and charts.
3. **Layout Rendering**: Display KPI cards and responsive filter controls.
4. **Custom SVG Graphics**: Build `LineChart` and `BarChart` components.
5. **Download Filters Synchronization**: Pass filters to CSV/PDF fetch requests.
6. **Verification**: Verify compiling results.

## Detailed Plan: Cash Flow and Money Movements by Branch (Sucursal)
1. **Database Schema Integration**: Ensure `public.cuenta` references `id_almacen`.
2. **Backend API Parameter Support**: Update `cuentas`, `resumen`, and `movimientos` endpoints.
3. **Frontend Unified Selector Filter**: Add warehouse dropdown in `MoneyManagement.tsx`.
4. **Form Automation**: Default new account branch selection.

## Detailed Plan: Product Variant Soft Delete & Active Toggle
1. **Database Migration Script**: Add `eliminado` column to `public.variante_producto`.
2. **Backend Deletion Endpoint**: Soft delete variants.
3. **Frontend Deletion Confirmation**: Use DELETE method and confirmation dialog.
4. **Frontend Form Active Status**: Add active checkbox to variant edit modal.

## Detailed Plan: Label Generator Layout Unification and Rotation (No IVA)
1. **Revert to Stacked Layout**: Standardize labels vertically.
2. **Apply CSS rotation for Vertical format**: Use -90deg rotation.
3. **Keep IVA completely removed**: Ensure no tax references.
4. **Compile and Verify**: Confirm clean build.

## Detailed Plan: Enlarge Label Details, Split Price, and Persist Settings
1. **Enlarge Label Typography**: Increase font sizes and SVG dimensions.
2. **Align Price Row (Left/Right)**: Flex layout for price labels.
3. **Robust Settings Storage**: Use `localStorage` with lazy initializers.

## Detailed Plan: Layout Optimization for Single-Variant Products
1. **Batch Stock Entry Layout Update**: Handle single-variant rows specially.
2. **Inventory Reports Layout Update**: Match row rendering with single-variant optimization.
3. **Report Exports Update (PDF/CSV)**: Adjust export layouts.
4. **Compile and Verify**: Run build.

## Detailed Plan: Remove WhatsApp Button from Internal Dashboard
1. **Layout Conditional Check**: Check pathname in `Layout.astro`.
2. **Conditional Render**: Only show on public pages.
3. **Verification**: Build frontend.

## Detailed Plan: Batch Stock Entry Pagination
1. **State & Effect Hook Additions**: Add `page` and `PAGE_SIZE` states.
2. **Paginating Product Groups**: Slice product groups map for current page.
3. **Pagination Controls UI**: Render controls if `totalPages > 1`.
4. **Verification**: Run build.

## Detailed Plan: Mobile Responsive Dashboard and Layout Widescreen Fixes
1. **Fix Body Background Color in Layout**: Remove white background style.
2. **Apply min-w-0 on Main Flex Children**: Update main wrapper classes.
3. **Enhance Batch Stock Entry Inputs & Actions Layout**: Refactor bottom bar grid.
4. **Make Dashboard Navigation Tabs Scrollable**: Allow horizontal swipe on mobile.
5. **Verify**: Build and run.

## Detailed Plan: Server-Side Catalog Filtering (Categories, Brands, Price Ranges)
1. **Enhance Backend Products Catalog Route**: Update `catalog.routes.js` with dynamic SQL.
2. **Refactor Frontend Product Grid Component**: Update fetch hook in `ProductGrid.tsx`.
3. **Verify**: Test filtering.

## Detailed Plan: Logo Usage Refinement
1. **Logo Reversion**: Restore original mascot.
2. **Icon Separation**: Reserve separate icon for PWA.
3. **Verify**: Inspect rendering.

## Detailed Plan: Seller Stock Entry in Multiple Warehouses
1. **Backend Route Update**: Adjust constraints for seller-initiated movements.
2. **Frontend Component Update**: Relax restrictions in `ProductVariantsTab.tsx`.
3. **Compile and Verify**: Run build.

## Detailed Plan: Seller Deletion & Output Restrictions & Audit Request Routing
1. **Auditoría UI Tabs Integration**: Use Tabs in `AuditLogViewer.tsx`.
2. **Backend Deletion and Output Requests Handling**: Support `REGISTRAR_SALIDA`.
3. **Product Deletion Authorization Requests**: Use custom dialog for sellers in `ProductList.tsx`.
4. **Variant Deletion and Output Authorization Requests**: Handle seller stock output/deletion in `ProductVariantsTab.tsx`.
5. **Compile and Verify**: Run build.

## Detailed Plan: Product Inventory Tab Stock Output Request Handling
1. **Import Update**: Include `Textarea` and `CheckCircle2` in `ProductInventoryTab.tsx`.
2. **State & Roles Addition**: Filter `isVendedor` role.
3. **Form Interceptor**: Intercept stock output submissions.
4. **Request Submission**: POST `REGISTRAR_SALIDA` request.
5. **Build and Validation**: Compile.

## Detailed Plan: Stock Transfers Between Warehouses
1. **Backend Route Additions**: Add transfer endpoint and action resolution.
2. **Frontend Endpoint & Proxy**: Register transfer endpoint.
3. **Frontend Tab UI & Interception**:
    - In `ProductInventoryTab.tsx`, declare `selectedWarehouseDest` state variable.
    - Add a "Transferencia (entre almacenes)" option to movement type select.
    - If selected, show a destination warehouse select field (excluding the source warehouse) and hide cost units.
    - Intercept transfers for `vendedor` to show the request dialog, generating a `TRANSFERIR_STOCK` request.
4. **Resolution Layout mapping**:
    - In `AuthorizationRequests.tsx`, add `TRANSFERIR_STOCK` badge case.
    - Fetch active warehouses to map IDs to names in the resolution modal, and display transfer details (source, destination, quantities) when viewing transfer authorization requests.

## Detailed Plan: Cashea Option in POS Checkout
1. **Dropdown Upgrades**:
   - In `POSSystem.tsx`, add `<option value="Cashea">Cashea</option>` to the method selection box.
   - Modify the accounts mapper in the dropdown options to append ` - [Cashea]` when mapping accounts where `es_cashea` is active.
2. **Linked Account/Method Auto-select**:
   - Inside `updatePago`, when `id_cuenta` is changed: check if the selected account is a Cashea account. If so, automatically set `metodo` to `'Cashea'`. If not and the method is `'Cashea'`, reset it to `'Efectivo'`.
   - When `metodo` is changed to `'Cashea'`: find the first account with `es_cashea === true` in state and set it as the active `id_cuenta`.
3. **Validation & Security**:
   - In `handleCheckout`, loop through payments and ensure that:
     - The "Cashea" payment method is only allowed on accounts configured as Cashea accounts.
     - Accounts marked as Cashea can only receive payments using the "Cashea" method.
4. **Verification**:
   - Build the frontend project with `npm run build` to verify compiling results are clean.

## Detailed Plan: POS Checkout Vertical Height Expansion (Largo no Ancho)
1. **Container Height Relaxations**:
   - In [POSSystem.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Sales/POSSystem.tsx), remove the fixed height constraint `h-[calc(100vh-240px)]` and `overflow-hidden` on the layout wrapper.
   - Remove `overflow-hidden` and `flex-1` from the main grid layout container.
   - Remove `flex-1` and `overflow-y-auto` from the catalog grid container so it flows naturally.
2. **Sticky Sidebar & Cart constraints**:
   - Make the desktop sidebar column container `sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-1` so it stays locked to the screen on scroll and is scrollable as a single unit when the viewport height is exceeded.
   - Remove `max-h-[35%]` and other height limitations from the Cart card container.
   - Limit the cart items list inside `renderCarritoCard` using `max-h-[220px] overflow-y-auto` to prevent it from growing excessively.
3. **Sales Data Form Expansion**:
   - Remove `h-full` and `overflow-hidden` from the Card in `renderDatosVentaCard`.
   - Remove `overflow-y-auto` and `flex-1` from its `CardContent` so the card expands naturally to render all input elements.
4. **Verification**:
   - Build the frontend project with `npm run build` to verify compiling results are clean.

## Detailed Plan: Dashboard Floating Notifications (Toasts)
1. **Design System & Layout**:
   - Refactor feedback messages (success and error alerts) into overlay toasts using `fixed top-6 right-6 z-[9999] bg-emerald-600` for success and `bg-red-600` for errors, along with slide-in animations (`animate-in slide-in-from-top-2`) and deep shadows (`shadow-2xl`).
2. **Apply to Key Modules**:
   - **POS System** ([POSSystem.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Sales/POSSystem.tsx)): Replace inline banners with overlay toasts.
   - **Money Management** ([MoneyManagement.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Money/MoneyManagement.tsx)): Replace inline banners with overlay toasts.
   - **Expenses Management** ([ExpensesManagement.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Expenses/ExpensesManagement.tsx)): Replace inline banners with overlay toasts and import `CheckCircle`.
   - **Cashea Manager** ([CasheaManager.tsx](file:///c:/Users/aniba/Downloads/TRABAJO%20DE%20GRADO/banano-shop-ft/src/components/Dashboard/Cashea/CasheaManager.tsx)): Replace inline banners with overlay toasts and import `CheckCircle`.
3. **Verification**:
   - Run production compilation (`npm run build`) to ensure the codebase remains clean and compiles successfully.

## Detailed Plan: Label Generator Rotation and Page Size Alignment
1. **Fix Inverted Orientation Checks**:
   - Update `printRotation` and `effectiveScale` in `LabelGenerator.tsx` to apply `-90deg` and the scaled-down width factor specifically when orientation is `vertical`, and `0deg` and normal scale when orientation is `horizontal`.
2. **Dynamic Page Size & Dimensions**:
   - Change the print `@page` rule to use dynamic size: landscape layout for horizontal (`${labelWidth}mm ${labelHeight}mm landscape`), and portrait layout for vertical (`${labelHeight}mm ${labelWidth}mm portrait`).
   - Match `.label-page` width and height to these dynamic page sizes.
3. **Flexbox Centering, Normalized Dimensions & Page Break Refactoring**:
   - Standardize page sizing to always use static physical dimensions (`labelWidth` x `labelHeight`) to prevent height overflow feed gaps.
   - Set `.label-page` height to be slightly smaller than the page size (`${labelHeight - 0.5}mm`) to prevent browser rounding errors and print margins from naturally triggering page breaks. This avoids double-page breaks (blank pages in between).
   - Refactor layout elements to align and center using standard Flexbox properties (`display: flex; align-items: center; justify-content: center;`) on the `.label-page` container. This completely eliminates absolute coordinates (`position: absolute; left: 50%; top: 50%`) and translation shifts (`translate(-50%, -50%)`), avoiding layout displacement on the first page during Chrome print render initialization.
   - Apply `page-break-after: always;` on `.label-page` with a `:last-of-type` override to handle page transitions cleanly.
4. **Verification**:
   - Run `npm run build` and manually check formatting of the print output.
