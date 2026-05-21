/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, d as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { c as cn, $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { $ as $$Footer } from '../../chunks/Footer_Jq4O6KSJ.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Layers, ShoppingCart, User, Package, Plus, Calendar, Loader2, ShieldCheck, RefreshCcw, AlertTriangle } from 'lucide-react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { I as Input } from '../../chunks/input_CS_ajWDZ.mjs';
import { B as Button } from '../../chunks/button_DdS5ZpT0.mjs';
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from '../../chunks/select_Bk1ZEmt9.mjs';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [targetType, setTargetType] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDates, setShowDates] = useState(false);
  useEffect(() => {
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
    loadUsers();
  }, []);
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (targetType) params.append("target_tipo", targetType);
      if (action) params.append("action", action);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      const res = await fetch(`/api/auditoria?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar movimientos");
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLogs();
  }, [page, targetType, action, dateFrom, dateTo]);
  const getActorInfo = (log) => {
    const name = log.actor_nombre || log.actor?.nombre || (log.actor_id ? usersMap[String(log.actor_id)] : null) || "Sistema";
    const initials = name === "Sistema" ? "S" : name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    return { name, initials };
  };
  const getEventIcon = (action2) => {
    if (action2.includes("PRODUCT") || action2.includes("VARIANT")) return /* @__PURE__ */ jsx(Package, { className: "w-3.5 h-3.5 text-blue-400" });
    if (action2.includes("PEDIDO")) return /* @__PURE__ */ jsx(ShoppingCart, { className: "w-3.5 h-3.5 text-emerald-400" });
    if (action2.includes("INV")) return /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5 text-amber-400" });
    if (action2.includes("PASSWORD") || action2.includes("ROLE") || action2 === "ENABLE" || action2 === "DISABLE") return /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-indigo-400" });
    if (action2.includes("UPDATE")) return /* @__PURE__ */ jsx(RefreshCcw, { className: "w-3.5 h-3.5 text-slate-400" });
    return /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5 text-rose-400" });
  };
  const getEventCategory = (action2) => {
    if (action2.includes("PRODUCT") || action2.includes("VARIANT")) return "Producto";
    if (action2.includes("PEDIDO")) return "Pedido";
    if (action2.includes("INV")) return "Inventario";
    if (action2.includes("PASSWORD") || action2.includes("ROLE") || action2 === "ENABLE" || action2 === "DISABLE") return "Seguridad";
    return "Sistema";
  };
  const renderEventText = (log) => {
    const { name: actorName } = getActorInfo(log);
    const action2 = log.action;
    const payload = typeof log.payload === "string" ? JSON.parse(log.payload || "{}") : log.payload || {};
    const boldActor = /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground brightness-110", children: actorName });
    const productName = log.target_producto_nombre || (log.target_label ? log.target_label.replace(/^Producto:\s*/i, "") : "un producto");
    const variantName = log.target_variante_sku || (log.target_label ? log.target_label.replace(/^Variante:\s*/i, "") : "una variante");
    const catName = log.target_label ? log.target_label.replace(/^Categoría:\s*/i, "") : "una categoría";
    const brandName = log.target_label ? log.target_label.replace(/^Marca:\s*/i, "") : "una marca";
    const userName = log.target_usuario_nombre || (log.target_label ? log.target_label.replace(/^Usuario:\s*/i, "") : "un usuario");
    switch (action2) {
      case "PRODUCT_CREATE":
      case "PRODUCT_CREATE_WITH_VARIANT":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " creó el producto ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: productName })
        ] });
      case "PRODUCT_UPDATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " actualizó el producto ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: productName })
        ] });
      case "PRODUCT_SOFT_DELETE":
      case "PRODUCT_DISABLE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "desactivó/eliminó" }),
          " el producto ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: productName })
        ] });
      case "VARIANT_CREATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " creó la variante ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "VARIANT_UPDATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " actualizó la variante ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "INV_ENTRADA":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " registró ",
          /* @__PURE__ */ jsxs("span", { className: "text-green-600 font-medium", children: [
            "entrada (+",
            payload.cantidad || "",
            ")"
          ] }),
          " para ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "INV_SALIDA":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " registró ",
          /* @__PURE__ */ jsxs("span", { className: "text-red-600 font-medium", children: [
            "salida (-",
            payload.cantidad || "",
            ")"
          ] }),
          " para ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "INV_AJUSTE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " realizó un ",
          /* @__PURE__ */ jsx("span", { className: "text-amber-600 font-medium", children: "ajuste de stock" }),
          " para ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "VARIANT_PRICE_CHANGE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-blue-600 font-medium", children: "modificó precios" }),
          " de la variante ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "VARIANT_DISABLE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500 font-medium", children: "desactivó" }),
          " la variante ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: variantName })
        ] });
      case "PEDIDO_CREAR":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " registró el ",
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
            "Pedido #",
            log.target_pedido_id
          ] })
        ] });
      case "PEDIDO_CAMBIAR_ESTADO":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " cambió el estado del ",
          /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
            "Pedido #",
            log.target_pedido_id
          ] }),
          " a ",
          /* @__PURE__ */ jsx("span", { className: "font-bold underline", children: payload.estado })
        ] });
      case "USUARIO_UPDATE_PASSWORD":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-purple-600", children: "cambió su propia contraseña" })
        ] });
      case "USUARIO_UPDATE_PERFIL":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " actualizó su perfil"
        ] });
      case "RESET_PASSWORD":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-rose-600 font-medium", children: "reseteó la contraseña" }),
          " de ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: userName })
        ] });
      case "REPLACE_ROLES":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-indigo-600 font-medium", children: "actualizó los roles" }),
          " de ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: userName })
        ] });
      case "CREATE_USER":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: "creó al usuario" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: userName })
        ] });
      case "CREATE_USER_SIGNUP":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-medium", children: "se registró" }),
          " en el sistema"
        ] });
      case "ENABLE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-green-500", children: "activó" }),
          " al usuario ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: userName })
        ] });
      case "DISABLE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "desactivó" }),
          " al usuario ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: userName })
        ] });
      case "SOFT_DELETE_USER":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-red-600 font-bold", children: "eliminó" }),
          " al usuario ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: userName })
        ] });
      case "CAT_CREATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " creó la categoría ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: catName })
        ] });
      case "CAT_UPDATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " actualizó la categoría ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: catName })
        ] });
      case "CAT_DISABLE":
      case "CAT_SOFT_DELETE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "eliminó" }),
          " la categoría ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: catName })
        ] });
      case "BRAND_CREATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " creó la marca ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: brandName })
        ] });
      case "BRAND_UPDATE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " actualizó la marca ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: brandName })
        ] });
      case "BRAND_SOFT_DELETE":
      case "BRAND_DISABLE":
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "eliminó" }),
          " la marca ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: brandName })
        ] });
      default:
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          boldActor,
          " realizó la acción ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: log.action_label || log.action }),
          log.target_label && /* @__PURE__ */ jsxs(Fragment, { children: [
            " en ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: log.target_label })
          ] })
        ] });
    }
  };
  const renderPayloadDetails = (payload) => {
    if (!payload) return null;
    const data = typeof payload === "string" ? JSON.parse(payload) : payload;
    return /* @__PURE__ */ jsx("div", { className: "mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2 rounded-md border border-border/40", children: Object.entries(data).map(([key, value]) => {
      if (key.includes("id") || key === "changes") return null;
      return /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground capitalize font-medium", children: [
          key.replace(/_/g, " "),
          ":"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground/80 truncate", children: typeof value === "object" ? JSON.stringify(value).replace(/[{}"]/g, "") : String(value) })
      ] }, key);
    }) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col md:flex-row justify-between items-end gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-extrabold tracking-tight text-foreground", children: "Registro de Movimientos" }),
        /* @__PURE__ */ jsx("p", { className: "text-base text-muted-foreground font-medium", children: "Historial de actividad reciente." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 w-full md:w-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 md:w-64", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Buscar...",
              className: "h-10 pl-9 bg-background border-border/60 rounded-lg text-sm focus-visible:ring-primary/20",
              value: action,
              onChange: (e) => setAction(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            value: targetType || "all",
            onValueChange: (val) => {
              setTargetType(val === "all" ? "" : val);
              setPage(1);
            },
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px] h-10 text-sm rounded-lg border-border/40 focus:ring-primary/20 bg-background font-semibold", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Filtrar" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Layers, { className: "w-3.5 h-3.5 opacity-60" }),
                  /* @__PURE__ */ jsx("span", { children: "Todo" })
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "pedido", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(ShoppingCart, { className: "w-3.5 h-3.5 text-green-500/70" }),
                  /* @__PURE__ */ jsx("span", { children: "Pedidos" })
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "usuario", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-blue-500/70" }),
                  /* @__PURE__ */ jsx("span", { children: "Usuarios" })
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "producto", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Package, { className: "w-3.5 h-3.5 text-orange-500/70" }),
                  /* @__PURE__ */ jsx("span", { children: "Productos" })
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "inventario", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5 text-purple-500/70" }),
                  /* @__PURE__ */ jsx("span", { children: "Inventario" })
                ] }) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: `h-9 w-9 rounded-lg border border-border/40 transition-colors ${showDates ? "bg-primary/5 text-primary border-primary/20" : "text-muted-foreground"}`,
            onClick: () => setShowDates(!showDates),
            title: "Filtrar por fecha",
            children: /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    showDates && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 p-4 bg-muted/15 rounded-xl border border-border/30 animate-in fade-in slide-in-from-top-1 duration-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-muted-foreground/80 uppercase tracking-widest", children: "Desde" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            className: "h-9 px-3 bg-background border border-border/40 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm",
            value: dateFrom,
            onChange: (e) => setDateFrom(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-muted-foreground/80 uppercase tracking-widest", children: "Hasta" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            className: "h-9 px-3 bg-background border border-border/40 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm",
            value: dateTo,
            onChange: (e) => setDateTo(e.target.value)
          }
        )
      ] }),
      (dateFrom || dateTo) && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "h-8 px-3 text-[11px] font-black text-primary hover:bg-primary/5 uppercase tracking-wider",
          onClick: () => {
            setDateFrom("");
            setDateTo("");
          },
          children: "Limpiar fechas"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/40 border-t border-b border-border/40", children: loading ? /* @__PURE__ */ jsxs("div", { className: "p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary/60" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs", children: "Sincronizando..." })
    ] }) : logs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-muted-foreground text-xs", children: "No hay movimientos para mostrar." }) : logs.map((log) => {
      const { name, initials } = getActorInfo(log);
      return /* @__PURE__ */ jsxs("div", { className: "py-5 flex gap-4 items-start hover:bg-muted/10 transition-colors px-2", children: [
        /* @__PURE__ */ jsx(Avatar, { className: "w-9 h-9 border border-border/20 shadow-sm shrink-0", children: /* @__PURE__ */ jsx(AvatarFallback, { className: `${name === "Sistema" ? "bg-slate-100 text-slate-400" : "bg-primary/5 text-primary"} text-[10px] font-bold`, children: initials }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1", children: [
            /* @__PURE__ */ jsx("div", { className: "text-base text-foreground leading-relaxed", children: renderEventText(log) }),
            /* @__PURE__ */ jsx("time", { className: "text-xs font-bold text-muted-foreground/80 shrink-0 ml-4 tabular-nums", children: format(new Date(log.created_at), "HH:mm") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-[11px] text-muted-foreground border border-border/30 shadow-sm", children: [
              getEventIcon(log.action),
              /* @__PURE__ */ jsx("span", { className: "font-black uppercase tracking-widest leading-none", children: getEventCategory(log.action) })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-muted-foreground/60 uppercase tracking-tighter", children: format(new Date(log.created_at), "dd MMM yyyy") })
          ] }),
          (log.action.includes("INV") || log.action.includes("PRICE")) && renderPayloadDetails(log.payload)
        ] })
      ] }, log.id);
    }) }),
    /* @__PURE__ */ jsxs("footer", { className: "flex items-center justify-between py-4 border-t border-border/20", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em]", children: [
        "Página ",
        page
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            disabled: page === 1 || loading,
            className: "h-9 px-5 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all active:scale-95",
            children: "Anterior"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setPage((p) => p + 1),
            disabled: logs.length < limit || loading,
            className: "h-9 px-5 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all active:scale-95",
            children: "Siguiente"
          }
        )
      ] })
    ] })
  ] });
};

const $$Astro = createAstro();
const $$Audit = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Audit;
  const token = Astro2.cookies.get("token")?.value;
  if (!token) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Auditor\xEDa | Banano Shop" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1 overflow-hidden"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 overflow-y-auto p-4 md:p-8"> <div class="max-w-5xl mx-auto"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager"], "panelName": "Auditor\xEDa", "client:component-hydration": "load", "client:component-path": "@/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "AuditLogViewer", AuditLogViewer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/Dashboard/Audit/AuditLogViewer", "client:component-export": "AuditLogViewer" })} ` })} </div> </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/audit.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/audit.astro";
const $$url = "/dashboard/audit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Audit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
