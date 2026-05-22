/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { c as cn, $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { $ as $$Footer } from '../../chunks/Footer_Jq4O6KSJ.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { useState, useEffect } from 'react';
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from '../../chunks/tabs_CdwhZf1u.mjs';
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, A as AlertDialog, f as AlertDialogContent, g as AlertDialogHeader, h as AlertDialogTitle, i as AlertDialogDescription, j as AlertDialogFooter, k as AlertDialogCancel, l as AlertDialogAction } from '../../chunks/alert-dialog_BRiavCKX.mjs';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, c as CardDescription } from '../../chunks/card_tvzaMCZO.mjs';
import { B as Button } from '../../chunks/button_DdS5ZpT0.mjs';
import { I as Input } from '../../chunks/input_CS_ajWDZ.mjs';
import { B as Badge } from '../../chunks/badge_Iq-H4wPg.mjs';
import { Plus, Edit, Copy, Trash, Loader2, ArrowRightLeft, RefreshCw, Upload, Star, Search, CheckCircle2, AlertCircle, Ban, CheckCircle, Trash2, Tags, Power, Box, FileText, FileDown, Download, AlertTriangle, History, Save, ArrowLeft, SkipForward, FileSpreadsheet, ArrowRight, X, ChevronRight, UploadCloud } from 'lucide-react';
import { F as FetchData, A as API_ENDPOINTS } from '../../chunks/api_BIGgZbYc.mjs';
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from '../../chunks/dialog_DoyHhWGx.mjs';
import { L as Label } from '../../chunks/label_DGuNO1IL.mjs';
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from '../../chunks/select_Bk1ZEmt9.mjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

const CreateProductDialog = ({
  onProductCreated
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3e3);
      return () => clearTimeout(timer);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5e3);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  useEffect(() => {
    if (open) {
      fetchDependencies();
    }
  }, [open]);
  const fetchDependencies = async () => {
    setLoading(true);
    try {
      const cats = await FetchData(API_ENDPOINTS.CATEGORIES.LIST);
      const brs = await FetchData(API_ENDPOINTS.BRANDS.LIST);
      setCategories(Array.isArray(cats) ? cats : cats.data || []);
      setBrands(Array.isArray(brs) ? brs : brs.data || []);
    } catch (err) {
      console.error("Error fetching dependencies", err);
    } finally {
      setLoading(false);
    }
  };
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const handleSaveNewCategory = async () => {
    if (!newCategoryName || newCategoryName.trim() === "") return;
    setLoading(true);
    try {
      const res = await FetchData(API_ENDPOINTS.CATEGORIES.LIST, "POST", {
        body: { nombre: newCategoryName.trim() }
      });
      const catId = res.id_categoria || res.category?.id_categoria;
      if (res && catId) {
        await fetchDependencies();
        setCategoryId(catId.toString());
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (err) {
      setError(err.message || "Error al crear categoría");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveNewBrand = async () => {
    if (!newBrandName || newBrandName.trim() === "") return;
    setLoading(true);
    try {
      const res = await FetchData(API_ENDPOINTS.BRANDS.LIST, "POST", {
        body: { nombre: newBrandName.trim() }
      });
      const brId = res.id_marca || res.brand?.id_marca;
      if (res && brId) {
        await fetchDependencies();
        setBrandId(brId.toString());
        setIsAddingBrand(false);
        setNewBrandName("");
      }
    } catch (err) {
      setError(err.message || "Error al crear marca");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!nombre || !categoryId || !brandId) {
      setError("Nombre, Categoría y Marca son obligatorios.");
      setLoading(false);
      return;
    }
    try {
      await FetchData(API_ENDPOINTS.PRODUCTS.CREATE, "POST", {
        body: {
          nombre,
          descripcion,
          id_categoria: parseInt(categoryId),
          id_marca: parseInt(brandId),
          activo: true
        }
      });
      setSuccess("Producto creado correctamente");
      setTimeout(() => {
        onProductCreated();
        setOpen(false);
        setNombre("");
        setDescripcion("");
        setCategoryId("");
        setBrandId("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { type: "button", children: [
      /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
      " Nuevo Producto"
    ] }) }),
    /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-[550px]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Crear Producto" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Agrega un nuevo producto al catálogo." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "nombre", children: "Nombre *" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "nombre",
              value: nombre,
              onChange: (e) => setNombre(e.target.value),
              placeholder: "Ej. Banano Cavendish"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx(Label, { children: "Categoría *" }) }),
            !isAddingCategory ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(Select, { value: categoryId, onValueChange: setCategoryId, disabled: loading, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: loading ? "Cargando..." : "Seleccionar" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: categories.filter((c) => c.id_categoria != null).map((c) => /* @__PURE__ */ jsx(
                  SelectItem,
                  {
                    value: c.id_categoria.toString(),
                    children: c.nombre || "Sin nombre"
                  },
                  c.id_categoria
                )) })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "link",
                  size: "sm",
                  className: "px-0 h-auto text-xs",
                  onClick: () => setIsAddingCategory(true),
                  children: "+ Agregar categoría"
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2 border p-2 rounded-md bg-muted/30", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Nueva categoría...",
                  className: "h-8 text-xs",
                  value: newCategoryName,
                  onChange: (e) => setNewCategoryName(e.target.value),
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "h-7 text-[10px] flex-1", onClick: handleSaveNewCategory, disabled: loading, children: "Aceptar" }),
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[10px] flex-1", onClick: () => setIsAddingCategory(false), children: "Cancelar" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx(Label, { children: "Marca *" }) }),
            !isAddingBrand ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(Select, { value: brandId, onValueChange: setBrandId, disabled: loading, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: loading ? "Cargando..." : "Seleccionar" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: brands.filter((b) => b.id_marca != null).map((b) => /* @__PURE__ */ jsx(
                  SelectItem,
                  {
                    value: b.id_marca.toString(),
                    children: b.nombre || "Sin nombre"
                  },
                  b.id_marca
                )) })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "link",
                  size: "sm",
                  className: "px-0 h-auto text-xs",
                  onClick: () => setIsAddingBrand(true),
                  children: "+ Agregar marca"
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2 border p-2 rounded-md bg-muted/30", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Nueva marca...",
                  className: "h-8 text-xs",
                  value: newBrandName,
                  onChange: (e) => setNewBrandName(e.target.value),
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "h-7 text-[10px] flex-1", onClick: handleSaveNewBrand, disabled: loading, children: "Aceptar" }),
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[10px] flex-1", onClick: () => setIsAddingBrand(false), children: "Cancelar" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "descripcion", children: "Descripción" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "descripcion",
              value: descripcion,
              onChange: (e) => setDescripcion(e.target.value),
              placeholder: "Detalles del producto..."
            }
          )
        ] }),
        success && /* @__PURE__ */ jsx("div", { className: "p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300", children: success }),
        error && /* @__PURE__ */ jsx("div", { className: "p-3 bg-red-50 border border-red-200 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300", children: error })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setOpen(false),
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Creando..." : "Crear Producto" })
      ] })
    ] }) })
  ] });
};

const PREDEFINED_ATTRIBUTES = [
  "Talla",
  "Tamaño",
  "Color",
  "Material",
  "Peso",
  "Dimensiones",
  "Sabor",
  "Estilo",
  "Género"
];
const ProductVariantsTab = ({ product }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCloneMode, setIsCloneMode] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    sku: "",
    precio_lista: "",
    costo: "",
    codigo_barras: "",
    atributos: []
  });
  const [saving, setSaving] = useState(false);
  const [registeringStock, setRegisteringStock] = useState(false);
  const [quickStock, setQuickStock] = useState({
    cantidad: "",
    tipo: "entrada",
    motivo: ""
  });
  const handleRegisterQuickStock = async () => {
    if (!editingVariant || !quickStock.cantidad) return;
    const cantNum = parseInt(quickStock.cantidad);
    if (isNaN(cantNum) || cantNum <= 0) {
      alert("La cantidad debe ser un número mayor a cero.");
      return;
    }
    setRegisteringStock(true);
    try {
      await FetchData(API_ENDPOINTS.INVENTORY.MOVEMENTS, "POST", {
        body: {
          id_variante_producto: editingVariant.id_variante_producto,
          tipo: quickStock.tipo,
          cantidad: parseInt(quickStock.cantidad),
          motivo: quickStock.motivo || "Ajuste rápido desde edición"
        }
      });
      setQuickStock({ cantidad: "", tipo: "entrada", motivo: "" });
      await fetchVariants();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error registering quick stock", error);
    } finally {
      setRegisteringStock(false);
    }
  };
  const fetchVariants = async () => {
    if (!product?.id_producto) return;
    setLoading(true);
    try {
      const response = await FetchData(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto));
      const data = response.data || [];
      setVariants(data);
    } catch (error) {
      console.error("Error fetching variants", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVariants();
  }, [product]);
  const handleOpenDialog = (variant, isClone = false) => {
    setIsCloneMode(isClone);
    if (variant) {
      setEditingVariant(isClone ? null : variant);
      setFormData({
        sku: isClone ? "[ GENERACIÓN AUTOMÁTICA ]" : variant.sku || "",
        precio_lista: (variant.precio_lista ?? "").toString(),
        costo: (variant.costo ?? "").toString(),
        codigo_barras: variant.codigo_barras || "",
        atributos: variant.atributos_json && typeof variant.atributos_json === "object" ? Object.entries(variant.atributos_json).map(([key, value]) => ({ key, value: String(value) })) : []
      });
    } else {
      setEditingVariant(null);
      setFormData({ sku: "[ GENERACIÓN AUTOMÁTICA ]", precio_lista: "", costo: "", codigo_barras: "", atributos: [] });
    }
    setIsDialogOpen(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        sku: formData.sku === "[ GENERACIÓN AUTOMÁTICA ]" ? void 0 : formData.sku,
        precio_lista: parseFloat(formData.precio_lista) || 0,
        costo: parseFloat(formData.costo) || 0,
        codigo_barras: formData.codigo_barras,
        atributos_json: formData.atributos.reduce((acc, curr) => {
          if (curr.key) acc[curr.key] = curr.value;
          return acc;
        }, {})
      };
      if (editingVariant) {
        await FetchData(API_ENDPOINTS.VARIANTS.ITEM(editingVariant.id_variante_producto), "PATCH", { body: payload });
      } else {
        await FetchData(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto), "POST", { body: payload });
      }
      setIsDialogOpen(false);
      fetchVariants();
    } catch (error) {
      alert(error.message || "Error al guardar variante");
      console.error("Error saving variant", error);
    } finally {
      setSaving(false);
    }
  };
  const handleToggleStatus = async (variant) => {
    if (!confirm(`¿Seguro que deseas ${variant.activo ? "desactivar" : "activar"} esta variante?`)) return;
    try {
      await FetchData(API_ENDPOINTS.VARIANTS.ITEM(variant.id_variante_producto), "PATCH", {
        body: { activo: !variant.activo }
      });
      fetchVariants();
    } catch (error) {
      console.error("Error toggling variant", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Variantes del Producto" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => handleOpenDialog(), size: "sm", children: [
        /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
        " Agregar Variante"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border rounded-md", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "SKU" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Precio" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Costo" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Stock" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Estado" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: loading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "Cargando..." }) }) : variants.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "No hay variantes registradas." }) }) : variants.map((variant) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: variant.sku }),
        /* @__PURE__ */ jsxs(TableCell, { children: [
          "$",
          variant.precio_lista
        ] }),
        /* @__PURE__ */ jsxs(TableCell, { children: [
          "$",
          variant.costo
        ] }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: `font-bold ${variant.stock_actual <= 5 ? "text-red-500" : ""}`, children: variant.stock_actual ?? 0 }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: variant.activo ? "default" : "destructive", children: variant.activo ? "Activo" : "Inactivo" }) }),
        /* @__PURE__ */ jsxs(TableCell, { className: "text-right space-x-1", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleOpenDialog(variant), title: "Editar", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleOpenDialog(variant, true), title: "Duplicar", className: "text-blue-500 hover:text-blue-600", children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => handleToggleStatus(variant),
              className: variant.activo ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600",
              title: variant.activo ? "Desactivar" : "Activar",
              children: /* @__PURE__ */ jsx(Trash, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }, variant.id_variante_producto)) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editingVariant ? "Editar Variante" : isCloneMode ? "Duplicar Variante" : "Nueva Variante" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-h-[70vh] overflow-y-auto pr-2", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-4", children: [
          editingVariant && /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "sku", children: "SKU (Código de Referencia)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "sku",
                value: formData.sku,
                readOnly: true,
                className: "bg-muted font-mono cursor-not-allowed opacity-80"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground font-medium italic", children: "Código asignado por el sistema. No editable para mantener la secuencia." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Precio Lista" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: formData.precio_lista,
                  onChange: (e) => setFormData({ ...formData, precio_lista: e.target.value }),
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Costo Unitario" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: formData.costo,
                  onChange: (e) => setFormData({ ...formData, costo: e.target.value }),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Código de Barras (Opcional)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: formData.codigo_barras,
                onChange: (e) => setFormData({ ...formData, codigo_barras: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2 border-t pt-4", children: [
            /* @__PURE__ */ jsxs(Label, { className: "flex justify-between items-center", children: [
              "Características / Atributos",
              /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  onClick: () => setFormData((prev) => ({
                    ...prev,
                    atributos: [...prev.atributos, { key: "", value: "" }]
                  })),
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3 mr-1" }),
                    " Agregar"
                  ]
                }
              )
            ] }),
            formData.atributos.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground italic", children: "No hay atributos definidos (ej: Talla, Color)." }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-40 overflow-y-auto pr-1", children: formData.atributos.map((input, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-[140px]", children: /* @__PURE__ */ jsxs(
                Select,
                {
                  value: PREDEFINED_ATTRIBUTES.includes(input.key) ? input.key : input.key ? "otro" : "",
                  onValueChange: (val) => {
                    const newAttrs = [...formData.atributos];
                    newAttrs[index].key = val;
                    setFormData({ ...formData, atributos: newAttrs });
                  },
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Atributo" }) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: PREDEFINED_ATTRIBUTES.map((attr) => /* @__PURE__ */ jsx(SelectItem, { value: attr, children: attr }, attr)) })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Valor (ej: Rojo)",
                  value: input.value,
                  onChange: (e) => {
                    const newAttrs = [...formData.atributos];
                    newAttrs[index].value = e.target.value;
                    setFormData({ ...formData, atributos: newAttrs });
                  },
                  className: "h-8 text-xs flex-1"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  onClick: () => {
                    const newAttrs = formData.atributos.filter((_, i) => i !== index);
                    setFormData({ ...formData, atributos: newAttrs });
                  },
                  className: "h-8 w-8 text-destructive hover:text-red-600 p-0",
                  children: /* @__PURE__ */ jsx(Trash, { className: "h-4 w-4" })
                }
              )
            ] }, index)) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: saving, className: "w-full", children: [
            saving && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            editingVariant ? "Guardar Cambios" : "Crear Variante"
          ] }) })
        ] }),
        editingVariant && /* @__PURE__ */ jsxs("div", { className: "border-t pt-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-bold flex items-center gap-2 text-primary", children: [
              /* @__PURE__ */ jsx(ArrowRightLeft, { className: "h-4 w-4" }),
              " Gestión Rápida de Stock"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "font-mono", children: [
              "Actual: ",
              editingVariant.stock_actual ?? 0
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Tipo" }),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  value: quickStock.tipo,
                  onValueChange: (val) => setQuickStock({ ...quickStock, tipo: val }),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "entrada", children: "Entrada (+)" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "salida", children: "Salida (-)" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "ajuste", children: "Ajuste (Manual)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Cantidad" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  min: "1",
                  className: "h-8 text-xs",
                  value: quickStock.cantidad,
                  onChange: (e) => setQuickStock({ ...quickStock, cantidad: e.target.value }),
                  placeholder: "Ej: 10"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Motivo / Referencia" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                className: "h-8 text-xs",
                value: quickStock.motivo,
                onChange: (e) => setQuickStock({ ...quickStock, motivo: e.target.value }),
                placeholder: "Ej: Ajuste inicial, Entrada pedido..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              size: "sm",
              variant: "secondary",
              className: "w-full h-8 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
              disabled: registeringStock || !quickStock.cantidad,
              onClick: handleRegisterQuickStock,
              children: [
                registeringStock ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-3 w-3" }),
                "Registrar Stock"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "border-t pt-4", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsDialogOpen(false), className: "text-xs", children: "Cerrar" }) })
    ] }) })
  ] });
};

const ProductImagesTab = ({ product }) => {
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("all");
  const [uploadVariantId, setUploadVariantId] = useState("generic");
  const [imageToDelete, setImageToDelete] = useState(null);
  const fetchRes = async () => {
    if (!product?.id_producto) return;
    setLoading(true);
    try {
      const imgRes = await FetchData(API_ENDPOINTS.PRODUCTS.IMAGES(product.id_producto));
      setImages(imgRes.data || []);
      const varRes = await FetchData(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto));
      setVariants(varRes.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRes();
  }, [product]);
  const handleUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    if (uploadVariantId && uploadVariantId !== "generic") {
      formData.append("id_variante_producto", uploadVariantId);
    }
    try {
      await FetchData(
        API_ENDPOINTS.PRODUCTS.IMAGES(product.id_producto),
        "POST",
        { body: formData }
      );
      fetchRes();
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await FetchData(API_ENDPOINTS.IMAGES.ITEM(product.id_producto, imageToDelete), "DELETE");
      fetchRes();
    } catch (error) {
      console.error("Error deleting image", error);
      alert("No se pudo eliminar la imagen. Verifique la consola.");
    } finally {
      setImageToDelete(null);
    }
  };
  const handleSetPrincipal = async (imgId) => {
    try {
      await FetchData(
        `${API_ENDPOINTS.IMAGES.ITEM(product.id_producto, imgId)}?principal=true`,
        "PATCH"
      );
      fetchRes();
    } catch (error) {
      console.error("Error setting principal image", error);
    }
  };
  const filteredImages = images.filter((img) => {
    if (selectedVariantId === "all") return true;
    if (selectedVariantId === "generic") return img.id_variante_producto == null;
    return img.id_variante_producto?.toString() === selectedVariantId;
  });
  const getVariantName = (vId) => {
    if (!vId) return "General";
    const v = variants.find((x) => x.id_variante_producto === vId);
    return v ? `${v.sku}` : "Desconocido";
  };
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return url;
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Select, { value: selectedVariantId, onValueChange: setSelectedVariantId, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Filtrar por..." }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Todas las Imágenes" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "generic", children: "Generales (Producto)" }),
            variants.map((v) => /* @__PURE__ */ jsxs(SelectItem, { value: v.id_variante_producto.toString(), children: [
              "Var: ",
              v.sku
            ] }, v.id_variante_producto))
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: fetchRes, children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-muted/50 p-2 rounded-lg", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium mr-2", children: "Subir a:" }),
        /* @__PURE__ */ jsxs(Select, { value: uploadVariantId, onValueChange: setUploadVariantId, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px] h-8 text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "generic", children: "General" }),
            variants.map((v) => /* @__PURE__ */ jsx(SelectItem, { value: v.id_variante_producto.toString(), children: v.sku }, v.id_variante_producto))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              className: "hidden",
              id: "image-upload",
              onChange: handleUpload,
              disabled: uploading
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "image-upload", children: /* @__PURE__ */ jsx(Button, { variant: "default", size: "sm", asChild: true, disabled: uploading, className: "cursor-pointer h-8", children: /* @__PURE__ */ jsxs("span", { children: [
            uploading ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "mr-2 h-3 w-3" }),
            "Subir"
          ] }) }) })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-10 text-muted-foreground", children: "Cargando galería..." }) : filteredImages.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20", children: "No hay imágenes para esta vista." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: filteredImages.map((img) => /* @__PURE__ */ jsxs(Card, { className: "relative group overflow-hidden border-2 transition-all hover:border-primary/50", children: [
      img.es_principal && /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-sm flex items-center", children: [
        /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 mr-1 fill-current" }),
        " Principal"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 z-10 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm", children: getVariantName(img.id_variante_producto ?? null) }),
      /* @__PURE__ */ jsx("div", { className: "aspect-square bg-muted", children: /* @__PURE__ */ jsx("img", { src: getImageUrl(img.url), alt: "Product", className: "w-full h-full object-cover" }) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8 text-white hover:text-red-400 hover:bg-transparent",
            onClick: () => setImageToDelete(img.id_imagen_producto),
            children: /* @__PURE__ */ jsx(Trash, { className: "h-4 w-4" })
          }
        ),
        !img.es_principal && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            className: "h-6 text-white hover:text-yellow-400 hover:bg-transparent text-xs px-2",
            onClick: () => handleSetPrincipal(img.id_imagen_producto),
            children: "Principal"
          }
        )
      ] })
    ] }, img.id_imagen_producto)) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!imageToDelete, onOpenChange: (open) => !open && setImageToDelete(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "¿Está seguro?" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Esta acción eliminará la imagen de forma permanente." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancelar" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDelete, className: "bg-red-500 hover:bg-red-600", children: "Eliminar" })
      ] })
    ] }) })
  ] });
};

const ProductInventoryTab = ({ product }) => {
  const [variants, setVariants] = useState([]);
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [moveType, setMoveType] = useState("entrada");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [refExt, setRefExt] = useState("");
  const [costUnit, setCostUnit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fetchVariantsAndStock = async () => {
    if (!product?.id_producto) return;
    setLoading(true);
    try {
      const vResponse = await FetchData(API_ENDPOINTS.PRODUCTS.VARIANTS(product.id_producto));
      const vData = vResponse.data || [];
      setVariants(vData);
      const stockMap = {};
      vData.forEach((v) => {
        stockMap[v.id_variante_producto] = v.stock_actual || 0;
      });
      setStocks(stockMap);
    } catch (error) {
      console.error("Error fetching inventory", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVariantsAndStock();
  }, [product]);
  const handleMovement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        id_variante_producto: parseInt(selectedVariantId),
        tipo: moveType,
        cantidad: parseInt(amount),
        motivo: reason,
        ref_externa: refExt,
        costo_unitario: costUnit ? parseFloat(costUnit) : void 0
      };
      await FetchData(API_ENDPOINTS.INVENTORY.MOVEMENTS, "POST", { body: payload });
      setIsDialogOpen(false);
      fetchVariantsAndStock();
      setAmount("");
      setReason("");
      setRefExt("");
      setCostUnit("");
    } catch (error) {
      alert(error.message || "Error registrando movimiento");
      console.error("Movement error", error);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Control de Inventario" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setIsDialogOpen(true), disabled: variants.length === 0, children: [
        /* @__PURE__ */ jsx(ArrowRightLeft, { className: "mr-2 h-4 w-4" }),
        " Registrar Movimiento"
      ] })
    ] }),
    variants.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground bg-muted/20 rounded-lg", children: "No hay variantes configuradas. Crea variantes primero para gestionar inventario." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: variants.map((v) => /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: [
        "SKU: ",
        v.sku
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stocks[v.id_variante_producto] ?? "-" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Unidades Disponibles" }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs flex gap-2", children: [
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
            "Cost: $",
            v.costo
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
            "Price: $",
            v.precio_lista
          ] })
        ] })
      ] })
    ] }, v.id_variante_producto)) }),
    /* @__PURE__ */ jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Registrar Movimiento de Stock" }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleMovement, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Variante" }),
          /* @__PURE__ */ jsxs(Select, { value: selectedVariantId, onValueChange: setSelectedVariantId, required: true, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Selecciona variante" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: variants.map((v) => /* @__PURE__ */ jsxs(SelectItem, { value: v.id_variante_producto.toString(), children: [
              v.sku,
              " (Actual: ",
              stocks[v.id_variante_producto],
              ")"
            ] }, v.id_variante_producto)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Tipo Movimiento" }),
            /* @__PURE__ */ jsxs(Select, { value: moveType, onValueChange: setMoveType, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "entrada", children: "Entrada (+)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "salida", children: "Salida (-)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "ajuste", children: "Ajuste (Manual)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Cantidad" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: "1",
                value: amount,
                onChange: (e) => setAmount(e.target.value),
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Motivo / Descripción" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: reason,
              onChange: (e) => setReason(e.target.value),
              placeholder: "Ej: Compra proveedor, merma..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Ref. Externa" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: refExt,
                onChange: (e) => setRefExt(e.target.value),
                placeholder: "Fac-123"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Costo Unitario (Opcional)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: costUnit,
                onChange: (e) => setCostUnit(e.target.value),
                placeholder: "Auto"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsDialogOpen(false), children: "Cancelar" }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: submitting, children: [
            submitting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Registrar"
          ] })
        ] })
      ] })
    ] }) })
  ] });
};

const EditProductDialog = ({
  open,
  onClose,
  onProductUpdated,
  product
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3e3);
      return () => clearTimeout(timer);
    }
  }, [success]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  useEffect(() => {
    if (open) {
      fetchDependencies();
      if (product) {
        setNombre(product.nombre);
        setDescripcion(product.descripcion || "");
        if (product.id_producto) {
          fetchProductDetail(product.id_producto);
        }
      }
    }
  }, [open, product]);
  const fetchDependencies = async () => {
    setLoading(true);
    try {
      const cats = await FetchData(API_ENDPOINTS.CATEGORIES.LIST);
      const brs = await FetchData(API_ENDPOINTS.BRANDS.LIST);
      setCategories(Array.isArray(cats) ? cats : cats.data || []);
      setBrands(Array.isArray(brs) ? brs : brs.data || []);
    } catch (err) {
      console.error("Error fetching dependencies", err);
    } finally {
      setLoading(false);
    }
  };
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const handleSaveNewCategory = async () => {
    if (!newCategoryName || newCategoryName.trim() === "") return;
    setLoading(true);
    try {
      const res = await FetchData(API_ENDPOINTS.CATEGORIES.LIST, "POST", {
        body: { nombre: newCategoryName.trim() }
      });
      const catId = res.id_categoria || res.category?.id_categoria;
      if (res && catId) {
        await fetchDependencies();
        setCategoryId(catId.toString());
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (err) {
      setError(err.message || "Error al crear categoría");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveNewBrand = async () => {
    if (!newBrandName || newBrandName.trim() === "") return;
    setLoading(true);
    try {
      const res = await FetchData(API_ENDPOINTS.BRANDS.LIST, "POST", {
        body: { nombre: newBrandName.trim() }
      });
      const brId = res.id_marca || res.brand?.id_marca;
      if (res && brId) {
        await fetchDependencies();
        setBrandId(brId.toString());
        setIsAddingBrand(false);
        setNewBrandName("");
      }
    } catch (err) {
      setError(err.message || "Error al crear marca");
    } finally {
      setLoading(false);
    }
  };
  const fetchProductDetail = async (id) => {
    try {
      const data = await FetchData(API_ENDPOINTS.PRODUCTS.DETAIL(id));
      if (data) {
        setNombre(data.nombre);
        setDescripcion(data.descripcion || "");
        setCategoryId(data.id_categoria?.toString() || "");
        setBrandId(data.id_marca?.toString() || "");
      }
    } catch (err) {
      console.error("Error fetching product details", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!product) return;
    try {
      await FetchData(
        API_ENDPOINTS.PRODUCTS.UPDATE(product.id_producto),
        "PUT",
        {
          body: {
            nombre,
            descripcion,
            id_categoria: parseInt(categoryId),
            id_marca: parseInt(brandId),
            activo: product.activo
          }
        }
      );
      onProductUpdated();
      setSuccess("Producto actualizado correctamente");
    } catch (err) {
      setError(err.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  };
  if (!product) return null;
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (val) => !val && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[800px] h-[80vh] flex flex-col p-0 gap-0 bg-background", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "p-6 pb-2", children: [
      /* @__PURE__ */ jsxs(DialogTitle, { children: [
        "Gestionar Producto: ",
        product.nombre
      ] }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Edita información general, variantes, imágenes e inventario." })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "general", className: "flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 border-b", children: /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "general", children: "General" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "variants", children: "Variantes" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "images", children: "Imágenes" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "inventory", children: "Inventario" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [
        /* @__PURE__ */ jsx(TabsContent, { value: "general", className: "mt-0 h-full", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "edit-nombre", children: "Nombre" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "edit-nombre",
                value: nombre,
                onChange: (e) => setNombre(e.target.value),
                placeholder: "Nombre del producto"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx(Label, { children: "Categoría" }) }),
              !isAddingCategory ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Select, { value: categoryId, onValueChange: setCategoryId, disabled: loading, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: loading ? "Cargando..." : "Seleccionar" }) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: categories.filter((c) => c.id_categoria != null).map((c) => /* @__PURE__ */ jsx(
                    SelectItem,
                    {
                      value: c.id_categoria.toString(),
                      children: c.nombre || "Sin nombre"
                    },
                    c.id_categoria
                  )) })
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "link",
                    size: "sm",
                    className: "px-0 h-auto text-xs",
                    onClick: () => setIsAddingCategory(true),
                    children: "+ Agregar categoría"
                  }
                )
              ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2 border p-2 rounded-md bg-muted/30", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Nueva categoría...",
                    className: "h-8 text-xs",
                    value: newCategoryName,
                    onChange: (e) => setNewCategoryName(e.target.value),
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "h-7 text-[10px] flex-1", onClick: handleSaveNewCategory, disabled: loading, children: "Aceptar" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[10px] flex-1", onClick: () => setIsAddingCategory(false), children: "Cancelar" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx(Label, { children: "Marca" }) }),
              !isAddingBrand ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Select, { value: brandId, onValueChange: setBrandId, disabled: loading, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: loading ? "Cargando..." : "Seleccionar" }) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: brands.filter((b) => b.id_marca != null).map((b) => /* @__PURE__ */ jsx(
                    SelectItem,
                    {
                      value: b.id_marca.toString(),
                      children: b.nombre || "Sin nombre"
                    },
                    b.id_marca
                  )) })
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    variant: "link",
                    size: "sm",
                    className: "px-0 h-auto text-xs",
                    onClick: () => setIsAddingBrand(true),
                    children: "+ Agregar marca"
                  }
                )
              ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2 border p-2 rounded-md bg-muted/30", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Nueva marca...",
                    className: "h-8 text-xs",
                    value: newBrandName,
                    onChange: (e) => setNewBrandName(e.target.value),
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "h-7 text-[10px] flex-1", onClick: handleSaveNewBrand, disabled: loading, children: "Aceptar" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[10px] flex-1", onClick: () => setIsAddingBrand(false), children: "Cancelar" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "edit-descripcion", children: "Descripción" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "edit-descripcion",
                value: descripcion,
                onChange: (e) => setDescripcion(e.target.value),
                placeholder: "Detalles..."
              }
            )
          ] }),
          success && /* @__PURE__ */ jsx("div", { className: "p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300", children: success }),
          error && /* @__PURE__ */ jsx("div", { className: "p-3 bg-red-50 border border-red-200 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300", children: error }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cerrar" }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Guardando..." : "Guardar Información General" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "variants", className: "mt-0", children: /* @__PURE__ */ jsx(ProductVariantsTab, { product }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "images", className: "mt-0", children: /* @__PURE__ */ jsx(ProductImagesTab, { product }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "inventory", className: "mt-0", children: /* @__PURE__ */ jsx(ProductInventoryTab, { product }) })
      ] })
    ] })
  ] }) });
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToToggle, setProductToToggle] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5e3);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      queryParams.append("_t", Date.now().toString());
      const url = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
      const data = await FetchData(url);
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const handleToggleStatus = async () => {
    if (!productToToggle) return;
    setStatusLoading(true);
    try {
      await FetchData(API_ENDPOINTS.PRODUCTS.UPDATE(productToToggle.id_producto), "PUT", {
        body: { activo: !productToToggle.activo }
      });
      await fetchProducts();
      setMessage({
        type: "success",
        text: `Producto ${productToToggle.activo ? "desactivado" : "activado"} correctamente.`
      });
      setProductToToggle(null);
    } catch (error) {
      console.error("Error toggling product status:", error);
    } finally {
      setStatusLoading(false);
    }
  };
  const handleHardDelete = async () => {
    if (!productToDelete) return;
    setStatusLoading(true);
    try {
      await FetchData(API_ENDPOINTS.PRODUCTS.DELETE(productToDelete.id_producto), "DELETE");
      setMessage({ type: "success", text: "Producto eliminado permanentemente." });
      await fetchProducts();
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ type: "error", text: error.message || "No se pudo eliminar el producto. Puede que tenga pedidos asociados." });
    } finally {
      setStatusLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative w-full md:w-72", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Buscar productos...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-9 w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(CreateProductDialog, { onProductCreated: fetchProducts })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "py-4 flex flex-row items-center justify-between space-y-0", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Inventario de Productos" }),
        message && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full border animate-in fade-in slide-in-from-right-1 ${message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`, children: [
          message.type === "success" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: message.text })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-0 md:p-6", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Nombre" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Categoría" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Marca" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-center", children: "Variantes" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-center", children: "Stock Total" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Estado" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: loading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center h-24 text-muted-foreground", children: "Cargando productos..." }) }) : products.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center h-24 text-muted-foreground", children: "No se encontraron productos." }) }) : products.map((product) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: product.nombre }),
          /* @__PURE__ */ jsx(TableCell, { children: product.category_name || product.Categoria?.nombre || "-" }),
          /* @__PURE__ */ jsx(TableCell, { children: product.brand_name || product.Marca?.nombre || "-" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono", children: product.variants_count ?? 0 }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center font-bold", children: product.total_stock ?? 0 }),
          /* @__PURE__ */ jsx(TableCell, { children: product.activo ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx(Badge, { className: "bg-green-500 hover:bg-green-600 w-fit", children: "Activo" }),
            product.necesita_revision && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "border-orange-500 text-orange-500 bg-orange-500/10 text-[10px] py-0", children: "Borrador" })
          ] }) : /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "Inactivo" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "flex items-center gap-1 h-8",
                onClick: () => setSelectedProduct(product),
                children: [
                  /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5" }),
                  "Ver / Gestionar"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                title: product.activo ? "Desactivar" : "Activar",
                onClick: () => setProductToToggle(product),
                children: product.activo ? /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4 text-red-500" }) : /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                title: "Eliminar permanentemente",
                onClick: () => setProductToDelete(product),
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-red-600" })
              }
            )
          ] }) })
        ] }, product.id_producto)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      EditProductDialog,
      {
        open: !!selectedProduct,
        onClose: () => setSelectedProduct(null),
        onProductUpdated: fetchProducts,
        product: selectedProduct
      }
    ),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!productToToggle, onOpenChange: () => setProductToToggle(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: productToToggle?.activo ? "¿Desactivar producto?" : "¿Activar producto?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "¿Estás seguro que deseas ",
          productToToggle?.activo ? "desactivar" : "activar",
          " el producto ",
          /* @__PURE__ */ jsx("strong", { children: productToToggle?.nombre }),
          "?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: statusLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleToggleStatus, disabled: statusLoading, className: productToToggle?.activo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700", children: statusLoading ? "Procesando..." : productToToggle?.activo ? "Desactivar" : "Activar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!productToDelete, onOpenChange: (val) => !val && setProductToDelete(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "¿Eliminar producto de forma permanente?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Esta acción eliminará el producto ",
          /* @__PURE__ */ jsx("strong", { children: productToDelete?.nombre }),
          " del sistema. Esta acción no se puede deshacer."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: statusLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleHardDelete, disabled: statusLoading, className: "bg-red-600 hover:bg-red-700", children: statusLoading ? "Eliminando..." : "Eliminar permanentemente" })
      ] })
    ] }) })
  ] });
};

const ManageTaxonomies = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("brands");
  const [message, setMessage] = useState(null);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", id_padre: "" });
  const [brandToToggle, setBrandToToggle] = useState(null);
  const [categoryToToggle, setCategoryToToggle] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch(API_ENDPOINTS.BRANDS.LIST),
        fetch(API_ENDPOINTS.CATEGORIES.LIST)
      ]);
      if (brandsRes.ok) {
        const bData = await brandsRes.json();
        setBrands(bData.data || []);
      }
      if (categoriesRes.ok) {
        const cData = await categoriesRes.json();
        setCategories(cData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch taxonomies", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveBrand = async (e) => {
    e.preventDefault();
    try {
      const method = editingBrand ? "PATCH" : "POST";
      const url = editingBrand ? API_ENDPOINTS.BRANDS.ITEM(editingBrand.id_marca) : API_ENDPOINTS.BRANDS.LIST;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: formData.nombre })
      });
      if (response.ok) {
        setMessage({ type: "success", text: `Marca ${editingBrand ? "actualizada" : "creada"} correctamente.` });
        setIsBrandDialogOpen(false);
        setEditingBrand(null);
        setFormData({ nombre: "", id_padre: "" });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la marca." });
    }
  };
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const method = editingCategory ? "PATCH" : "POST";
      const url = editingCategory ? API_ENDPOINTS.CATEGORIES.ITEM(editingCategory.id_categoria) : API_ENDPOINTS.CATEGORIES.LIST;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          id_padre: formData.id_padre ? parseInt(formData.id_padre) : null
        })
      });
      if (response.ok) {
        setMessage({ type: "success", text: `Categoría ${editingCategory ? "actualizada" : "creada"} correctamente.` });
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
        setFormData({ nombre: "", id_padre: "" });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la categoría." });
    }
  };
  const handleToggleBrandStatus = async () => {
    if (!brandToToggle) return;
    setStatusLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.BRANDS.ITEM(brandToToggle.id_marca), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !brandToToggle.activo })
      });
      if (response.ok) {
        setMessage({ type: "success", text: `Marca ${brandToToggle.activo ? "desactivada" : "activada"} correctamente.` });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al cambiar el estado de la marca." });
    } finally {
      setStatusLoading(false);
      setBrandToToggle(null);
    }
  };
  const handleToggleCategoryStatus = async () => {
    if (!categoryToToggle) return;
    setStatusLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES.ITEM(categoryToToggle.id_categoria), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !categoryToToggle.activo })
      });
      if (response.ok) {
        setMessage({ type: "success", text: `Categoría ${categoryToToggle.activo ? "desactivada" : "activada"} correctamente.` });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al cambiar el estado de la categoría." });
    } finally {
      setStatusLoading(false);
      setCategoryToToggle(null);
    }
  };
  const filteredBrands = brands.filter((b) => b.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categories.filter((c) => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleOpenCreateDialog = () => {
    setFormData({ nombre: "", id_padre: "" });
    if (activeTab === "brands") {
      setEditingBrand(null);
      setIsBrandDialogOpen(true);
    } else {
      setEditingCategory(null);
      setIsCategoryDialogOpen(true);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    message && /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-md flex items-center gap-3 ${message.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`, children: [
      message.type === "success" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
      message.text
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "bg-card/40 backdrop-blur-md border-white/10 shadow-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Tags, { className: "h-5 w-5 text-primary" }),
          "Listado General"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 w-full max-w-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Buscar...",
                className: "pl-9 bg-background/50 border-white/10 w-full",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: handleOpenCreateDialog,
              className: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
                "Nueva ",
                activeTab === "brands" ? "Marca" : "Categoría"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "w-full justify-start rounded-none border-b border-white/5 bg-transparent p-0 h-12", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "brands", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-6 h-full", children: "Marcas" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "categories", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-6 h-full", children: "Categorías" })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "brands", className: "m-0", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent border-white/5", children: [
            /* @__PURE__ */ jsx(TableHead, { className: "text-muted-foreground", children: "ID" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-muted-foreground", children: "Nombre" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-muted-foreground", children: "Estado" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right text-muted-foreground", children: "Acciones" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: loading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "h-32 text-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto text-primary" }) }) }) : filteredBrands.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "h-32 text-center text-muted-foreground", children: "No se encontraron marcas." }) }) : filteredBrands.map((brand) => /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-white/5 border-white/5 transition-colors", children: [
            /* @__PURE__ */ jsxs(TableCell, { className: "font-mono text-xs opacity-50", children: [
              "#",
              brand.id_marca
            ] }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: brand.nombre }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: brand.activo ? "default" : "secondary", className: brand.activo ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "", children: brand.activo ? "Activo" : "Inactivo" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-primary hover:text-primary hover:bg-primary/10",
                  onClick: () => {
                    setEditingBrand(brand);
                    setFormData({ nombre: brand.nombre, id_padre: "" });
                    setIsBrandDialogOpen(true);
                  },
                  children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: `h-8 w-8 ${brand.activo ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" : "text-green-500 hover:text-green-600 hover:bg-green-500/10"}`,
                  title: brand.activo ? "Desactivar" : "Activar",
                  onClick: () => setBrandToToggle(brand),
                  children: brand.activo ? /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Power, { className: "h-4 w-4" })
                }
              )
            ] }) })
          ] }, brand.id_marca)) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "categories", className: "m-0", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent border-white/5", children: [
            /* @__PURE__ */ jsx(TableHead, { className: "text-muted-foreground", children: "ID" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-muted-foreground", children: "Nombre" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-muted-foreground", children: "Estado" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right text-muted-foreground", children: "Acciones" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: loading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "h-32 text-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto text-primary" }) }) }) : filteredCategories.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "h-32 text-center text-muted-foreground", children: "No se encontraron categorías." }) }) : filteredCategories.map((cat) => /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-white/5 border-white/5 transition-colors", children: [
            /* @__PURE__ */ jsxs(TableCell, { className: "font-mono text-xs opacity-50", children: [
              "#",
              cat.id_categoria
            ] }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: cat.nombre }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: cat.activo ? "default" : "secondary", className: cat.activo ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "", children: cat.activo ? "Activo" : "Inactivo" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-primary hover:text-primary hover:bg-primary/10",
                  onClick: () => {
                    setEditingCategory(cat);
                    setFormData({ nombre: cat.nombre, id_padre: cat.id_padre?.toString() || "" });
                    setIsCategoryDialogOpen(true);
                  },
                  children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: `h-8 w-8 ${cat.activo ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10" : "text-green-500 hover:text-green-600 hover:bg-green-500/10"}`,
                  title: cat.activo ? "Desactivar" : "Activar",
                  onClick: () => setCategoryToToggle(cat),
                  children: cat.activo ? /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Power, { className: "h-4 w-4" })
                }
              )
            ] }) })
          ] }, cat.id_categoria)) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isBrandDialogOpen, onOpenChange: setIsBrandDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "bg-card border-border sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "text-foreground text-xl font-bold", children: editingBrand ? "Editar Marca" : "Nueva Marca" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "text-muted-foreground", children: editingBrand ? "Modifica los detalles de la marca." : "Agrega una nueva marca para tus productos." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveBrand, children: [
        /* @__PURE__ */ jsx("div", { className: "grid gap-6 py-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", className: "text-right font-semibold text-foreground", children: "Nombre" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              className: "col-span-3 bg-background border-border text-foreground focus:ring-primary",
              value: formData.nombre,
              onChange: (e) => setFormData({ ...formData, nombre: e.target.value }),
              required: true,
              placeholder: "Inserte nombre de marca"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full sm:w-auto font-bold shadow-md", children: editingBrand ? "Guardar Cambios" : "Crear Marca" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isCategoryDialogOpen, onOpenChange: setIsCategoryDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "bg-card border-border sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "text-foreground text-xl font-bold", children: editingCategory ? "Editar Categoría" : "Nueva Categoría" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "text-muted-foreground", children: editingCategory ? "Modifica los detalles de la categoría." : "Agrega una nueva categoría para tus productos." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveCategory, children: [
        /* @__PURE__ */ jsx("div", { className: "grid gap-6 py-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "catName", className: "font-semibold text-foreground text-right", children: "Nombre" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "catName",
              className: "col-span-3 bg-background border-border text-foreground focus:ring-primary",
              value: formData.nombre,
              onChange: (e) => setFormData({ ...formData, nombre: e.target.value }),
              required: true,
              placeholder: "Inserte nombre de categoría"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full sm:w-auto font-bold shadow-md", children: editingCategory ? "Guardar Cambios" : "Crear Categoría" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!brandToToggle, onOpenChange: () => !statusLoading && setBrandToToggle(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "bg-card border-white/10 text-white", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "¿Confirmar cambio de estado?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { className: "text-muted-foreground", children: [
          "¿Estás seguro de que deseas ",
          brandToToggle?.activo ? "desactivar" : "activar",
          " la marca ",
          /* @__PURE__ */ jsx("strong", { children: brandToToggle?.nombre }),
          "?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: statusLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsxs(
          AlertDialogAction,
          {
            onClick: (e) => {
              e.preventDefault();
              handleToggleBrandStatus();
            },
            className: brandToToggle?.activo ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90",
            disabled: statusLoading,
            children: [
              statusLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
              brandToToggle?.activo ? "Desactivar" : "Activar"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!categoryToToggle, onOpenChange: () => !statusLoading && setCategoryToToggle(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "bg-card border-white/10 text-white", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "¿Confirmar cambio de estado?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { className: "text-muted-foreground", children: [
          "¿Estás seguro de que deseas ",
          categoryToToggle?.activo ? "desactivar" : "activar",
          " la categoría ",
          /* @__PURE__ */ jsx("strong", { children: categoryToToggle?.nombre }),
          "?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: statusLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsxs(
          AlertDialogAction,
          {
            onClick: (e) => {
              e.preventDefault();
              handleToggleCategoryStatus();
            },
            className: categoryToToggle?.activo ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90",
            disabled: statusLoading,
            children: [
              statusLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
              categoryToToggle?.activo ? "Desactivar" : "Activar"
            ]
          }
        )
      ] })
    ] }) })
  ] });
};

const COLUMN_NAMES = {
  "id_producto": "ID Prod",
  "producto": "Producto",
  "id_variante_producto": "ID Var",
  "sku": "SKU",
  "stock": "Stock",
  "total_salidas": "Salidas",
  "variante": "Variante",
  "id_salida": "ID Salida",
  "fecha": "Fecha",
  "cantidad": "Cant",
  "motivo": "Motivo",
  "referencia": "Ref/Pedido",
  "autorizado_por": "Autorizado",
  "costo_unit": "Costo U.",
  "subtotal": "Subtotal",
  "total_movimientos": "Total Movs",
  "total_unidades": "Total Unids",
  "valor_estimado_despachado": "Valor Est. Despacho"
};
const InventoryReports = () => {
  const [loading, setLoading] = useState(null);
  const formatHeaders = (headers) => {
    return headers.map((h) => COLUMN_NAMES[h] || h.toUpperCase());
  };
  const downloadCSV = (data, fileName) => {
    if (!data || data.length === 0) return;
    const rawHeaders = Object.keys(data[0]);
    const translatedHeaders = formatHeaders(rawHeaders);
    const csvContent = [
      translatedHeaders.join(";"),
      ...data.map(
        (row) => rawHeaders.map((header) => {
          const value = row[header] ?? "";
          if (header === "fecha") return new Date(value).toLocaleString();
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(";")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadPDF = (data, title, fileName) => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString();
    doc.text(`Fecha de generación: ${date}`, 14, 30);
    const rawHeaders = Object.keys(data[0]);
    const translatedHeaders = formatHeaders(rawHeaders);
    const body = data.map((row) => rawHeaders.map((header) => {
      const val = row[header];
      if (header === "fecha") return new Date(val).toLocaleDateString();
      if (header.includes("valor") || header === "subtotal" || header === "costo_unit") {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(val);
      }
      return val;
    }));
    autoTable(doc, {
      startY: 35,
      head: [translatedHeaders],
      body,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      // Indigo style
      styles: { fontSize: 7, cellPadding: 2 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });
    doc.save(`${fileName}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`);
  };
  const handleDownloadReport = async (type, format) => {
    const loadingKey = `${type}-${format}`;
    setLoading(loadingKey);
    try {
      let endpoint = "";
      let fileName = "";
      let title = "";
      switch (type) {
        case "stock":
          endpoint = "/api/reports/stock-actual";
          fileName = "reporte_stock_actual";
          title = "Reporte de Stock Actual";
          break;
        case "low-stock":
          endpoint = "/api/reports/stock-bajo";
          fileName = "alertas_stock_bajo";
          title = "Alertas de Stock Bajo";
          break;
        case "top-sales":
          endpoint = "/api/reports/top-salidas";
          fileName = "ranking_productos_salidas";
          title = "Ranking de Productos (Top Salidas)";
          break;
        case "mov-kpis":
          endpoint = "/api/reports/movimientos-kpis";
          fileName = "kpis_despachos";
          title = "KPIs de Despachos y Salidas";
          break;
        case "mov-detalle":
          endpoint = "/api/reports/movimientos-detalle";
          fileName = "historial_detallado_salidas";
          title = "Historial Detallado de Salidas";
          break;
      }
      const response = await fetch(endpoint);
      const result = await response.json();
      let rawData = [];
      if (Array.isArray(result)) {
        rawData = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        rawData = result.data;
      } else if (result && typeof result === "object") {
        rawData = [result];
      }
      const cleanData = rawData.filter((item) => item && typeof item === "object" && Object.keys(item).length > 0).map((item) => {
        const { producto_activo, variante_activa, data, ...rest } = item;
        return rest;
      });
      if (format === "csv") {
        downloadCSV(cleanData, fileName);
      } else {
        downloadPDF(cleanData, title, fileName);
      }
    } catch (error) {
      console.error(`Error downloading ${type} ${format} report:`, error);
    } finally {
      setLoading(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Box, { className: "h-5 w-5 text-primary" }),
        " Inventario Operativo"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs(Card, { className: "bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-primary/30 transition-all group", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("div", { className: "p-3 w-fit rounded-xl bg-blue-500/10 text-blue-500 mb-2 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl text-foreground", children: "Stock Actual" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-foreground/70 font-medium", children: "Listado completo de variantes activas con sus cantidades en almacén." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handleDownloadReport("stock", "pdf"),
                disabled: loading !== null,
                className: "w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-lg",
                children: [
                  loading === "stock-pdf" ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(FileDown, { className: "mr-2 h-4 w-4" }),
                  "Descargar PDF"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handleDownloadReport("stock", "csv"),
                disabled: loading !== null,
                variant: "ghost",
                className: "w-full text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 border border-blue-500/20",
                children: [
                  loading === "stock-csv" ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
                  "Descargar CSV"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-red-500/30 transition-all group", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx("div", { className: "p-3 w-fit rounded-xl bg-red-500/10 text-red-500 mb-2 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl text-foreground", children: "Alertas de Stock" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "text-foreground/70 font-medium", children: "Variantes activas con stock bajo (crítico) que requieren reposición." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handleDownloadReport("low-stock", "pdf"),
                disabled: loading !== null,
                className: "w-full bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg",
                children: [
                  loading === "low-stock-pdf" ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(FileDown, { className: "mr-2 h-4 w-4" }),
                  "Descargar PDF"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handleDownloadReport("low-stock", "csv"),
                disabled: loading !== null,
                variant: "ghost",
                className: "w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20",
                children: [
                  loading === "low-stock-csv" ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
                  "Descargar CSV"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(History, { className: "h-5 w-5 text-primary" }),
        " Despachos y Movimientos"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2", children: /* @__PURE__ */ jsxs(Card, { className: "bg-card/60 backdrop-blur-md border border-foreground/10 shadow-lg hover:border-purple-500/30 transition-all group", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 w-fit rounded-xl bg-purple-500/10 text-purple-600 mb-2 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(History, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl text-foreground", children: "Historial de Salidas" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-foreground/70 font-medium", children: "Log detallado de cada despacho, quién lo autorizó y con qué referencia." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => handleDownloadReport("mov-detalle", "pdf"),
              disabled: loading !== null,
              className: "flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 shadow-lg",
              children: [
                loading === "mov-detalle-pdf" ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(FileDown, { className: "mr-2 h-4 w-4" }),
                "PDF"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => handleDownloadReport("mov-detalle", "csv"),
              disabled: loading !== null,
              variant: "outline",
              className: "flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10",
              children: [
                loading === "mov-detalle-csv" ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
                "CSV"
              ]
            }
          )
        ] })
      ] }) })
    ] })
  ] });
};

const ProductQueueEditor = ({ createdProducts, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const total = createdProducts.length;
  const currentBase = createdProducts[currentIndex];
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const fetchTaxonomies = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        FetchData(API_ENDPOINTS.CATEGORIES.LIST),
        FetchData(API_ENDPOINTS.BRANDS.LIST)
      ]);
      setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : brandsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch taxonomies:", error);
    }
  };
  useEffect(() => {
    fetchTaxonomies();
  }, []);
  useEffect(() => {
    if (!currentBase?.id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await FetchData(API_ENDPOINTS.PRODUCTS.DETAIL(currentBase.id));
        if (data) {
          setCurrentProduct(data);
          setCategoryId(data.id_categoria?.toString() || "");
          setBrandId(data.id_marca?.toString() || "");
        }
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [currentIndex, currentBase]);
  const handleSaveAndNext = async () => {
    if (!currentProduct) return;
    setSaving(true);
    try {
      await FetchData(
        API_ENDPOINTS.PRODUCTS.UPDATE(currentProduct.id_producto),
        "PUT",
        {
          body: {
            nombre: currentProduct.nombre,
            descripcion: currentProduct.descripcion,
            id_categoria: categoryId ? parseInt(categoryId) : null,
            id_marca: brandId ? parseInt(brandId) : null,
            activo: currentProduct.activo,
            necesita_revision: false
          }
        }
      );
      handleNext();
    } catch (error) {
      console.error("Error updating product", error);
    } finally {
      setSaving(false);
    }
  };
  const handleSaveNewCategory = async () => {
    if (!newCategoryName || newCategoryName.trim() === "") return;
    setLoading(true);
    try {
      const res = await FetchData(API_ENDPOINTS.CATEGORIES.LIST, "POST", {
        body: { nombre: newCategoryName.trim() }
      });
      const catId = res.id_categoria || res.category?.id_categoria;
      if (res && catId) {
        await fetchTaxonomies();
        setCategoryId(catId.toString());
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveNewBrand = async () => {
    if (!newBrandName || newBrandName.trim() === "") return;
    setLoading(true);
    try {
      const res = await FetchData(API_ENDPOINTS.BRANDS.LIST, "POST", {
        body: { nombre: newBrandName.trim() }
      });
      const brId = res.id_marca || res.brand?.id_marca;
      if (res && brId) {
        await fetchTaxonomies();
        setBrandId(brId.toString());
        setIsAddingBrand(false);
        setNewBrandName("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  if (!currentProduct || loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 space-y-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando producto..." })
    ] });
  }
  const progressPercent = (currentIndex + 1) / total * 100;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6 relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1", children: [
            "Completar Producto ",
            currentIndex + 1,
            " de ",
            total
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-foreground", children: currentProduct.nombre })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-primary", children: [
          currentIndex + 1,
          "/",
          total
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-white/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-primary transition-all duration-500 ease-out",
          style: { width: `${progressPercent}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold flex items-center gap-2 mb-4", children: "Clasificación" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground font-bold uppercase tracking-wider", children: [
                "Categoría ",
                currentBase.categoria_sugerida ? /* @__PURE__ */ jsxs("span", { className: "text-amber-500 normal-case font-normal", children: [
                  "(Sugerida: ",
                  currentBase.categoria_sugerida,
                  ")"
                ] }) : ""
              ] }),
              !isAddingCategory ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Select, { value: categoryId, onValueChange: setCategoryId, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "bg-background/50 border-white/10", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sin especificar" }) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id_categoria.toString(), children: c.nombre }, c.id_categoria)) })
                ] }),
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "link", size: "sm", className: "px-0 h-auto text-xs", onClick: () => {
                  setIsAddingCategory(true);
                  setNewCategoryName(currentBase.categoria_sugerida || "");
                }, children: [
                  "+ Crear ",
                  `"${currentBase.categoria_sugerida || "nueva"}"`
                ] })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2 border border-white/10 p-2 rounded-md bg-white/5", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    placeholder: "Nueva categoría...",
                    className: "h-8 w-full px-2 text-xs bg-background/50 border border-white/10 rounded",
                    value: newCategoryName,
                    onChange: (e) => setNewCategoryName(e.target.value),
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "h-7 text-[10px] flex-1", onClick: handleSaveNewCategory, disabled: loading, children: "Guardar" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[10px] flex-1 border-white/10", onClick: () => setIsAddingCategory(false), children: "Cancelar" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground font-bold uppercase tracking-wider", children: [
                "Marca ",
                currentBase.marca_sugerida ? /* @__PURE__ */ jsxs("span", { className: "text-amber-500 normal-case font-normal", children: [
                  "(Sugerida: ",
                  currentBase.marca_sugerida,
                  ")"
                ] }) : ""
              ] }),
              !isAddingBrand ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Select, { value: brandId, onValueChange: setBrandId, children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "bg-background/50 border-white/10", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sin especificar" }) }),
                  /* @__PURE__ */ jsx(SelectContent, { children: brands.map((b) => /* @__PURE__ */ jsx(SelectItem, { value: b.id_marca.toString(), children: b.nombre }, b.id_marca)) })
                ] }),
                /* @__PURE__ */ jsxs(Button, { type: "button", variant: "link", size: "sm", className: "px-0 h-auto text-xs", onClick: () => {
                  setIsAddingBrand(true);
                  setNewBrandName(currentBase.marca_sugerida || "");
                }, children: [
                  "+ Crear ",
                  `"${currentBase.marca_sugerida || "nueva"}"`
                ] })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2 border border-white/10 p-2 rounded-md bg-white/5", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    placeholder: "Nueva marca...",
                    className: "h-8 w-full px-2 text-xs bg-background/50 border border-white/10 rounded",
                    value: newBrandName,
                    onChange: (e) => setNewBrandName(e.target.value),
                    autoFocus: true
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", className: "h-7 text-[10px] flex-1", onClick: handleSaveNewBrand, disabled: loading, children: "Guardar" }),
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", size: "sm", className: "h-7 text-[10px] flex-1 border-white/10", onClick: () => setIsAddingBrand(false), children: "Cancelar" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl", children: /* @__PURE__ */ jsx(ProductVariantsTab, { product: currentProduct }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold flex items-center gap-2 mb-4", children: "Imágenes" }),
          /* @__PURE__ */ jsx("div", { className: "-mt-4", children: /* @__PURE__ */ jsx(ProductImagesTab, { product: currentProduct }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl sticky top-6", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "lg",
              className: "w-full font-bold shadow-lg shadow-primary/20 h-14 text-lg mb-4",
              onClick: handleSaveAndNext,
              disabled: saving,
              children: [
                saving ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin mr-2" }) : /* @__PURE__ */ jsx(Save, { className: "h-5 w-5 mr-2" }),
                "Guardar y Sig."
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-muted-foreground", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: handlePrev,
                disabled: currentIndex === 0 || saving,
                className: "flex items-center",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
                  " Ant."
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: handleNext,
                disabled: saving,
                className: "flex items-center hover:text-foreground",
                children: [
                  "Saltar ",
                  /* @__PURE__ */ jsx(SkipForward, { className: "h-4 w-4 ml-1" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
};

const BulkProductUpload = () => {
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedProducts, setParsedProducts] = useState([]);
  const [createdProducts, setCreatedProducts] = useState([]);
  const [message, setMessage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isResuming, setIsResuming] = useState(false);
  useEffect(() => {
    checkPending();
  }, []);
  const checkPending = async () => {
    try {
      const data = await FetchData(API_ENDPOINTS.PRODUCTS.LIST + "/pending");
      if (Array.isArray(data) && data.length > 0) {
        setPendingCount(data.length);
        setCreatedProducts(data);
      } else {
        setPendingCount(0);
      }
    } catch (e) {
      console.error("Error checking pending products", e);
    }
  };
  const handleResume = () => {
    setStep("queue");
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };
  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const rawResponse = await FetchData(API_ENDPOINTS.BULK.PARSE_FILE, "POST", {
        body: formData
      });
      console.log("Raw Response from parse-file:", rawResponse);
      const parsedData = Array.isArray(rawResponse) ? rawResponse : rawResponse?.products || rawResponse?.data;
      if (parsedData && parsedData.length > 0) {
        const productsToCreate = parsedData.map((p) => ({
          ...p,
          id_categoria: null,
          id_marca: null
        }));
        const createRes = await FetchData(API_ENDPOINTS.BULK.CREATE, "POST", {
          body: { products: productsToCreate }
        });
        setCreatedProducts(
          (createRes.createdProducts || []).map((cp, idx) => ({
            ...cp,
            categoria_sugerida: parsedData[idx]?.categoria_sugerida || parsedData[idx]?.categoria_nombre,
            marca_sugerida: parsedData[idx]?.marca_sugerida || parsedData[idx]?.marca_nombre
          }))
        );
        setStep("success_created");
      } else {
        setMessage({ type: "error", text: `Error de formato o vacío. Servidor devolvió: ${JSON.stringify(rawResponse)}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Error al procesar el archivo." });
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setFile(null);
    setStep("upload");
    setCreatedProducts([]);
    setMessage(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-6xl mx-auto", children: [
    message && /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"}`, children: [
      message.type === "success" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: message.text })
    ] }),
    step === "upload" && /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.15)]", children: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-10 w-10 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "Carga Masiva Jerárquica" }),
        pendingCount > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl max-w-md mx-auto animate-pulse", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-orange-400 font-semibold flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            " Tienes ",
            pendingCount,
            " productos sin terminar de editar."
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleResume,
              className: "mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 px-6 shadow-lg shadow-orange-900/20",
              children: [
                "Continuar Edición ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-orange-400/50 mt-2 uppercase tracking-widest font-bold", children: "O sube un nuevo archivo abajo" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-4 max-w-md mx-auto", children: "Sube tu inventario para procesar jerarquías. Si dejas la celda de nombre vacía, el sistema asumirá que es otra variante del producto anterior." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "text-primary border-primary/20 hover:bg-primary/5 font-semibold",
              asChild: true,
              children: /* @__PURE__ */ jsxs("a", { href: "/templates/plantilla_productos.csv", download: "plantilla_productos.csv", children: [
                /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
                " Plantilla CSV"
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "text-green-500 border-green-500/20 hover:bg-green-500/5 font-semibold",
              asChild: true,
              children: /* @__PURE__ */ jsxs("a", { href: "/templates/plantilla_productos.xlsx", download: "plantilla_productos.xlsx", children: [
                /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
                " Plantilla Excel"
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `
            mt-8 border-2 border-dashed rounded-xl p-10 transition-all duration-300
            ${file ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/50 hover:bg-white/5"}
          `, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            id: "bulk-file",
            className: "hidden",
            accept: ".csv, .xlsx, .xls",
            onChange: handleFileChange
          }
        ),
        /* @__PURE__ */ jsxs("label", { htmlFor: "bulk-file", className: "cursor-pointer flex flex-col items-center gap-4", children: [
          /* @__PURE__ */ jsx(Upload, { className: `h-12 w-12 ${file ? "text-primary" : "text-muted-foreground"} animate-bounce` }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-foreground", children: file ? file.name : "Haz clic para seleccionar o arrastra un archivo" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Formatos soportados: .xlsx, .xls, .csv" })
          ] }),
          file && /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10",
              onClick: (e) => {
                e.preventDefault();
                setFile(null);
              },
              children: [
                /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-2" }),
                " Quitar archivo"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-4 flex justify-center", children: /* @__PURE__ */ jsxs(
        Button,
        {
          size: "lg",
          className: "px-12 font-bold shadow-lg shadow-primary/20 h-12",
          disabled: !file || loading,
          onClick: handleParse,
          children: [
            loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin mr-2" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 mr-2" }),
            "Procesar Archivo"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-white/5 border border-white/5", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-primary mb-1", children: "Columnas Requeridas" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "codigo (opcional), nombre, descripcion (atributo variante), costo, precio_lista, stock, categoria_nombre, marca_nombre (opcional)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-white/5 border border-white/5", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-primary mb-1", children: "Mapeo Completo" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Deberás asociar la Marca y la Categoría antes de registrar finalmente." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-white/5 border border-white/5", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-primary mb-1", children: "Cero Redundancia" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Deja en blanco la celda de nombre para agregar otra variante al perfume anterior." })
        ] })
      ] })
    ] }),
    step === "success_created" && /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-10 max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-10 w-10 text-green-400" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm mb-2", children: "¡Productos Creados!" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-lg", children: [
          "Se han registrado ",
          createdProducts.length,
          " productos base."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 bg-white/5 border border-white/10 rounded-xl max-h-[250px] overflow-y-auto p-2 space-y-2 custom-scrollbar text-left", children: createdProducts.map((p, idx) => /* @__PURE__ */ jsxs("div", { className: "p-3 bg-card border border-white/5 rounded-lg flex items-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-mono text-sm mr-4", children: [
          "#",
          idx + 1
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground truncate", children: p.nombre })
      ] }, p.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between gap-4 pt-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "lg",
            className: "w-full sm:w-1/2 border-white/10 font-bold",
            onClick: reset,
            children: "Cargar más"
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "lg",
            className: "w-full sm:w-1/2 shadow-xl shadow-primary/20 font-bold bg-slate-800 hover:bg-slate-700 text-white",
            onClick: () => setStep("queue"),
            children: [
              "Editar en Cola ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
            ]
          }
        )
      ] })
    ] }),
    step === "queue" && /* @__PURE__ */ jsx(
      ProductQueueEditor,
      {
        createdProducts,
        onFinish: () => setStep("finished")
      }
    ),
    step === "finished" && /* @__PURE__ */ jsxs("div", { className: "bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden p-12 text-center space-y-6 animate-in zoom-in-95 duration-500", children: [
      /* @__PURE__ */ jsx("div", { className: "w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-12 w-12 text-green-400" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "Proceso Completado" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-3 max-w-md mx-auto text-lg", children: "Los productos y sus jerarquías de variantes han sido registrados exitosamente." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center pt-8", children: [
        /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", className: "font-bold border-white/10", onClick: reset, children: "Cargar otro archivo" }),
        /* @__PURE__ */ jsx(Button, { size: "lg", className: "font-bold shadow-lg shadow-primary/20 px-8", onClick: () => window.location.reload(), children: "Ir al inventario" })
      ] })
    ] })
  ] });
};

const ProductsManagement = () => {
  const [pendingCount, setPendingCount] = React__default.useState(0);
  React__default.useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PRODUCTS.LIST + "/pending");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkPending();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight text-foreground drop-shadow-sm", children: "Gestión de Inventario" }),
      /* @__PURE__ */ jsx("p", { className: "text-foreground/70 font-medium", children: "Administra tu inventario, marcas y categorías en un solo lugar." })
    ] }) }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "inventory", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-card/60 backdrop-blur-md border border-foreground/10 p-1 shadow-sm", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "inventory", className: "flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold", children: [
          /* @__PURE__ */ jsx(Box, { className: "h-4 w-4" }),
          " Productos"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "taxonomies", className: "flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold", children: [
          /* @__PURE__ */ jsx(Tags, { className: "h-4 w-4" }),
          " Categorías y Marcas"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "reports", className: "flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
          " Reportes"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "bulk", className: "flex items-center gap-2 text-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold relative", children: [
          /* @__PURE__ */ jsx(UploadCloud, { className: "h-4 w-4" }),
          " Carga Masiva",
          pendingCount > 0 && /* @__PURE__ */ jsxs("span", { className: "absolute -top-1 -right-1 flex h-3 w-3", children: [
            /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" }),
            /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "inventory", className: "mt-6", children: /* @__PURE__ */ jsx(ProductList, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "taxonomies", className: "mt-6", children: /* @__PURE__ */ jsx(ManageTaxonomies, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "reports", className: "mt-6", children: /* @__PURE__ */ jsx(InventoryReports, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "bulk", className: "mt-6", children: /* @__PURE__ */ jsx(BulkProductUpload, {}) })
    ] })
  ] });
};

const $$Products = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Inventario - Panel Administrativo" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 p-6 md:p-8"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager", "vendedor", "viewer"], "panelName": "Inventario", "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "ProductsManagement", ProductsManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Products/ProductsManagement", "client:component-export": "ProductsManagement" })} ` })} </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/products.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/products.astro";
const $$url = "/dashboard/products";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Products,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
