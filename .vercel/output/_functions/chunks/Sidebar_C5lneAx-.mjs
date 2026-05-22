import { c as createComponent, m as maybeRenderHead, a as renderScript, r as renderTemplate, b as addAttribute, d as createAstro } from './astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import 'clsx';

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="flex items-center justify-between p-3 md:p-4 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50"> <div class="flex items-center gap-3"> <button id="toggle-sidebar" class="md:hidden p-2 rounded-md hover:bg-secondary text-foreground transition-colors"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x22="21" y2="12"></line><line x1="3" y1="6" x22="21" y2="6"></line><line x1="3" y1="18" x22="21" y2="18"></line></svg> </button> <h1 class="text-lg md:text-2xl font-bold text-foreground truncate">Panel Administrativo</h1> </div> <button id="logout-button" class="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-500/20 font-bold transition-all active:scale-95">Cerrar Sesión</button> </header> ${renderScript($$result, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Header.astro", void 0);

const $$Astro = createAstro();
const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Sidebar;
  const { pathname } = Astro2.url;
  const isActive = (path) => {
    return pathname === path || pathname === path + "/";
  };
  return renderTemplate`<!-- Mobile Overlay -->${maybeRenderHead()}<div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 hidden md:hidden transition-opacity"></div> <aside id="dashboard-sidebar" class="fixed md:static inset-y-0 left-0 w-64 p-4 bg-card/95 md:bg-card/80 backdrop-blur-md border-r border-border z-40 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none"> <div class="flex items-center justify-between mb-6 md:hidden"> <span class="font-bold text-primary">Navegación</span> <button id="close-sidebar" class="p-1 hover:bg-secondary rounded"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> </button> </div> <nav> <ul class="space-y-1"> <li> <a href="/dashboard"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Principal
</a> </li> <li> <a href="/dashboard/users"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/users") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Usuarios
</a> </li> <li> <a href="/dashboard/sales"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/sales") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Ventas
</a> </li> <li> <a href="/dashboard/products"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/products") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Inventario
</a> </li> <li> <a href="/dashboard/almacenes"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/almacenes") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Almacenes
</a> </li> <li> <a href="/dashboard/orders"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/orders") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Pedidos
</a> </li> <li> <a href="/dashboard/money"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/money") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Dinero y Caja
</a> </li> <li> <a href="/dashboard/audit"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/audit") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Auditoría
</a> </li> <li> <a href="/dashboard/settings"${addAttribute(`block px-4 py-2 rounded-md transition-colors ${isActive("/dashboard/settings") ? "bg-secondary text-secondary-foreground font-bold" : "text-foreground hover:bg-secondary/50"}`, "class")}>
Configuración
</a> </li> </ul> </nav> </aside> ${renderScript($$result, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Sidebar.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Sidebar.astro", void 0);

export { $$Header as $, $$Sidebar as a };
