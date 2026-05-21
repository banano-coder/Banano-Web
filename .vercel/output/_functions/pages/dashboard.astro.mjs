/* empty css                                     */
import { c as createComponent, m as maybeRenderHead, e as renderComponent, r as renderTemplate } from '../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../chunks/Sidebar_C5lneAx-.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowRight, ArrowDownRight, Package, Info, User, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from '../chunks/dialog_DoyHhWGx.mjs';
import { $ as $$Footer } from '../chunks/Footer_Jq4O6KSJ.mjs';
export { renderers } from '../renderers.mjs';

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(5);
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      let currentThreshold = threshold;
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.stock?.umbral_minimo !== void 0) {
          currentThreshold = settings.stock.umbral_minimo;
          setThreshold(currentThreshold);
        }
      }
      const res = await fetch(`/api/reports/stock-bajo?threshold=${currentThreshold}`);
      if (res.ok) {
        const data = await res.json();
        const rawItems = Array.isArray(data) ? data : data.data || [];
        const mappedItems = rawItems.map((item) => ({
          ...item,
          title: item.title || item.producto || "Producto sin nombre",
          id: item.id || item.id_variante_producto
        }));
        setAlerts(mappedItems);
        setError(null);
      } else {
        setError("Error al cargar alertas");
      }
    } catch (e) {
      console.error(e);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAlerts();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-card text-card-foreground shadow-sm h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-1.5 p-6 pb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-semibold leading-none tracking-tight flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
          "Alertas de Stock Bajo"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: fetchAlerts, className: "text-muted-foreground hover:text-primary transition-colors", children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Productos con stock menor a ",
        threshold,
        " unidades."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-6 pt-0", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      loading && alerts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-4 text-sm text-muted-foreground", children: "Cargando..." }) : error ? /* @__PURE__ */ jsx("div", { className: "text-center py-4 text-sm text-destructive", children: error }) : alerts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-md", children: "✅ Todo bien. No hay productos con stock crítico." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-[300px] overflow-y-auto pr-2", children: alerts.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 overflow-hidden", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium truncate", title: item.title, children: item.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-background px-1.5 py-0.5 rounded border", children: item.sku }),
            item.variant && /* @__PURE__ */ jsxs("span", { children: [
              "• ",
              item.variant
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("span", { className: `block font-bold text-lg ${item.stock === 0 ? "text-destructive" : "text-orange-500"}`, children: item.stock }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground uppercase", children: "Stock" })
        ] }) })
      ] }, item.id)) }),
      /* @__PURE__ */ jsx("div", { className: "pt-2 border-t mt-4", children: /* @__PURE__ */ jsxs("a", { href: "/dashboard/products", className: "text-sm text-primary hover:underline flex items-center justify-center gap-1 w-full", children: [
        "Gestionar Inventario ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })
      ] }) })
    ] }) })
  ] });
};

const RecentOutlets = () => {
  const [outlets, setOutlets] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users?limit=1000");
      if (res.ok) {
        const responseData = await res.json();
        let usersList = [];
        if (Array.isArray(responseData)) usersList = responseData;
        else if (responseData.data) usersList = responseData.data;
        const map = {};
        usersList.forEach((u) => {
          map[String(u.id)] = u.nombre || u.email;
        });
        setUsersMap(map);
      }
    } catch (e) {
      console.error("Failed to load users for mapping", e);
    }
  };
  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auditoria?action=INV_SALIDA&limit=5");
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.data || []);
        setError(null);
      } else {
        setError("Error al cargar salidas");
      }
    } catch (e) {
      console.error(e);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUsers();
    fetchOutlets();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-1.5 p-6 pb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-bold leading-none tracking-tight flex items-center gap-2 text-primary", children: [
          /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-5 w-5" }),
          "Salidas Recientes"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: fetchOutlets, className: "text-muted-foreground hover:text-primary transition-colors", children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Últimos movimientos de salida registrados." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 pt-0 flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: loading && outlets.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-sm text-muted-foreground animate-pulse", children: "Sincronizando..." }) : error ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-sm text-destructive font-medium bg-destructive/5 rounded-lg border border-destructive/10", children: error }) : outlets.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-10 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60", children: "No se han registrado salidas recientemente." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: outlets.map((item) => {
        const payload = typeof item.payload === "string" ? JSON.parse(item.payload || "{}") : item.payload || {};
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setSelectedOutlet(item),
            className: "flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all group cursor-pointer",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0 group-hover:bg-primary/10 transition-colors", children: /* @__PURE__ */ jsx(Package, { className: "w-4 h-4 text-primary opacity-70" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-0", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-sm truncate text-foreground/90", children: item.target_label || item.target_variante_sku || "Producto" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest", children: format(new Date(item.created_at), "dd MMM, HH:mm") })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0 ml-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "block font-black text-rose-500 text-base", children: [
                  "-",
                  payload.cantidad || 0
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter", children: "unidades" })
              ] })
            ]
          },
          item.id
        );
      }) }) }),
      !loading && outlets.length > 0 && /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-border/20 mt-4", children: /* @__PURE__ */ jsxs("a", { href: "/dashboard/audit?target_tipo=inventario", className: "text-xs font-black text-primary hover:underline flex items-center justify-center gap-1.5 uppercase tracking-widest group", children: [
        "Ver todo el historial",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!selectedOutlet, onOpenChange: (open) => !open && setSelectedOutlet(null), children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-md bg-white/95 backdrop-blur-xl border border-border/40 shadow-2xl p-0 overflow-hidden", children: selectedOutlet && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 pb-4", children: [
        /* @__PURE__ */ jsxs(DialogHeader, { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1", children: [
            /* @__PURE__ */ jsx(Info, { className: "w-3 h-3" }),
            "Detalle de Movimiento"
          ] }),
          /* @__PURE__ */ jsx(DialogTitle, { className: "text-2xl font-extrabold tracking-tight", children: "Salida de Inventario" }),
          /* @__PURE__ */ jsx(DialogDescription, { className: "text-sm font-medium text-muted-foreground", children: "Información detallada sobre este registro de auditoría." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-primary/20 shrink-0", children: /* @__PURE__ */ jsx(Package, { className: "w-6 h-6 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary/60 uppercase tracking-widest leading-none mb-1", children: "Producto / Variante" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-black text-foreground truncate leading-tight", children: (() => {
                const p = typeof selectedOutlet.payload === "string" ? JSON.parse(selectedOutlet.payload) : selectedOutlet.payload || {};
                const rawName = p.nombre_producto || p.producto_nombre || p.nombre_variante || p.variante_nombre || p.nombre || selectedOutlet.target_producto_nombre;
                const sku = p.sku || p.variante_sku || selectedOutlet.target_variante_sku;
                const cleanLabel = (text) => {
                  if (!text) return "";
                  return text.split(" #")[0].split("#")[0];
                };
                const displayName = cleanLabel(rawName || selectedOutlet.target_label);
                if (displayName) {
                  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: displayName }),
                    sku && /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-muted-foreground mt-0.5", children: [
                      "SKU: ",
                      sku
                    ] })
                  ] });
                }
                return /* @__PURE__ */ jsx("span", { children: sku || "Sin nombre" });
              })() })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border border-border/40 bg-muted/5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5 grayscale opacity-60", children: [
                /* @__PURE__ */ jsx(User, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-wider", children: "Registrado por" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-bold text-sm text-foreground/90", children: selectedOutlet.actor_name || selectedOutlet.actor?.nombre || (selectedOutlet.actor_id ? usersMap[String(selectedOutlet.actor_id)] : null) || "Sistema" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg border border-border/40 bg-muted/5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5 grayscale opacity-60", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-wider", children: "Fecha y Hora" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-bold text-sm text-foreground/90", children: format(new Date(selectedOutlet.created_at), "dd/MM/yyyy HH:mm") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl border-2 border-rose-500/10 bg-rose-500/[0.02] flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-rose-600/60 uppercase tracking-widest block mb-0.5", children: "Cantidad Extraída" }),
              /* @__PURE__ */ jsxs("span", { className: "text-2xl font-black text-rose-500 leading-none", children: [
                "-",
                typeof selectedOutlet.payload === "string" ? JSON.parse(selectedOutlet.payload).cantidad : selectedOutlet.payload?.cantidad || 0
              ] }),
              /* @__PURE__ */ jsx("span", { className: "ml-1.5 text-xs font-bold text-rose-400 uppercase tracking-tighter", children: "unidades" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-6 h-6 text-rose-500" }) })
          ] }),
          (() => {
            const p = typeof selectedOutlet.payload === "string" ? JSON.parse(selectedOutlet.payload) : selectedOutlet.payload || {};
            const fieldOrder = [
              "tipo",
              "motivo",
              "ref_externa",
              "costo_unitario",
              "stock_antes",
              "stock_despues"
            ];
            const extraFields = Object.entries(p).filter(
              ([key]) => !["cantidad", "id", "producto_id", "variante_id", "nombre", "sku", "nombre_producto", "producto_nombre", "nombre_variante", "variante_nombre", "variante_sku", "id_variante_producto", "id_movimiento_inventario"].includes(key)
            ).sort(([a], [b]) => {
              const indexA = fieldOrder.indexOf(a);
              const indexB = fieldOrder.indexOf(b);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.localeCompare(b);
            });
            if (extraFields.length === 0) return null;
            return /* @__PURE__ */ jsxs("div", { className: "mt-2 pt-2 border-t border-border/20", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-2", children: "Detalles Adicionales" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1.5", children: extraFields.map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground/60 capitalize", children: key.replace(/_/g, " ") }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-foreground/80 truncate", children: key.includes("costo") ? `$${Number(value).toLocaleString()}` : String(value) })
              ] }, key)) })
            ] });
          })()
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-muted/30 border-t border-border/40 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest", children: [
          "Movimiento ID: #",
          selectedOutlet.id
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: `/dashboard/audit?search=${selectedOutlet.id}`,
            className: "text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:underline flex items-center gap-1.5",
            children: [
              "Ver en auditoría",
              /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })
            ]
          }
        )
      ] })
    ] }) }) })
  ] });
};

const $$MainContent = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<main class="flex-1 p-4 md:p-8 overflow-y-auto"> <div class="mb-8"> <h2 class="text-3xl font-bold text-foreground tracking-tight">Vista Principal</h2> <p class="mt-2 text-muted-foreground">Bienvenido de nuevo al panel de control.</p> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-8">  <div class="col-span-1"> ${renderComponent($$result, "StockAlerts", StockAlerts, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Home/StockAlerts", "client:component-export": "StockAlerts" })} </div>  <div class="col-span-1"> ${renderComponent($$result, "RecentOutlets", RecentOutlets, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Home/RecentOutlets", "client:component-export": "RecentOutlets" })} </div> </div> </main>`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/MainContent.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Panel Principal - Banano Shop" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} ${renderComponent($$result2, "MainContent", $$MainContent, {})} </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/index.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
