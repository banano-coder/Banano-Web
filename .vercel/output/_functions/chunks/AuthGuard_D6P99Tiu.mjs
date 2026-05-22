import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { LogIn, ShieldAlert } from 'lucide-react';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from './card_tvzaMCZO.mjs';
import { B as Button } from './button_DdS5ZpT0.mjs';

const AuthGuard = ({ children, allowedRoles, panelName }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;
  if (!user) {
    return /* @__PURE__ */ jsxs(Card, { className: "max-w-md mx-auto mt-12 border-dashed border-2", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(LogIn, { className: "h-6 w-6 text-muted-foreground" }) }),
        /* @__PURE__ */ jsx(CardTitle, { children: "Sesión requerida" }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Debes iniciar sesión para acceder al panel de ",
          panelName,
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "flex justify-center", children: /* @__PURE__ */ jsx(Button, { onClick: () => window.location.href = "/login", children: "Ir al Login" }) })
    ] });
  }
  const hasPermission = user.roles.some((role) => allowedRoles.includes(role));
  if (!hasPermission) {
    return /* @__PURE__ */ jsxs(Card, { className: "max-w-2xl mx-auto mt-12 border-red-200 bg-red-50/30", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "h-10 w-10 text-red-600" }) }),
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl text-red-900 font-bold", children: "Acceso Denegado" }),
        /* @__PURE__ */ jsxs(CardDescription, { className: "text-red-700 text-base", children: [
          "Lo sentimos, no tienes los permisos necesarios para ver el panel de ",
          /* @__PURE__ */ jsx("strong", { children: panelName }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-center pb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white/50 rounded-lg border border-red-100 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-800", children: "Esta sección está restringida exclusivamente para:" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2", children: allowedRoles.map((role) => /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider", children: role }, role)) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground italic", children: [
          "Tu rol actual es: ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground uppercase", children: user.roles.join(", ") || "sin rol" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => window.location.href = "/dashboard", children: "Volver al Inicio" }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
};

export { AuthGuard as A };
