/* empty css                                        */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/utils_DgFjlps2.mjs';
import { $ as $$Header, a as $$Sidebar } from '../../chunks/Sidebar_C5lneAx-.mjs';
import { $ as $$Footer } from '../../chunks/Footer_Jq4O6KSJ.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, A as AlertDialog, f as AlertDialogContent, g as AlertDialogHeader, h as AlertDialogTitle, i as AlertDialogDescription, j as AlertDialogFooter, k as AlertDialogCancel, l as AlertDialogAction } from '../../chunks/alert-dialog_BRiavCKX.mjs';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from '../../chunks/card_tvzaMCZO.mjs';
import { B as Button } from '../../chunks/button_DdS5ZpT0.mjs';
import { I as Input } from '../../chunks/input_CS_ajWDZ.mjs';
import { B as Badge } from '../../chunks/badge_Iq-H4wPg.mjs';
import { UserPlus, Search, CheckCircle2, AlertCircle, Key, Settings, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from '../../chunks/dialog_DoyHhWGx.mjs';
import { L as Label } from '../../chunks/label_DGuNO1IL.mjs';
import { F as FetchData, A as API_ENDPOINTS } from '../../chunks/api_BIGgZbYc.mjs';
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from '../../chunks/select_Bk1ZEmt9.mjs';
import { A as AuthGuard } from '../../chunks/AuthGuard_D6P99Tiu.mjs';
export { renderers } from '../../renderers.mjs';

const CreateUserDialog = ({ onUserCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "viewer"
  });
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await FetchData(API_ENDPOINTS.USERS.CREATE, "POST", {
        body: formData
      });
      setOpen(false);
      setFormData({ nombre: "", email: "", password: "", rol: "viewer" });
      onUserCreated();
    } catch (err) {
      setError(err.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
      /* @__PURE__ */ jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
      " Nuevo Usuario"
    ] }) }),
    /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Crear Nuevo Usuario" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Ingrese los datos del nuevo usuario." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "nombre", className: "text-right", children: "Nombre" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "nombre",
              value: formData.nombre,
              onChange: (e) => setFormData({ ...formData, nombre: e.target.value }),
              className: "col-span-3",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "text-right", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              value: formData.email,
              onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              className: "col-span-3",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", className: "text-right", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: formData.password,
              onChange: (e) => setFormData({ ...formData, password: e.target.value }),
              className: "col-span-3",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "rol", className: "text-right", children: "Rol" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-3", children: /* @__PURE__ */ jsxs(
            "select",
            {
              id: "rol",
              value: formData.rol,
              onChange: (e) => setFormData({ ...formData, rol: e.target.value }),
              className: "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx("option", { value: "viewer", children: "Viewer" }),
                /* @__PURE__ */ jsx("option", { value: "vendedor", children: "Vendedor" }),
                /* @__PURE__ */ jsx("option", { value: "manager", children: "Manager" }),
                /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" })
              ]
            }
          ) })
        ] }),
        error && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-sm text-center", children: error })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Creando..." : "Crear Usuario" }) })
    ] }) })
  ] });
};

const ChangePasswordDialog = ({ open, onClose, user }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await FetchData(API_ENDPOINTS.USERS.UPDATE(user.id_usuario, "password"), "PATCH", {
        body: { password }
      });
      onClose();
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Error actualizando password");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (val) => !val && onClose(), children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "Cambiar Contraseña" }),
      /* @__PURE__ */ jsxs(DialogDescription, { children: [
        "Ingrese la nueva contraseña para el usuario ",
        /* @__PURE__ */ jsx("strong", { children: user?.nombre }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-password", className: "text-right", children: "Nueva" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "new-password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: "col-span-3",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 items-center gap-4", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-password", className: "text-right", children: "Confirmar" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "confirm-password",
            type: "password",
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            className: "col-span-3",
            required: true
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-sm text-center", children: error })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Guardando..." : "Guardar Cambios" })
    ] })
  ] }) }) });
};

const AVAILABLE_ROLES = [
  { id: "viewer", label: "Viewer" },
  { id: "vendedor", label: "Vendedor" },
  { id: "manager", label: "Manager" },
  { id: "admin", label: "Admin" }
];
const EditRoleDialog = ({ open, onClose, onUserUpdated, user }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user && user.roles && user.roles.length > 0) {
      setSelectedRole(user.roles[0]);
    } else {
      setSelectedRole("viewer");
    }
  }, [user]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await FetchData(API_ENDPOINTS.USERS.UPDATE(user.id_usuario, "roles"), "PATCH", {
        body: { roles: [selectedRole] }
      });
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err.message || "Error actualizando roles");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (val) => !val && onClose(), children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "Editar Roles" }),
      /* @__PURE__ */ jsxs(DialogDescription, { children: [
        "Seleccione el rol para el usuario ",
        /* @__PURE__ */ jsx("strong", { children: user?.nombre }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "role-select", children: "Rol asignado" }),
        /* @__PURE__ */ jsxs(Select, { value: selectedRole, onValueChange: setSelectedRole, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { id: "role-select", className: "w-full", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Seleccione un rol" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: AVAILABLE_ROLES.map((role) => /* @__PURE__ */ jsx(SelectItem, { value: role.id, children: role.label }, role.id)) })
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-sm text-center", children: error })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: "Cancelar" }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? "Guardando..." : "Guardar Cambios" })
    ] })
  ] }) }) });
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5e3);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const handleHardDelete = async () => {
    if (!userToDelete) return;
    setStatusLoading(true);
    try {
      await FetchData(API_ENDPOINTS.USERS.DELETE(userToDelete.id_usuario), "DELETE");
      setMessage({ type: "success", text: "Usuario eliminado permanentemente." });
      await fetchUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage({
        type: "error",
        text: error.message || "No se pudo eliminar el usuario. Puede que tenga registros asociados."
      });
    } finally {
      setStatusLoading(false);
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      if (searchTerm) queryParams.append("search", searchTerm);
      const url = `${API_ENDPOINTS.USERS.LIST}?${queryParams.toString()}`;
      const data = await FetchData(url);
      if (data && Array.isArray(data.data)) {
        setUsers(data.data);
        setTotalPages(Math.ceil(data.total / data.limit) || 1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1 && searchTerm !== "") {
        setPage(1);
      } else {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  useEffect(() => {
    fetchUsers();
  }, [page]);
  const handleToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setStatusLoading(true);
    try {
      await FetchData(API_ENDPOINTS.USERS.UPDATE(userToToggleStatus.id_usuario, "status"), "PATCH", {
        body: { activo: !userToToggleStatus.activo }
      });
      await fetchUsers();
      setUserToToggleStatus(null);
    } catch (error) {
      console.error("Error toggling user status:", error);
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
            placeholder: "Buscar usuarios...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-9 w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(CreateUserDialog, { onUserCreated: fetchUsers })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "py-4 flex flex-row items-center justify-between space-y-0", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Usuarios del Sistema" }),
        message && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full border animate-in fade-in slide-in-from-right-1 ${message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`, children: [
          message.type === "success" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: message.text })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-0 md:p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Nombre" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Rol" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Estado" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Acciones" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: loading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, className: "text-center h-24 text-muted-foreground", children: "Cargando usuarios..." }) }) : users.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, className: "text-center h-24 text-muted-foreground", children: "No se encontraron usuarios." }) }) : users.map((user) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: user.nombre }),
            /* @__PURE__ */ jsx(TableCell, { children: user.email }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "capitalize", children: user.roles && user.roles.length > 0 ? user.roles.join(", ") : "viewer" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: user.activo ? /* @__PURE__ */ jsx(Badge, { className: "bg-green-500 hover:bg-green-600", children: "Activo" }) : /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "Inactivo" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  title: "Cambiar Password",
                  onClick: () => setSelectedUserForPassword(user),
                  children: /* @__PURE__ */ jsx(Key, { className: "h-4 w-4 text-muted-foreground" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  title: "Editar Rol",
                  onClick: () => setSelectedUserForRole(user),
                  children: /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-muted-foreground" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  title: user.activo ? "Desactivar" : "Activar",
                  onClick: () => setUserToToggleStatus(user),
                  children: user.activo ? /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4 text-red-500" }) : /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  title: "Eliminar permanentemente",
                  onClick: () => setUserToDelete(user),
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-red-600" })
                }
              )
            ] }) })
          ] }, user.id_usuario)) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end space-x-2 py-4", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage((p) => Math.max(1, p - 1)),
              disabled: page === 1 || loading,
              children: [
                /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
                "Anterior"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
            "Página ",
            page,
            " de ",
            totalPages || 1
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
              disabled: page >= totalPages || loading,
              children: [
                "Siguiente",
                /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ChangePasswordDialog,
      {
        open: !!selectedUserForPassword,
        onClose: () => setSelectedUserForPassword(null),
        user: selectedUserForPassword
      }
    ),
    /* @__PURE__ */ jsx(
      EditRoleDialog,
      {
        open: !!selectedUserForRole,
        onClose: () => setSelectedUserForRole(null),
        onUserUpdated: fetchUsers,
        user: selectedUserForRole
      }
    ),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!userToToggleStatus, onOpenChange: () => setUserToToggleStatus(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: userToToggleStatus?.activo ? "¿Desactivar usuario?" : "¿Activar usuario?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "¿Estás seguro que deseas ",
          userToToggleStatus?.activo ? "desactivar" : "activar",
          " al usuario ",
          /* @__PURE__ */ jsx("strong", { children: userToToggleStatus?.nombre }),
          "?",
          userToToggleStatus?.activo && " El usuario no podrá acceder al sistema."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: statusLoading, children: "Cancelar" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleToggleStatus, disabled: statusLoading, className: userToToggleStatus?.activo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700", children: statusLoading ? "Procesando..." : userToToggleStatus?.activo ? "Desactivar" : "Activar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!userToDelete, onOpenChange: (val) => !val && setUserToDelete(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "¿Eliminar usuario de forma permanente?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "Esta acción eliminará al usuario ",
          /* @__PURE__ */ jsx("strong", { children: userToDelete?.nombre }),
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

const $$Users = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Usuarios - Panel Administrativo" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col min-h-screen bg-background bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"> ${renderComponent($$result2, "Header", $$Header, {})} <div class="flex flex-1"> ${renderComponent($$result2, "Sidebar", $$Sidebar, {})} <main class="flex-1 p-6 md:p-8"> ${renderComponent($$result2, "AuthGuard", AuthGuard, { "client:load": true, "allowedRoles": ["admin", "manager"], "panelName": "Usuarios", "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/AuthGuard", "client:component-export": "AuthGuard" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "UserList", UserList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/components/Dashboard/Users/UserList", "client:component-export": "UserList" })} ` })} </main> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/users.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/dashboard/users.astro";
const $$url = "/dashboard/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
