/* empty css                                     */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { u as useSettings, $ as $$Layout } from '../chunks/utils_DgFjlps2.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import React__default, { useState, useEffect, useMemo, useRef } from 'react';
import { I as Input } from '../chunks/input_CS_ajWDZ.mjs';
import '../chunks/card_tvzaMCZO.mjs';
import { B as Button } from '../chunks/button_DdS5ZpT0.mjs';
import { ShoppingCart, Minus, Plus, Search, Store, ShoppingBag, X, Trash2, Hash, Loader2, User, Mail, Phone, ArrowRight, LogIn, MapPin } from 'lucide-react';
import { D as Dialog, a as DialogContent } from '../chunks/dialog_DoyHhWGx.mjs';
import { B as Badge } from '../chunks/badge_Iq-H4wPg.mjs';
import { F as FetchData, A as API_ENDPOINTS } from '../chunks/api_BIGgZbYc.mjs';
import { map } from 'nanostores';
import { useStore } from '@nanostores/react';
export { renderers } from '../renderers.mjs';

const ProductCard = ({ product, onSelect, settings }) => {
  const handleAction = () => {
    onSelect(product);
  };
  const currency = settings?.catalogo?.simbolo_moneda || "$";
  const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
  const formattedPrice = showDecimals ? product.price.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(product.price).toLocaleString();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-slate-100 dark:border-white/5 cursor-pointer",
      onClick: handleAction,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/5] overflow-hidden bg-[#F8F8F8] dark:bg-slate-800/50 flex items-center justify-center p-4", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: product.image,
              alt: product.name,
              className: "w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsx("div", { className: "bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md text-primary", children: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 flex flex-col flex-grow text-center", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-1", children: product.brand || "" }),
          /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1", children: product.name }),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-2 space-y-3", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-2xl font-extrabold text-primary mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold align-top mr-1", children: currency }),
              formattedPrice
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "default",
                  className: "w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 uppercase tracking-widest text-xs",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleAction();
                  },
                  children: "Ver Detalles"
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  className: "w-full rounded-2xl border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold h-12 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2",
                  onClick: (e) => {
                    e.stopPropagation();
                    const phone = settings?.whatsapp?.numero || "584129326373";
                    const msg = `¡Hola! Me interesa el producto: ${product.name}. ¿Me podrían dar más información? 🍌`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                  },
                  children: [
                    /* @__PURE__ */ jsx("svg", { viewBox: "0 0 448 512", className: "w-4 h-4", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.6-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" }) }),
                    "Comprar"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
};

const cartItems = map({});
function addCartItem(item, amount = 1) {
  if (item.maxStock !== void 0 && item.maxStock <= 0) {
    alert("No hay stock disponible para este producto.");
    return;
  }
  const key = item.variantId !== void 0 ? `${item.id}-${item.variantId}` : item.id;
  const existingItem = cartItems.get()[key];
  if (existingItem) {
    if (existingItem.quantity + amount > item.maxStock) {
      alert(`Solo quedan ${item.maxStock} unidades en stock.`);
      return;
    }
    cartItems.setKey(key, {
      ...existingItem,
      quantity: existingItem.quantity + amount
    });
  } else {
    if (amount > item.maxStock) {
      alert(`Solo quedan ${item.maxStock} unidades en stock.`);
      return;
    }
    cartItems.setKey(key, {
      ...item,
      quantity: amount
    });
  }
}
function removeCartItem(key) {
  const existingItem = cartItems.get()[key];
  if (existingItem) {
    if (existingItem.quantity > 1) {
      const current = cartItems.get();
      const { [key]: _, ...rest } = current;
      cartItems.set(rest);
    } else {
      const current = cartItems.get();
      const { [key]: _, ...rest } = current;
      cartItems.set(rest);
    }
  }
}
function updateItemQuantity(key, delta) {
  const existingItem = cartItems.get()[key];
  if (!existingItem) return;
  const newQty = existingItem.quantity + delta;
  if (newQty <= 0) {
    const current = cartItems.get();
    const { [key]: _, ...rest } = current;
    cartItems.set(rest);
    return;
  }
  if (existingItem.maxStock && newQty > existingItem.maxStock) {
    alert(`Solo quedan ${existingItem.maxStock} unidades en stock.`);
    return;
  }
  cartItems.setKey(key, { ...existingItem, quantity: newQty });
}
function clearCart() {
  cartItems.set({});
}

const cartStore = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  addCartItem,
  cartItems,
  clearCart,
  removeCartItem,
  updateItemQuantity
}, Symbol.toStringTag, { value: 'Module' }));

const ProductDetailDialog = ({ productId, isOpen, onClose, settings }) => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [simpleQuantity, setSimpleQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  useEffect(() => {
    if (isOpen && productId) {
      fetchDetails();
    } else {
      setProduct(null);
      setVariants([]);
      setImages([]);
      setQuantities({});
      setSimpleQuantity(1);
    }
  }, [isOpen, productId]);
  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await FetchData(`${API_ENDPOINTS.CATALOG.PRODUCTS}/${productId}`);
      setProduct(data);
      setVariants(data.variantes || []);
      setImages(data.imagenes || []);
      if (data.imagenes?.length > 0) setMainImage(data.imagenes[0]);
      if (data.variantes?.length > 0) {
        const initialQty = {};
        data.variantes.forEach((_, idx) => initialQty[idx] = 0);
        setQuantities(initialQty);
      }
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateQuantity = (index, delta, maxStock) => {
    setQuantities((prev) => {
      const current = prev[index] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > maxStock) return prev;
      return { ...prev, [index]: next };
    });
  };
  const handleSimpleQuantityChange = (delta) => {
    if (!product) return;
    setSimpleQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      return next;
    });
  };
  const calculateTotal = () => {
    if (!product) return 0;
    if (variants.length === 0) {
      return product.precio * simpleQuantity;
    }
    return variants.reduce((acc, v, idx) => {
      const qty = quantities[idx] || 0;
      return acc + v.precio_lista * qty;
    }, 0);
  };
  const getTotalItems = () => {
    if (variants.length === 0) return simpleQuantity;
    return Object.values(quantities).reduce((a, b) => a + b, 0);
  };
  const handleAddToCart = () => {
    if (!product) return;
    if (variants.length > 0) {
      let added = false;
      variants.forEach((variant, idx) => {
        const qty = quantities[idx];
        if (qty > 0) {
          const price = variant.precio_lista;
          const stock = variant.stock;
          const variantAttrs = variant.atributos_json ? Object.entries(variant.atributos_json).map(([k, v]) => `${v}`).join(", ") : "";
          const cartItemName = variantAttrs ? `${product.nombre} (${variantAttrs})` : product.nombre;
          addCartItem({
            id: String(product.id_producto),
            variantId: variant.id_variante_producto || variant.id,
            name: cartItemName,
            image: mainImage || product.image || "https://placehold.co/400",
            price: Number(price),
            maxStock: Number(stock),
            sku: variant.sku,
            attributes: variant.atributos_json
          }, qty);
          added = true;
        }
      });
      if (!added) {
        alert("Por favor selecciona al menos una cantidad a agregar.");
        return;
      }
    } else {
      const firstVariant = variants[0];
      const vId = firstVariant?.id_variante_producto || firstVariant?.id;
      if (!vId) {
        console.error("ProductDetailDialog: ERROR - No se encontró ID de variante para producto simple", product);
      }
      addCartItem({
        id: String(product.id_producto),
        variantId: vId,
        name: product.nombre,
        image: mainImage || product.image || "https://placehold.co/400",
        price: Number(product.precio || firstVariant?.precio_lista),
        maxStock: firstVariant ? Number(firstVariant.stock) : 999,
        sku: firstVariant?.sku || product?.sku_base || ""
      }, simpleQuantity);
    }
    onClose();
  };
  const getStockLabel = (v) => {
    if (!v.activo) return /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "No disp." });
    if (v.stock <= 0) return /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Agotado" });
    const mode = settings?.catalogo?.modo_etiqueta_stock || "exacto";
    if (mode === "generico") {
      return /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-green-600 border-green-600 font-bold tracking-tight", children: "EN STOCK" });
    }
    return /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-green-600 border-green-600 font-normal", children: [
      v.stock,
      " Disp."
    ] });
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsx(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto w-full", children: loading ? /* @__PURE__ */ jsx("div", { className: "py-20 text-center", children: "Cargando detalles..." }) : !product ? /* @__PURE__ */ jsx("div", { className: "py-20 text-center", children: "No se encontró el producto." }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "aspect-square bg-gray-100 rounded-lg overflow-hidden border", children: /* @__PURE__ */ jsx("img", { src: mainImage, alt: product.nombre, className: "w-full h-full object-contain" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: images.map((img, idx) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMainImage(img),
          className: `w-20 h-20 border rounded-md overflow-hidden flex-shrink-0 ${mainImage === img ? "ring-2 ring-primary" : ""}`,
          children: /* @__PURE__ */ jsx("img", { src: img, alt: "Thumbnail", className: "w-full h-full object-cover" })
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6 flex flex-col h-full", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: product.nombre }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2 text-sm", children: product.descripcion })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto max-h-[400px] pr-2", children: variants.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pb-2 border-b", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm", children: "Elige tus variantes:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Stock total: ",
            variants.reduce((a, v) => a + (v.stock || 0), 0)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: variants.map((variant, index) => {
          const attrs = variant.atributos_json || {};
          const attrString = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(", ") || variant.sku;
          const qty = quantities[index] || 0;
          const outOfStock = variant.stock <= 0;
          const stock = variant.stock || 0;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `
                                                        p-3 border rounded-lg flex justify-between items-center transition-all bg-card
                                                        ${qty > 0 ? "border-primary ring-1 ring-primary bg-primary/5" : "hover:border-gray-300"}
                                                        ${outOfStock ? "opacity-60 bg-gray-50" : ""}
                                                    `,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-0 flex-1 mr-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-sm truncate", children: attrString }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", children: (() => {
                      const currency = settings?.catalogo?.simbolo_moneda || "$";
                      const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
                      const formatted = showDecimals ? variant.precio_lista.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(variant.precio_lista).toLocaleString();
                      return `${currency}${formatted}`;
                    })() }),
                    getStockLabel(variant)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center border rounded-md bg-background shadow-sm h-8", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-full w-8 rounded-r-none hover:bg-gray-100",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleUpdateQuantity(index, -1, stock);
                      },
                      disabled: qty <= 0,
                      children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "w-8 text-center text-sm font-semibold select-none", children: qty }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-full w-8 rounded-l-none hover:bg-gray-100",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleUpdateQuantity(index, 1, stock);
                      },
                      disabled: outOfStock || qty >= stock,
                      children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
                    }
                  )
                ] })
              ]
            },
            variant.id_variante_producto || index
          );
        }) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm mb-4", children: "Producto estándar (sin variantes)." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: "Cantidad:" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center border rounded-md", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 rounded-r-none",
                onClick: () => handleSimpleQuantityChange(-1),
                disabled: simpleQuantity <= 1,
                children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-10 text-center text-sm font-semibold", children: simpleQuantity }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 rounded-l-none",
                onClick: () => handleSimpleQuantityChange(1),
                children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
              }
            )
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t flex flex-col gap-4 mt-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-secondary/20 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Total a pagar:" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              getTotalItems(),
              " productos seleccionados"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-primary", children: (() => {
            const total = calculateTotal();
            const currency = settings?.catalogo?.simbolo_moneda || "$";
            const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
            const formatted = showDecimals ? total.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(total).toLocaleString();
            return `${currency}${formatted}`;
          })() })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "lg",
            className: "w-full text-lg py-6",
            onClick: handleAddToCart,
            disabled: getTotalItems() === 0,
            children: [
              /* @__PURE__ */ jsx(ShoppingCart, { className: "mr-2 h-5 w-5" }),
              "Agregar al Carrito"
            ]
          }
        )
      ] })
    ] })
  ] }) }) });
};

const ProductGrid = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const [products, setProducts] = useState([]);
  const [storeClosed, setStoreClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(void 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState({ id: "all", name: "Todos" });
  const [selectedBrand, setSelectedBrand] = useState({ id: "all", name: "Todas" });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1e4 });
  const [orderBy, setOrderBy] = useState("default");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsData, brandsData] = await Promise.all([
          FetchData(API_ENDPOINTS.CATALOG.CATEGORIES, "GET"),
          FetchData(API_ENDPOINTS.CATALOG.BRANDS, "GET")
        ]);
        const getList = (data) => {
          if (Array.isArray(data)) return data;
          if (data && Array.isArray(data.data)) return data.data;
          return [];
        };
        const catsList = getList(catsData);
        if (catsList.length > 0) {
          setCategories([{ id: "all", name: "Todos" }, ...catsList.map((c) => ({
            id: String(c.id_categoria || c.id),
            name: c.nombre || c.name || "Sin Categoría"
          }))]);
        }
        const brandsList = getList(brandsData);
        if (brandsList.length > 0) {
          setBrands([{ id: "all", name: "Todas" }, ...brandsList.map((b) => ({
            id: String(b.id_marca || b.id),
            name: b.nombre || b.name || "Sin Marca"
          }))]);
        }
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    };
    fetchMetadata();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("limit", "100");
        if (searchTerm) params.append("q", searchTerm);
        if (orderBy === "price-asc") {
          params.append("sort", "price");
          params.append("dir", "asc");
        } else if (orderBy === "price-desc") {
          params.append("sort", "price");
          params.append("dir", "desc");
        } else if (orderBy === "name-asc") {
          params.append("sort", "name");
          params.append("dir", "asc");
        } else if (orderBy === "name-desc") {
          params.append("sort", "name");
          params.append("dir", "desc");
        }
        const url = `${API_ENDPOINTS.CATALOG.PRODUCTS}?${params.toString()}`;
        const response = await FetchData(url, "GET");
        if (response.message === "Tienda cerrada") {
          setStoreClosed(true);
          setProducts([]);
          return;
        }
        setStoreClosed(false);
        const rawProducts = response.data || [];
        const mappedProducts = rawProducts.map((p) => ({
          id: Number(p.id_producto),
          name: p.nombre,
          price: Number(p.min_price) || Number(p.precio) || 0,
          image: p.imagen_principal || "https://placehold.co/400x1200/261633/FFF5F7?text=Banano+Product",
          description: p.descripcion || "",
          category: p.category_name || p.categoria_nombre || p.marca?.categoria?.nombre || p.categoria || "General",
          brand: p.brand_name || p.marca_nombre || p.marca?.nombre || p.brand?.name || p.marca || "",
          categoryId: String(p.id_categoria),
          brandId: String(p.id_marca)
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, orderBy]);
  const filteredProducts = useMemo(() => {
    return products.map((p) => {
      if (!p.brand || p.brand.toUpperCase() === "GENERIC" || p.brand === "") {
        const foundBrand = brands.find((b) => b.id === p.brandId);
        if (foundBrand && foundBrand.id !== "all") {
          return { ...p, brand: foundBrand.name };
        }
      }
      return p;
    }).filter((product) => {
      const matchCategory = selectedCategory.id === "all" || product.categoryId === selectedCategory.id;
      const matchBrand = selectedBrand.id === "all" || product.brandId === selectedBrand.id;
      const matchPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchCategory && matchBrand && matchPrice;
    });
  }, [products, selectedCategory, selectedBrand, priceRange, brands]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 max-w-6xl mx-auto bg-card/50 p-6 rounded-xl border border-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full md:flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              placeholder: "Buscar bananos, smoothies...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-accent w-full"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground whitespace-nowrap", children: "Precio:" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              placeholder: "Min",
              value: priceRange.min,
              onChange: (e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) })),
              className: "w-20 bg-background border-input text-foreground"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "-" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              placeholder: "Max",
              value: priceRange.max,
              onChange: (e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) })),
              className: "w-20 bg-background border-input text-foreground"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full md:w-auto", children: /* @__PURE__ */ jsxs(
          "select",
          {
            value: orderBy,
            onChange: (e) => setOrderBy(e.target.value),
            className: "w-full md:w-48 bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent",
            children: [
              /* @__PURE__ */ jsx("option", { value: "default", children: "Ordenar por..." }),
              /* @__PURE__ */ jsx("option", { value: "price-asc", children: "Precio: Menor a Mayor" }),
              /* @__PURE__ */ jsx("option", { value: "price-desc", children: "Precio: Mayor a Menor" }),
              /* @__PURE__ */ jsx("option", { value: "name-asc", children: "Nombre: A-Z" }),
              /* @__PURE__ */ jsx("option", { value: "name-desc", children: "Nombre: Z-A" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1", children: "Categoría" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: selectedCategory.id,
              onChange: (e) => {
                const cat = categories.find((c) => c.id === e.target.value);
                if (cat) setSelectedCategory(cat);
              },
              className: "w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer",
              style: { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" },
              children: categories.map((category) => /* @__PURE__ */ jsx("option", { value: category.id, children: category.name }, category.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1", children: "Marca" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: selectedBrand.id,
              onChange: (e) => {
                const brand = brands.find((b) => b.id === e.target.value);
                if (brand) setSelectedBrand(brand);
              },
              className: "w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer",
              style: { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" },
              children: brands.map((brand) => /* @__PURE__ */ jsx("option", { value: brand.id, children: brand.name }, brand.id))
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8", children: loading || settingsLoading ? /* @__PURE__ */ jsx("div", { className: "col-span-full text-center py-20 text-muted-foreground animate-pulse font-medium", children: "Buscando productos..." }) : storeClosed ? /* @__PURE__ */ jsxs("div", { className: "col-span-full py-20 bg-card/40 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Store, { className: "h-10 w-10 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-3xl font-black uppercase tracking-tight", children: "Catálogo Cerrado" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-medium", children: "Estamos actualizando nuestro inventario. ¡Regresa pronto!" })
      ] })
    ] }) : filteredProducts.length > 0 ? filteredProducts.map((product) => /* @__PURE__ */ jsx(
      ProductCard,
      {
        product,
        settings,
        onSelect: (p) => {
          setSelectedProductId(Number(p.id));
          setDetailOpen(true);
        }
      },
      product.id
    )) : /* @__PURE__ */ jsx("div", { className: "col-span-full text-center py-12 text-muted-foreground", children: /* @__PURE__ */ jsx("p", { className: "text-xl", children: "No encontramos productos." }) }) }),
    /* @__PURE__ */ jsx(
      ProductDetailDialog,
      {
        isOpen: detailOpen,
        onClose: () => setDetailOpen(false),
        productId: selectedProductId,
        settings
      }
    )
  ] });
};

const CartWidget = () => {
  const $cartItems = useStore(cartItems);
  const totalItems = Object.values($cartItems).reduce((acc, item) => acc + item.quantity, 0);
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-cart"));
  };
  if (totalItems === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6 z-50 animate-bounce", children: /* @__PURE__ */ jsxs(
    Button,
    {
      onClick: handleClick,
      className: "rounded-full w-16 h-16 bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 relative",
      children: [
        /* @__PURE__ */ jsx(ShoppingCart, { className: "h-8 w-8" }),
        /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background", children: totalItems })
      ]
    }
  ) });
};

const CartDrawer = () => {
  const { settings } = useSettings();
  const $cartItems = useStore(cartItems);
  const items = Object.values($cartItems);
  const dialogRef = useRef(null);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [customerCedula, setCustomerCedula] = React__default.useState("V-");
  const [customerName, setCustomerName] = React__default.useState("");
  const [customerEmail, setCustomerEmail] = React__default.useState("");
  const [customerPhone, setCustomerPhone] = React__default.useState("");
  const [isSubmitting, setIsSubmitting] = React__default.useState(false);
  const [isSearchingClient, setIsSearchingClient] = React__default.useState(false);
  const [errorMessage, setErrorMessage] = React__default.useState(null);
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.cedula) setCustomerCedula(user.cedula);
        if (user.nombre) setCustomerName(user.nombre);
        if (user.email) setCustomerEmail(user.email);
        if (user.telefono) setCustomerPhone(user.telefono);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
    const openListener = () => dialogRef.current?.showModal();
    window.addEventListener("open-cart", openListener);
    return () => window.removeEventListener("open-cart", openListener);
  }, []);
  useEffect(() => {
    if (customerCedula.length < 9) return;
    const timeout = setTimeout(async () => {
      setIsSearchingClient(true);
      try {
        const res = await fetch(`/api/guest/cliente/${customerCedula}`);
        if (res.ok) {
          const result = await res.json();
          if (result.status === "success" && result.data) {
            const { nombre, email, telefono } = result.data;
            if (nombre) setCustomerName(nombre);
            if (email) setCustomerEmail(email);
            if (telefono) setCustomerPhone(formatPhoneNumber(telefono));
          }
        }
      } catch (error) {
        console.error("Error searching client:", error);
      } finally {
        setIsSearchingClient(false);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [customerCedula]);
  const handleCedulaChange = (val) => {
    let clean = val.toUpperCase();
    if (!clean.startsWith("V-")) {
      clean = "V-" + clean.replace(/^V-?/, "");
    }
    const prefix = clean.substring(0, 2);
    const rest = clean.substring(2).replace(/[^0-9]/g, "");
    const newValue = prefix + rest;
    if (newValue !== customerCedula) {
      setCustomerCedula(newValue);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setErrorMessage(null);
    }
  };
  const formatPhoneNumber = (val) => {
    const digits = val.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
      if (digits.length > 4) {
        formatted += " " + digits.substring(4, 7);
      }
      if (digits.length > 7) {
        formatted += " " + digits.substring(7, 11);
      }
    }
    return formatted.trim();
  };
  const handlePhoneChange = (val) => {
    setCustomerPhone(formatPhoneNumber(val));
  };
  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const orderData = {
      cliente_cedula: customerCedula.trim(),
      cliente_nombre: customerName.trim(),
      cliente_email: customerEmail.trim(),
      cliente_telefono: customerPhone.replace(/\s/g, "").trim(),
      items: items.map((item) => {
        if (item.variantId === void 0) {
          console.error("CartDrawer: ERROR - Item sin variantId detectado:", item);
        }
        return {
          id_variante: item.variantId,
          cantidad: item.quantity
        };
      }),
      nota: ""
    };
    let backendWaUrl = null;
    try {
      const jsonPayload = JSON.stringify(orderData);
      console.log("CartDrawer: Enviando JSON al proxy:", jsonPayload);
      const res = await fetch("/api/guest/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonPayload
      });
      if (res.ok) {
        const data = await res.json();
        backendWaUrl = data.waUrl;
        console.log("Order registered successfully in backend");
        localStorage.setItem("user", JSON.stringify({
          cedula: customerCedula.trim(),
          nombre: customerName.trim(),
          email: customerEmail.trim(),
          telefono: customerPhone.trim()
        }));
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setErrorMessage(errorData.message || "La cédula, email o teléfono ya están asociados a otro cliente.");
        } else {
          setErrorMessage(errorData.message || "Error al procesar el pedido. Por favor intenta de nuevo.");
        }
        console.error("Failed to register order in backend:", res.status, errorData);
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Network error trying to register order:", error);
      setErrorMessage("Error de conexión con el servidor.");
      setIsSubmitting(false);
      return;
    }
    try {
      const mod = await Promise.resolve().then(() => cartStore);
      mod.clearCart();
    } catch (e) {
      console.error("Error clearing cart", e);
    }
    if (backendWaUrl) {
      window.open(backendWaUrl, "_blank");
    } else {
      const phoneNumber = settings?.whatsapp?.numero || "573001234567";
      const name = customerName.trim() || "Cliente";
      const currency = settings?.catalogo?.simbolo_moneda || "$";
      const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
      const formatPrice = (p) => showDecimals ? p.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(p).toLocaleString();
      const itemsList = items.map((item) => `   - ${item.name} (x${item.quantity}): ${currency}${formatPrice(item.price * item.quantity)}`).join("\n");
      const message = settings?.whatsapp?.mensaje_bienvenida ? `${settings.whatsapp.mensaje_bienvenida}

${itemsList}

*Total: ${currency}${formatPrice(total)}*` : `*Hola!* 

Mi nombre es *${name}* e hice un pedido:

${itemsList}

*Total: ${currency}${formatPrice(total)}*

¿Cómo procedo con el pago?`;
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
    setIsSubmitting(false);
    dialogRef.current?.close();
  };
  const closeCart = () => dialogRef.current?.close();
  return /* @__PURE__ */ jsx(
    "dialog",
    {
      id: "cart-dialog",
      ref: dialogRef,
      className: "backdrop:bg-black/50 bg-transparent p-0 w-full md:max-w-md h-full max-h-screen m-0 ml-auto shadow-2xl open:animate-in open:slide-in-from-right-full backdrop:animate-in backdrop:fade-in",
      children: /* @__PURE__ */ jsxs("div", { className: "bg-card border-l border-border text-card-foreground h-full flex flex-col w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center bg-primary/5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ShoppingBag, { className: "w-5 h-5 text-primary" }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-primary", children: "Tu Canasta" })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: closeCart, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-6 w-6" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(ShoppingBag, { className: "w-12 h-12 mx-auto mb-4 opacity-20" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-medium", children: "Tu carrito está vacío." }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: "¡Explora el catálogo y agrega bananos!" })
        ] }) : items.map((item) => {
          const key = item.variantId ? `${item.id}-${item.variantId}` : item.id;
          const attrString = item.attributes ? Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ") : "";
          return /* @__PURE__ */ jsxs("div", { className: "flex gap-4 bg-secondary/20 p-3 rounded-lg border border-transparent hover:border-border transition-colors group", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("img", { src: item.image, alt: item.name, className: "w-20 h-20 object-cover rounded-md shadow-sm" }),
              /* @__PURE__ */ jsxs("span", { className: "absolute -top-2 -left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm", children: [
                "x",
                item.quantity
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm truncate pr-2", children: item.name }),
                attrString && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground truncate", children: attrString }),
                item.sku && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground/80 mt-0.5", children: [
                  "SKU: ",
                  item.sku
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-primary text-sm font-bold", children: (() => {
                  const itemTotal = item.price * item.quantity;
                  const currency = settings?.catalogo?.simbolo_moneda || "$";
                  const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
                  const formatted = showDecimals ? itemTotal.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(itemTotal).toLocaleString();
                  return `${currency}${formatted}`;
                })() }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-input rounded-md bg-background shadow-sm h-7 overflow-hidden", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-full w-7 rounded-none hover:bg-muted p-0",
                      onClick: () => Promise.resolve().then(() => cartStore).then((mod) => mod.updateItemQuantity(String(key), -1)),
                      children: item.quantity === 1 ? /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3 text-destructive" }) : /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "w-8 text-center text-xs font-semibold select-none", children: item.quantity }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-full w-7 rounded-none hover:bg-muted p-0",
                      onClick: () => Promise.resolve().then(() => cartStore).then((mod) => mod.updateItemQuantity(String(key), 1)),
                      disabled: item.maxStock !== void 0 && item.quantity >= item.maxStock,
                      children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
                    }
                  )
                ] })
              ] })
            ] })
          ] }, key);
        }) }),
        items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-border bg-card space-y-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(Hash, { className: `absolute left-3 top-2.5 h-4 w-4 transition-colors ${isSearchingClient ? "text-primary animate-pulse" : "text-muted-foreground group-focus-within:text-primary"}` }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: customerCedula,
                  onChange: (e) => handleCedulaChange(e.target.value),
                  placeholder: "V-12345678",
                  className: "w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                }
              ),
              isSearchingClient && /* @__PURE__ */ jsx(Loader2, { className: "absolute right-3 top-2.5 h-4 w-4 text-primary animate-spin" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: customerName,
                  onChange: (e) => setCustomerName(e.target.value),
                  placeholder: "Tu Nombre Completo",
                  className: "w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  value: customerEmail,
                  onChange: (e) => setCustomerEmail(e.target.value),
                  placeholder: "Tu Email",
                  className: "w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(Phone, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "tel",
                  value: customerPhone,
                  onChange: (e) => handlePhoneChange(e.target.value),
                  placeholder: "Tu Teléfono",
                  className: "w-full bg-background border border-input rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                }
              )
            ] }),
            errorMessage && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20 animate-in fade-in slide-in-from-top-1", children: errorMessage })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-medium", children: "Subtotal" }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-primary", children: (() => {
              const currency = settings?.catalogo?.simbolo_moneda || "$";
              const showDecimals = settings?.catalogo?.mostrar_decimales !== false;
              const formatted = showDecimals ? total.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(total).toLocaleString();
              return `${currency}${formatted}`;
            })() })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleCheckout,
              disabled: isSubmitting || !customerName.trim() || customerCedula.length < 5 || !customerEmail.trim() || !customerPhone.trim(),
              className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all",
              children: [
                isSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsx("img", { src: "/icons/whatsapp-white.svg", className: "w-5 h-5 mr-2", alt: "", onError: (e) => e.currentTarget.style.display = "none" }),
                "Pedir por WhatsApp ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-5 w-5" })
              ]
            }
          ),
          (!customerName.trim() || customerCedula.length < 5 || !customerEmail.trim() || !customerPhone.trim()) && /* @__PURE__ */ jsx("p", { className: "text-[14px] text-center text-red-700 font-bold mt-2", children: "Por favor completa todos los campos para continuar." })
        ] })
      ] })
    }
  );
};

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const externalApiBase = "http://localhost:3000/api";
  let settings = {};
  try {
    const response = await fetch(`${externalApiBase}/public/settings`);
    if (response.ok) {
      settings = await response.json();
    }
  } catch (e) {
    console.error("Error fetching settings for index.astro:", e);
  }
  const tienda = settings.tienda || {};
  const title = tienda.nombre || "Banano Shop";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title }, { "default": async ($$result2) => renderTemplate`  ${renderComponent($$result2, "CartWidget", CartWidget, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/Shop/CartWidget", "client:component-export": "CartWidget" })} ${renderComponent($$result2, "CartDrawer", CartDrawer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/Shop/CartDrawer", "client:component-export": "CartDrawer" })} ${maybeRenderHead()}<main class="flex flex-col min-h-screen bg-background text-foreground bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> <!-- Fuchsia Top Wrapper --> <div class="bg-[#df0067] text-white relative pb-32"> <!-- Header Section --> <header class="container px-4 py-8 flex justify-between items-center border-b border-white/20"> <div class="flex items-center space-x-2"> <img src="/logo_original.png" class="h-10 w-auto brightness-0 invert" alt="Logo"> <h1 class="text-3xl font-normal text-white font-gliker tracking-tight">${title}</h1> </div> <div class="flex items-center space-x-4"> <a href="/login" class="px-6 py-2 border-2 border-white/30 text-white hover:bg-white hover:text-[#df0067] transition-all rounded-full font-bold text-sm tracking-wide"> ${renderComponent($$result2, "LogIn", LogIn, { "className": "mr-2 h-4 w-4 inline-block" })} Iniciar Sesión
</a> </div> </header> <div class="flex-1"> <!-- Hero Banner --> <section class="py-20 md:py-36 text-center container px-4 relative z-10"> <h2 class="text-7xl md:text-9xl font-normal mb-8 tracking-tighter text-white font-gliker drop-shadow-2xl"> ${tienda.hero_titulo || "Banano Shop"} </h2> <p class="text-white/90 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-medium"> ${tienda.hero_descripcion || "La mejor selección de productos íntimos."} </p> </section> </div> <!-- Background Gradient Fusion (Smoother) --> <div class="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-background via-background/80 to-transparent translate-y-[20%] pointer-events-none"></div> </div> <!-- Product Grid Section --> <section class="container px-4 pb-20 relative z-20 mt-[-80px]"> ${renderComponent($$result2, "ProductGrid", ProductGrid, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/Shop/ProductGrid", "client:component-export": "ProductGrid" })} </section> <!-- Footer Section --> <footer class="border-t border-border bg-card/50 backdrop-blur-sm py-12"> <div class="container px-4"> <div class="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left"> <div class="space-y-4 max-w-sm"> <div class="flex items-center justify-center md:justify-start gap-2"> <img src="/logo_original.png" class="h-8 w-auto" alt="Logo"> <h3 class="text-2xl font-normal text-primary font-gliker">${title}</h3> </div> </div> ${tienda.mostrar_info && renderTemplate`<div class="flex flex-col md:flex-row gap-8 items-center md:items-start"> ${tienda.direccion && renderTemplate`<div class="flex flex-col items-center md:items-start gap-1 max-w-xs"> <div class="flex items-center gap-2 text-primary font-bold uppercase tracking-tight text-[10px]"> ${renderComponent($$result2, "MapPin", MapPin, { "className": "h-3 w-3" })}
Dirección
</div> <p class="text-xs text-foreground bg-primary/5 p-2 rounded-lg border border-primary/10 shadow-sm text-center md:text-left"> ${tienda.direccion} </p> </div>`} ${(tienda.telefono || tienda.email_contacto) && renderTemplate`<div class="space-y-3 flex flex-col items-center md:items-start"> <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contacto</p> <div class="space-y-1 text-center md:text-left"> ${tienda.telefono && renderTemplate`<p class="text-sm font-bold text-primary">${tienda.telefono}</p>`} ${tienda.email_contacto && renderTemplate`<p class="text-xs font-medium text-muted-foreground">${tienda.email_contacto}</p>`} </div> </div>`} </div>`} </div> <div class="mt-12 pt-8 border-t border-border text-center"> <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${title}. PROYECTO DE GRADO - Todos los derechos reservados.
</p> </div> </div> </footer> </main> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/index.astro", void 0);
const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
