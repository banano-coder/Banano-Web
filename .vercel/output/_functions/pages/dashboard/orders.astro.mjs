/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, d as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Orders = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Orders;
  const token = Astro2.cookies.get("token")?.value;
  if (!token) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Gesti\xF3n de Pedidos - Banano Shop" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 p-6 md:p-8"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager", "vendedor"], "panelName": "Pedidos", "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "OrdersManager", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Orders/OrdersManager", "client:component-export": "OrdersManager" })} ` })} </main> </div> </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/orders.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/orders.astro";
const $$url = "/dashboard/orders";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Orders,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
