import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_S7LFz3M5.mjs';
import { manifest } from './manifest_D9CTzjNS.mjs';

const serverIslandMap = new Map([
]);;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/almacenes/_id_.astro.mjs');
const _page2 = () => import('./pages/api/almacenes.astro.mjs');
const _page3 = () => import('./pages/api/auditoria.astro.mjs');
const _page4 = () => import('./pages/api/auth/login.astro.mjs');
const _page5 = () => import('./pages/api/auth/me.astro.mjs');
const _page6 = () => import('./pages/api/auth/register.astro.mjs');
const _page7 = () => import('./pages/api/auth/signup.astro.mjs');
const _page8 = () => import('./pages/api/brands/_id_.astro.mjs');
const _page9 = () => import('./pages/api/brands.astro.mjs');
const _page10 = () => import('./pages/api/bulk/create.astro.mjs');
const _page11 = () => import('./pages/api/bulk/parse-file.astro.mjs');
const _page12 = () => import('./pages/api/catalog/_---path_.astro.mjs');
const _page13 = () => import('./pages/api/categories/_id_.astro.mjs');
const _page14 = () => import('./pages/api/categories.astro.mjs');
const _page15 = () => import('./pages/api/guest/checkout.astro.mjs');
const _page16 = () => import('./pages/api/guest/cliente/_cedula_.astro.mjs');
const _page17 = () => import('./pages/api/inventario/movimientos.astro.mjs');
const _page18 = () => import('./pages/api/inventario/stock/_id_.astro.mjs');
const _page19 = () => import('./pages/api/pedidos/_id_/estado.astro.mjs');
const _page20 = () => import('./pages/api/pedidos/_id_.astro.mjs');
const _page21 = () => import('./pages/api/pedidos.astro.mjs');
const _page22 = () => import('./pages/api/products/_id_/images/_imgid_.astro.mjs');
const _page23 = () => import('./pages/api/products/_id_/images.astro.mjs');
const _page24 = () => import('./pages/api/products/_id_/variants.astro.mjs');
const _page25 = () => import('./pages/api/products/_id_.astro.mjs');
const _page26 = () => import('./pages/api/products.astro.mjs');
const _page27 = () => import('./pages/api/profile/password.astro.mjs');
const _page28 = () => import('./pages/api/profile.astro.mjs');
const _page29 = () => import('./pages/api/public/_---path_.astro.mjs');
const _page30 = () => import('./pages/api/reports/debug-stock.astro.mjs');
const _page31 = () => import('./pages/api/reports/movimientos-detalle.astro.mjs');
const _page32 = () => import('./pages/api/reports/movimientos-kpis.astro.mjs');
const _page33 = () => import('./pages/api/reports/stock-actual.astro.mjs');
const _page34 = () => import('./pages/api/reports/stock-bajo.astro.mjs');
const _page35 = () => import('./pages/api/reports/top-salidas.astro.mjs');
const _page36 = () => import('./pages/api/settings.astro.mjs');
const _page37 = () => import('./pages/api/users/_id_/_action_.astro.mjs');
const _page38 = () => import('./pages/api/users/_id_.astro.mjs');
const _page39 = () => import('./pages/api/users.astro.mjs');
const _page40 = () => import('./pages/api/variants/_id_.astro.mjs');
const _page41 = () => import('./pages/dashboard/almacenes.astro.mjs');
const _page42 = () => import('./pages/dashboard/audit.astro.mjs');
const _page43 = () => import('./pages/dashboard/money.astro.mjs');
const _page44 = () => import('./pages/dashboard/orders.astro.mjs');
const _page45 = () => import('./pages/dashboard/products.astro.mjs');
const _page46 = () => import('./pages/dashboard/sales.astro.mjs');
const _page47 = () => import('./pages/dashboard/settings.astro.mjs');
const _page48 = () => import('./pages/dashboard/users.astro.mjs');
const _page49 = () => import('./pages/dashboard.astro.mjs');
const _page50 = () => import('./pages/login.astro.mjs');
const _page51 = () => import('./pages/register.astro.mjs');
const _page52 = () => import('./pages/uploads/_---path_.astro.mjs');
const _page53 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/almacenes/[id].ts", _page1],
    ["src/pages/api/almacenes/index.ts", _page2],
    ["src/pages/api/auditoria.ts", _page3],
    ["src/pages/api/auth/login.ts", _page4],
    ["src/pages/api/auth/me.ts", _page5],
    ["src/pages/api/auth/register.ts", _page6],
    ["src/pages/api/auth/signup.ts", _page7],
    ["src/pages/api/brands/[id].ts", _page8],
    ["src/pages/api/brands/index.ts", _page9],
    ["src/pages/api/bulk/create.ts", _page10],
    ["src/pages/api/bulk/parse-file.ts", _page11],
    ["src/pages/api/catalog/[...path].ts", _page12],
    ["src/pages/api/categories/[id].ts", _page13],
    ["src/pages/api/categories/index.ts", _page14],
    ["src/pages/api/guest/checkout.ts", _page15],
    ["src/pages/api/guest/cliente/[cedula].ts", _page16],
    ["src/pages/api/inventario/movimientos.ts", _page17],
    ["src/pages/api/inventario/stock/[id].ts", _page18],
    ["src/pages/api/pedidos/[id]/estado.ts", _page19],
    ["src/pages/api/pedidos/[id].ts", _page20],
    ["src/pages/api/pedidos/index.ts", _page21],
    ["src/pages/api/products/[id]/images/[imgId].ts", _page22],
    ["src/pages/api/products/[id]/images.ts", _page23],
    ["src/pages/api/products/[id]/variants.ts", _page24],
    ["src/pages/api/products/[id].ts", _page25],
    ["src/pages/api/products/index.ts", _page26],
    ["src/pages/api/profile/password.ts", _page27],
    ["src/pages/api/profile/index.ts", _page28],
    ["src/pages/api/public/[...path].ts", _page29],
    ["src/pages/api/reports/debug-stock.ts", _page30],
    ["src/pages/api/reports/movimientos-detalle.ts", _page31],
    ["src/pages/api/reports/movimientos-kpis.ts", _page32],
    ["src/pages/api/reports/stock-actual.ts", _page33],
    ["src/pages/api/reports/stock-bajo.ts", _page34],
    ["src/pages/api/reports/top-salidas.ts", _page35],
    ["src/pages/api/settings/index.ts", _page36],
    ["src/pages/api/users/[id]/[action].ts", _page37],
    ["src/pages/api/users/[id].ts", _page38],
    ["src/pages/api/users/index.ts", _page39],
    ["src/pages/api/variants/[id].ts", _page40],
    ["src/pages/dashboard/almacenes.astro", _page41],
    ["src/pages/dashboard/audit.astro", _page42],
    ["src/pages/dashboard/money.astro", _page43],
    ["src/pages/dashboard/orders.astro", _page44],
    ["src/pages/dashboard/products.astro", _page45],
    ["src/pages/dashboard/sales.astro", _page46],
    ["src/pages/dashboard/settings.astro", _page47],
    ["src/pages/dashboard/users.astro", _page48],
    ["src/pages/dashboard/index.astro", _page49],
    ["src/pages/login.astro", _page50],
    ["src/pages/register.astro", _page51],
    ["src/pages/uploads/[...path].ts", _page52],
    ["src/pages/index.astro", _page53]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "a1bb6c2e-66b5-4ac5-9893-880fe886b8ad",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
