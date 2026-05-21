/* empty css                                     */
import { c as createComponent, e as renderComponent, r as renderTemplate, m as maybeRenderHead, a as renderScript } from '../chunks/astro/server_CAlqQ6Q9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/utils_DgFjlps2.mjs';
import { B as Button } from '../chunks/button_DdS5ZpT0.mjs';
import { I as Input } from '../chunks/input_CS_ajWDZ.mjs';
import { L as Label } from '../chunks/label_DGuNO1IL.mjs';
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Iniciar Sesi\xF3n" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex items-center justify-center min-h-screen bg-background text-foreground"> <div class="w-full max-w-md"> <div class="bg-card shadow-md rounded-lg p-8 border border-border"> <h1 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1> <form id="login-form" class="space-y-6"> <div> ${renderComponent($$result2, "Label", Label, { "htmlFor": "email" }, { "default": async ($$result3) => renderTemplate`Email` })} ${renderComponent($$result2, "Input", Input, { "type": "email", "id": "email", "placeholder": "m@example.com", "required": true })} </div> <div> ${renderComponent($$result2, "Label", Label, { "htmlFor": "password" }, { "default": async ($$result3) => renderTemplate`Contraseña` })} ${renderComponent($$result2, "Input", Input, { "type": "password", "id": "password", "required": true })} </div> ${renderComponent($$result2, "Button", Button, { "type": "submit", "className": "w-full" }, { "default": async ($$result3) => renderTemplate`Iniciar Sesión` })} </form> <p id="error-message" class="text-red-500 mt-4 text-center"></p> <p class="mt-4 text-center text-sm">
¿No tienes una cuenta?
<a href="/register" class="underline">Regístrate</a> </p> <div class="mt-6 text-center border-t pt-4"> <a href="/" class="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-medium">
← Ir al Catálogo
</a> </div> </div> </div> </main> ${renderScript($$result2, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/login.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/login.astro", void 0);

const $$file = "C:/Users/aniba/Downloads/TRABAJO DE GRADO/banano-shop-ft/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
