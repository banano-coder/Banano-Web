/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { $ as $$Footer } from '../../chunks/Footer_Jq4O6KSJ.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, A as AlertDialog, f as AlertDialogContent, g as AlertDialogHeader, h as AlertDialogTitle, i as AlertDialogDescription, j as AlertDialogFooter, k as AlertDialogCancel, l as AlertDialogAction } from '../../chunks/alert-dialog_BRiavCKX.mjs';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from '../../chunks/card_tvzaMCZO.mjs';
import { B as Button } from '../../chunks/button_DdS5ZpT0.mjs';
import { I as Input } from '../../chunks/input_CS_ajWDZ.mjs';
import { L as Label } from '../../chunks/label_DGuNO1IL.mjs';
import { B as Badge } from '../../chunks/badge_Iq-H4wPg.mjs';
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from '../../chunks/dialog_DoyHhWGx.mjs';
import { Warehouse, Plus, Search, RefreshCw, CheckCircle2, AlertCircle, MapPin, Phone, Edit, Trash2, Eye } from 'lucide-react';
import { A as API_ENDPOINTS, F as FetchData } from '../../chunks/api_BIGgZbYc.mjs';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    activo: true
  });
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && Array.isArray(user.roles)) {
          const rolesLower = user.roles.map((r) => r.toLowerCase());
          setUserRole(rolesLower.join(", "));
          setHasWritePermission(rolesLower.some((r) => ["admin", "manager"].includes(r)));
        }
      } catch (e) {
        console.error("Error parsing user roles", e);
      }
    }
  }, []);
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 5e3);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter !== "all") queryParams.append("activo", statusFilter);
      if (includeDeleted) queryParams.append("incluir_eliminados", "true");
      const url = `${API_ENDPOINTS.ALMACENES.LIST}?${queryParams.toString()}`;
      const response = await FetchData(url);
      let list = [];
      if (response && "data" in response && Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response)) {
        list = response;
      }
      setWarehouses(list);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      setFeedbackMessage({
        type: "error",
        text: error.message || "Error al cargar listado de almacenes."
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchWarehouses();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, includeDeleted]);
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setActionLoading(true);
    setFormError("");
    try {
      await FetchData(API_ENDPOINTS.ALMACENES.LIST, "POST", {
        body: {
          nombre: formData.nombre.trim(),
          direccion: formData.direccion.trim() || null,
          telefono: formData.telefono.trim() || null,
          activo: formData.activo
        }
      });
      setFeedbackMessage({
        type: "success",
        text: "Almacén creado exitosamente."
      });
      setIsCreateOpen(false);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error("Error creating warehouse:", error);
      setFormError(error.message || "No se pudo crear el almacén.");
    } finally {
      setActionLoading(false);
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse) return;
    if (!formData.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setActionLoading(true);
    setFormError("");
    try {
      await FetchData(API_ENDPOINTS.ALMACENES.ITEM(selectedWarehouse.id_almacen), "PATCH", {
        body: {
          nombre: formData.nombre.trim(),
          direccion: formData.direccion.trim() || null,
          telefono: formData.telefono.trim() || null,
          activo: formData.activo
        }
      });
      setFeedbackMessage({
        type: "success",
        text: "Almacén actualizado exitosamente."
      });
      setIsEditOpen(false);
      setSelectedWarehouse(null);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error("Error updating warehouse:", error);
      setFormError(error.message || "No se pudo actualizar el almacén.");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!warehouseToDelete) return;
    setActionLoading(true);
    try {
      await FetchData(API_ENDPOINTS.ALMACENES.ITEM(warehouseToDelete.id_almacen), "DELETE");
      setFeedbackMessage({
        type: "success",
        text: "Almacén eliminado (desactivado) exitosamente."
      });
      setWarehouseToDelete(null);
      fetchWarehouses();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      setFeedbackMessage({
        type: "error",
        text: error.message || "No se pudo eliminar el almacén."
      });
    } finally {
      setActionLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      telefono: "",
      activo: true
    });
    setFormError("");
  };
  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };
  const openEditDialog = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      nombre: warehouse.nombre || "",
      direccion: warehouse.direccion || "",
      telefono: warehouse.telefono || "",
      activo: warehouse.activo
    });
    setFormError("");
    setIsEditOpen(true);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground", children: [
          /* @__PURE__ */ jsx(Warehouse, { className: "h-6 w-6 text-primary" }),
          "Gestión de Almacenes"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Administra y monitorea las ubicaciones físicas y de stock para los inventarios." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border", children: [
          "Rol: ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold capitalize text-foreground", children: userRole || "cargando..." })
        ] }),
        hasWritePermission && /* @__PURE__ */ jsxs(Button, { onClick: openCreateDialog, className: "shadow-lg hover:shadow-primary/20 transition-all duration-200", children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Nuevo Almacén"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-card/50 p-4 rounded-xl border border-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Buscar por nombre o dirección...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-9 w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "statusFilter", className: "text-xs font-semibold text-muted-foreground whitespace-nowrap", children: "Filtrar Estado:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "statusFilter",
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              className: "flex h-9 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "Todos" }),
                /* @__PURE__ */ jsx("option", { value: "true", children: "Activos" }),
                /* @__PURE__ */ jsx("option", { value: "false", children: "Inactivos" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "includeDeleted",
              checked: includeDeleted,
              onChange: (e) => setIncludeDeleted(e.target.checked),
              className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            }
          ),
          /* @__PURE__ */ jsx(Label, { htmlFor: "includeDeleted", className: "text-xs font-semibold text-muted-foreground cursor-pointer select-none", children: "Incluir eliminados lógicamente" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: fetchWarehouses, title: "Recargar", children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border border-border shadow-xl bg-card/85 backdrop-blur-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "py-4 flex flex-row items-center justify-between space-y-0 border-b border-border bg-card/50", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Locales registrados" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-xs", children: "Lista completa de bodegas y puntos de despacho." })
        ] }),
        feedbackMessage && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full border animate-in fade-in slide-in-from-right-1 ${feedbackMessage.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`, children: [
          feedbackMessage.type === "success" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: feedbackMessage.text })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { className: "bg-muted/40", children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: "ID" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Nombre" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Dirección" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Teléfono" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Estado" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Fecha Creado" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right pr-6", children: "Acciones" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: loading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center h-48", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-primary" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Cargando almacenes..." })
        ] }) }) }) : warehouses.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center h-32 text-muted-foreground italic text-sm", children: "No se encontraron almacenes con los criterios de búsqueda." }) }) : warehouses.map((warehouse) => /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxs(TableCell, { className: "font-mono text-xs text-muted-foreground", children: [
            "#",
            warehouse.id_almacen
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-semibold text-foreground", children: warehouse.nombre }),
          /* @__PURE__ */ jsx(TableCell, { className: "max-w-xs truncate", children: warehouse.direccion ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-sm", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
            warehouse.direccion
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs italic", children: "Sin dirección" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: warehouse.telefono ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-sm", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
            warehouse.telefono
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs italic", children: "Sin teléfono" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: warehouse.activo ? /* @__PURE__ */ jsx(Badge, { className: "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25", children: "Activo" }) : /* @__PURE__ */ jsx(Badge, { variant: "destructive", className: "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25", children: "Inactivo" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-muted-foreground", children: warehouse.created_at ? new Date(warehouse.created_at).toLocaleDateString() : "N/A" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right pr-6", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-1", children: hasWritePermission ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                title: "Editar",
                onClick: () => openEditDialog(warehouse),
                className: "hover:text-primary hover:bg-primary/10 h-8 w-8",
                children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                title: "Eliminar (Desactivar)",
                onClick: () => setWarehouseToDelete(warehouse),
                className: "hover:text-destructive hover:bg-destructive/10 h-8 w-8",
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              title: "Ver Detalle",
              onClick: () => openEditDialog(warehouse),
              className: "hover:text-primary hover:bg-primary/10 h-8 w-8",
              children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 text-muted-foreground" })
            }
          ) }) })
        ] }, warehouse.id_almacen)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen, children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-[480px]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateSubmit, children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5 text-primary" }),
          "Crear Nuevo Almacén"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Completa el formulario para registrar un nuevo almacén en la red de inventario." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "create-nombre", className: "font-semibold text-sm", children: [
            "Nombre del Almacén ",
            /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "create-nombre",
              value: formData.nombre,
              onChange: (e) => setFormData({ ...formData, nombre: e.target.value }),
              placeholder: "Ej. Almacén Central de Reparto",
              required: true,
              maxLength: 100
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "create-direccion", className: "font-semibold text-sm", children: "Dirección Física" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "create-direccion",
              value: formData.direccion,
              onChange: (e) => setFormData({ ...formData, direccion: e.target.value }),
              placeholder: "Av. Juan Pablo Duarte #45, Santiago",
              maxLength: 255
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "create-telefono", className: "font-semibold text-sm", children: "Teléfono de Contacto" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "create-telefono",
              value: formData.telefono,
              onChange: (e) => setFormData({ ...formData, telefono: e.target.value }),
              placeholder: "Ej. 809-555-0100",
              maxLength: 50
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "create-activo",
              checked: formData.activo,
              onChange: (e) => setFormData({ ...formData, activo: e.target.checked }),
              className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            }
          ),
          /* @__PURE__ */ jsx(Label, { htmlFor: "create-activo", className: "font-medium text-sm cursor-pointer", children: "Habilitar inmediatamente al crear" })
        ] }),
        formError && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: formError })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => setIsCreateOpen(false), disabled: actionLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: actionLoading, children: actionLoading ? "Guardando..." : "Crear Almacén" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: isEditOpen, onOpenChange: setIsEditOpen, children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-[480px]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleEditSubmit, children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Warehouse, { className: "h-5 w-5 text-primary" }),
          hasWritePermission ? "Editar Almacén" : "Detalles del Almacén"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: hasWritePermission ? "Modifica los campos del almacén seleccionado." : "Visualización de datos generales del almacén." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "edit-nombre", className: "font-semibold text-sm", children: [
            "Nombre del Almacén ",
            /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit-nombre",
              value: formData.nombre,
              onChange: (e) => setFormData({ ...formData, nombre: e.target.value }),
              placeholder: "Ej. Almacén Central de Reparto",
              required: true,
              disabled: !hasWritePermission,
              maxLength: 100
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-direccion", className: "font-semibold text-sm", children: "Dirección Física" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit-direccion",
              value: formData.direccion,
              onChange: (e) => setFormData({ ...formData, direccion: e.target.value }),
              placeholder: "Av. Juan Pablo Duarte #45, Santiago",
              disabled: !hasWritePermission,
              maxLength: 255
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-telefono", className: "font-semibold text-sm", children: "Teléfono de Contacto" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit-telefono",
              value: formData.telefono,
              onChange: (e) => setFormData({ ...formData, telefono: e.target.value }),
              placeholder: "Ej. 809-555-0100",
              disabled: !hasWritePermission,
              maxLength: 50
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "edit-activo",
              checked: formData.activo,
              onChange: (e) => setFormData({ ...formData, activo: e.target.checked }),
              disabled: !hasWritePermission,
              className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            }
          ),
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit-activo", className: "font-medium text-sm cursor-pointer", children: "Marcar como Activo" })
        ] }),
        formError && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-2", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: formError })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => setIsEditOpen(false), disabled: actionLoading, children: hasWritePermission ? "Cancelar" : "Cerrar" }),
        hasWritePermission && /* @__PURE__ */ jsx(Button, { type: "submit", disabled: actionLoading, children: actionLoading ? "Guardando..." : "Guardar Cambios" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!warehouseToDelete, onOpenChange: (open) => !open && setWarehouseToDelete(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { className: "flex items-center gap-2 text-destructive", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
          "¿Eliminar Almacén?"
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Esta acción realizará un ",
          /* @__PURE__ */ jsx("strong", { children: "borrado lógico" }),
          " del almacén ",
          /* @__PURE__ */ jsx("strong", { children: warehouseToDelete?.nombre }),
          ". El registro quedará archivado como inactivo y oculto por defecto, pero se mantendrá su historial en la base de datos."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: actionLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: handleDeleteConfirm,
            disabled: actionLoading,
            className: "bg-destructive hover:bg-destructive/95 text-destructive-foreground",
            children: actionLoading ? "Desactivando..." : "Desactivar y archivar"
          }
        )
      ] })
    ] }) })
  ] });
};

const $$Almacenes = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Almacenes - Panel Administrativo" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 p-6 md:p-8"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager", "vendedor", "viewer"], "panelName": "Almacenes", "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "WarehouseManagement", WarehouseManagement, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Warehouses/WarehouseManagement", "client:component-export": "WarehouseManagement" })} ` })} </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/almacenes.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/almacenes.astro";
const $$url = "/dashboard/almacenes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Almacenes,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
