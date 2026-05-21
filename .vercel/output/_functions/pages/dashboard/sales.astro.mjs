/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { c as cn, $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { $ as $$Footer } from '../../chunks/Footer_Jq4O6KSJ.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from '../../chunks/tabs_CdwhZf1u.mjs';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from '../../chunks/card_tvzaMCZO.mjs';
import { I as Input } from '../../chunks/input_CS_ajWDZ.mjs';
import { B as Button } from '../../chunks/button_DdS5ZpT0.mjs';
import { B as Badge } from '../../chunks/badge_Iq-H4wPg.mjs';
import { Check, ArrowLeft, Search, Plus, Package, ShoppingCart, CheckCircle, Minus, X, LayoutGrid, History } from 'lucide-react';
import { F as FetchData, A as API_ENDPOINTS } from '../../chunks/api_BIGgZbYc.mjs';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      CheckboxPrimitive.Indicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const POSSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileView, setMobileView] = useState("catalog");
  const [customerData, setCustomerData] = useState({
    cedula: "",
    nombre: "",
    email: "",
    telefono: "",
    metodo: "Efectivo",
    referencia: "",
    observacion: ""
  });
  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await FetchData(API_ENDPOINTS.CATALOG.BRANDS, "GET");
        const list = Array.isArray(brandsData) ? brandsData : brandsData.data || [];
        setBrands(list.map((b) => ({
          id: String(b.id_marca || b.id),
          name: b.nombre || b.name
        })));
      } catch (e) {
        console.error("Error fetching brands for POS:", e);
      }
    };
    fetchBrands();
  }, []);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const catalogUrl = searchTerm ? `${API_ENDPOINTS.CATALOG.PRODUCTS}?q=${searchTerm}&limit=100` : `${API_ENDPOINTS.CATALOG.PRODUCTS}?limit=100`;
      const adminUrl = searchTerm ? `${API_ENDPOINTS.PRODUCTS.LIST}?search=${searchTerm}` : API_ENDPOINTS.PRODUCTS.LIST;
      const [catalogRes, adminRes] = await Promise.all([
        FetchData(catalogUrl),
        FetchData(adminUrl)
      ]);
      const catalogRaw = catalogRes.data || [];
      const adminRaw = Array.isArray(adminRes) ? adminRes : adminRes.data || [];
      const mapped = catalogRaw.map((p) => {
        const adminMatch = adminRaw.find((a) => String(a.id_producto) === String(p.id_producto));
        let brandName = p.brand_name || p.marca_nombre || p.marca?.nombre || p.marca || "";
        if (!brandName || brandName.toUpperCase() === "GENERIC") {
          const found = brands.find((b) => b.id === String(p.id_marca));
          if (found) brandName = found.name;
        }
        return {
          ...p,
          displayBrand: brandName || adminMatch?.brand_name || "Particular",
          displayPrice: Number(p.min_price) || Number(p.precio) || 0,
          displayImage: p.imagen_principal || p.image || adminMatch?.image || "https://placehold.co/400x400/261633/FFF?text=Banano",
          displayStock: adminMatch?.total_stock !== void 0 ? adminMatch.total_stock : p.stock || 0
        };
      });
      setProducts(mapped);
    } catch (error) {
      console.error("Error fetching POS products:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, brands]);
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id_producto);
    if (existing) {
      setCart(cart.map(
        (item) => item.id === product.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCart([...cart, {
        id: product.id_producto,
        nombre: product.nombre,
        precio: product.displayPrice,
        cantidad: 1,
        imagen: product.displayImage
      }]);
    }
  };
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };
  const updateQuantity = (productId, delta) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQty = item.cantidad + delta;
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }).filter((item) => item.cantidad > 0));
  };
  const SidebarContent = () => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Card, { className: "bg-white border-[#d1cdbc] shadow-sm flex flex-col max-h-[45%] lg:max-h-[40%]", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "py-3 lg:py-4 border-b border-[#f0eee4]", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm lg:text-md flex items-center gap-2 text-[#2d3a4b]", children: [
        /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4" }),
        " Carrito",
        totalItems > 0 && /* @__PURE__ */ jsxs(Badge, { className: "ml-auto bg-[#f06e1f] text-white border-none text-[10px] font-bold", children: [
          totalItems,
          " items"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "flex-1 overflow-y-auto p-3 lg:p-4", children: cart.length === 0 ? /* @__PURE__ */ jsx("div", { className: "h-full flex items-center justify-center py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsx(ShoppingCart, { className: "h-8 w-8 text-gray-300 mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Agrega productos desde el catálogo." })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2 lg:space-y-3", children: cart.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 lg:gap-3 items-center border-b border-[#f0eee4] pb-2", children: [
        /* @__PURE__ */ jsx("img", { src: item.imagen, className: "w-10 h-10 lg:w-12 lg:h-12 rounded object-contain border flex-shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[11px] lg:text-xs font-bold text-[#2d3a4b] truncate", children: item.nombre }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-[#c25121] font-bold", children: [
            "$",
            item.precio
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#d1cdbc] rounded-md overflow-hidden bg-white flex-shrink-0", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 lg:h-6 lg:w-6", onClick: () => updateQuantity(item.id, -1), children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsx("span", { className: "w-6 text-[10px] text-center font-bold", children: item.cantidad }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 lg:h-6 lg:w-6", onClick: () => updateQuantity(item.id, 1), children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }) })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600 flex-shrink-0 lg:hidden", onClick: () => removeFromCart(item.id), children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
      ] }, item.id)) }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "bg-white border-[#d1cdbc] shadow-sm flex-1 flex flex-col overflow-hidden text-[#555]", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "py-3 lg:py-4 border-b border-[#f0eee4] bg-[#f8f9fa]", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm lg:text-md flex items-center gap-2 text-[#1e3a5f]", children: [
        /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }),
        " Datos de la Venta"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 lg:gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Cédula" }),
            /* @__PURE__ */ jsx(Input, { className: "h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm", placeholder: "V12345678" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Nombre" }),
            /* @__PURE__ */ jsx(Input, { className: "h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm", placeholder: "Juan Pérez" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 lg:gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Email" }),
            /* @__PURE__ */ jsx(Input, { className: "h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm", placeholder: "juan@mail.com" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Teléfono" }),
            /* @__PURE__ */ jsx(Input, { className: "h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm", placeholder: "584121234567" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 lg:gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Método *" }),
            /* @__PURE__ */ jsxs("select", { className: "w-full h-9 lg:h-10 border border-[#e0e0e0] rounded-md px-3 text-xs bg-[#f9f9f9] focus:ring-1 focus:ring-primary outline-none", children: [
              /* @__PURE__ */ jsx("option", { children: "Efectivo" }),
              /* @__PURE__ */ jsx("option", { children: "Pago Móvil" }),
              /* @__PURE__ */ jsx("option", { children: "Zelle" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Referencia" }),
            /* @__PURE__ */ jsx(Input, { className: "h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm", placeholder: "REF-001" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-gray-500", children: "Observación" }),
          /* @__PURE__ */ jsx(Input, { className: "h-9 lg:h-10 bg-[#f9f9f9] border-[#e0e0e0] text-sm", placeholder: "Ej: Mostrador" })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            className: "w-full h-12 lg:h-14 mt-4 lg:mt-6 bg-[#8ba4b3] hover:bg-[#6c8a9c] text-white font-bold gap-2 lg:gap-3 rounded-xl shadow-lg flex items-center justify-center uppercase tracking-wider text-xs lg:text-sm",
            disabled: cart.length === 0,
            children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 lg:h-5 lg:w-5" }),
              " Confirmar Venta • $",
              subtotal.toFixed(2)
            ]
          }
        )
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-screen bg-[#f8f5f0] overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 lg:p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 lg:hidden", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "rounded-full border-[#d1cdbc] text-[#555] h-8 w-8", onClick: () => window.location.href = "/dashboard", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-[#2d3a4b] font-gliker", children: "Venta POS" })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          className: "bg-[#c25121] hover:bg-[#a1431b] text-white font-bold px-4 lg:px-8 rounded-xl text-xs lg:text-sm h-9 lg:h-10 ml-auto",
          onClick: () => window.location.href = "/dashboard",
          children: "SALIR"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 gap-0 lg:gap-6 px-3 lg:px-6 pb-0 lg:pb-6 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: `flex-1 flex flex-col gap-3 lg:gap-6 overflow-hidden ${mobileView === "cart" ? "hidden lg:flex" : "flex"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "rounded-full border-[#d1cdbc] text-[#555]", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-[#2d3a4b] font-gliker", children: "Registrar Venta" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#7e8c9a] font-medium font-inter", children: "Selecciona variantes del catálogo." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 lg:gap-4 p-3 lg:p-4 bg-white/40 rounded-xl border border-[#d1cdbc]", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Buscar producto...",
                className: "pl-10 lg:pl-11 h-10 lg:h-12 bg-white border-[#d1cdbc] text-gray-700 text-sm",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "stock-filter",
                checked: showOutOfStock,
                onCheckedChange: (val) => setShowOutOfStock(!!val)
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "stock-filter", className: "text-xs lg:text-sm font-medium text-gray-500 cursor-pointer whitespace-nowrap", children: "Ver sin stock" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto pb-20 lg:pb-2 pr-0 lg:pr-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-6 auto-rows-max", children: loading ? Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "bg-white h-[240px] lg:h-[400px] rounded-xl border border-[#d1cdbc] animate-pulse" }, i)) : products.map((prod) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-[#d1cdbc] flex flex-col shadow-sm hover:shadow-md transition-shadow", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-32 sm:h-40 lg:h-64 w-full p-2 lg:p-4 bg-white border-b border-[#f0eee4] flex items-center justify-center", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: prod.displayImage,
                className: "max-w-full max-h-full object-contain transition-transform group-hover:scale-105",
                alt: prod.nombre
              }
            ),
            /* @__PURE__ */ jsxs(Badge, { className: "absolute top-2 right-2 lg:top-3 lg:right-3 bg-[#f06e1f] text-white border-none text-[9px] lg:text-[11px] font-bold px-1.5 lg:px-2.5 py-0.5 lg:py-1 shadow-sm", children: [
              prod.displayStock,
              " uds"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-2.5 lg:p-4 flex flex-col flex-1 min-h-[100px] lg:min-h-[140px]", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-[#2d3a4b] text-[11px] lg:text-[13px] line-clamp-2 leading-tight mb-1 lg:mb-2", children: prod.nombre }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 lg:space-y-1 mb-2 lg:mb-4", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[9px] lg:text-[10px] text-[#c25121] font-black uppercase tracking-tight truncate", children: [
                "Marca: ",
                prod.displayBrand
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[9px] lg:text-[10px] text-gray-400 font-mono tracking-tighter", children: [
                "REF-",
                prod.id_producto
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-1.5 lg:pt-2 border-t border-[#f0eee4]", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-base lg:text-xl font-black text-[#2d3a4b] mb-1.5 lg:mb-3", children: [
                "$",
                prod.displayPrice.toFixed(2)
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  className: "w-full bg-[#1e3a5f] hover:bg-[#162c4a] text-white font-bold py-1.5 lg:py-2.5 rounded-lg flex items-center justify-center gap-1 lg:gap-2 shadow-sm active:scale-95 transition-transform text-[11px] lg:text-sm h-8 lg:h-auto",
                  onClick: () => addToCart(prod),
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5 lg:h-4 lg:w-4" }),
                    " Agregar"
                  ]
                }
              )
            ] })
          ] })
        ] }, prod.id_producto)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden lg:flex w-[400px] flex-col gap-4 overflow-hidden", children: /* @__PURE__ */ jsx(SidebarContent, {}) }),
      /* @__PURE__ */ jsxs("div", { className: `flex-1 flex flex-col gap-3 overflow-hidden lg:hidden ${mobileView === "catalog" ? "hidden" : "flex"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "rounded-lg border-[#d1cdbc] text-[#555] h-8 text-xs gap-1", onClick: () => setMobileView("catalog"), children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
            " Catálogo"
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "text-base font-bold text-[#2d3a4b] font-gliker", children: "Carrito & Venta" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col gap-3 overflow-y-auto pb-4", children: /* @__PURE__ */ jsx(SidebarContent, {}) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#d1cdbc] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center h-16", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMobileView("catalog"),
          className: `flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${mobileView === "catalog" ? "text-[#1e3a5f] bg-[#1e3a5f]/5" : "text-gray-400"}`,
          children: [
            /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: "Catálogo" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMobileView("cart"),
          className: `flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors relative ${mobileView === "cart" ? "text-[#1e3a5f] bg-[#1e3a5f]/5" : "text-gray-400"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }),
              totalItems > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-2 -right-3 bg-[#f06e1f] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-200", children: totalItems })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: "Carrito" })
          ]
        }
      ),
      subtotal > 0 && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMobileView("cart"),
          className: "flex-1 flex flex-col items-center justify-center h-full gap-0.5 bg-[#1e3a5f] text-white",
          children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold", children: [
              "$",
              subtotal.toFixed(2)
            ] })
          ]
        }
      )
    ] }) })
  ] });
};

const SalesManagement = () => {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight text-foreground drop-shadow-sm", children: "Ventas y Facturación" }),
      /* @__PURE__ */ jsx("p", { className: "text-foreground/70 font-medium", children: "Gestiona tus ventas locales y el punto de venta en tiempo real." })
    ] }) }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "pos", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-card/60 backdrop-blur-md border border-foreground/10 p-1 shadow-sm mb-6", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "pos", className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }),
          " Terminal de Ventas (POS)"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "history", className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsx(History, { className: "h-4 w-4" }),
          " Historial de Ventas"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "pos", children: /* @__PURE__ */ jsx(POSSystem, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsx("div", { className: "h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl bg-card/20", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
        /* @__PURE__ */ jsx(History, { className: "h-12 w-12 text-muted-foreground/30 mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-medium", children: "El historial de ventas se cargará automáticamente al finalizar transacciones." })
      ] }) }) })
    ] })
  ] });
};

const $$Sales = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Ventas - Panel Administrativo" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 p-6 md:p-8"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager", "vendedor"], "panelName": "Ventas", "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "SalesManagement", SalesManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Sales/SalesManagement", "client:component-export": "SalesManagement" })} ` })} </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/sales.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/sales.astro";
const $$url = "/dashboard/sales";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Sales,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
