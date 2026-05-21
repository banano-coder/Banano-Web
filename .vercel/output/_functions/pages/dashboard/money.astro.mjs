/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { $ as $$Footer } from '../../chunks/Footer_Jq4O6KSJ.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import 'react';
import { B as Badge } from '../../chunks/badge_Iq-H4wPg.mjs';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, c as CardDescription } from '../../chunks/card_tvzaMCZO.mjs';
import { Coins } from 'lucide-react';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const MoneyManagement = () => {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Dinero y Caja" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Gestión de flujo de caja, ingresos y egresos." })
      ] }),
      /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "px-3 py-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-bold uppercase tracking-widest", children: "En Desarrollo" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: /* @__PURE__ */ jsxs(Card, { className: "bg-card/50 backdrop-blur-sm border-dashed", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Efectivo en Caja" }),
        /* @__PURE__ */ jsx(Coins, { className: "h-4 w-4 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: "$0.00" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Esperando integración..." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "w-full border-dashed", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Movimientos de Caja" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Aquí aparecerá el histórico de entradas y salidas de dinero." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "h-[300px] flex items-center justify-center border-t", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-primary/5 rounded-full inline-block", children: /* @__PURE__ */ jsx(Coins, { className: "h-8 w-8 text-primary/40" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground italic", children: "El módulo de dinero se activará en la próxima fase." })
      ] }) })
    ] })
  ] });
};

const $$Money = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dinero y Caja - Panel Administrativo" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 p-6 md:p-8"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager"], "panelName": "Dinero y Caja", "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "MoneyManagement", MoneyManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Money/MoneyManagement", "client:component-export": "MoneyManagement" })} ` })} </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/money.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/money.astro";
const $$url = "/dashboard/money";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Money,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
