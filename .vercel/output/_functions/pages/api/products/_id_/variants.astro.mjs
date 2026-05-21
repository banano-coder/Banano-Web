export { renderers } from '../../../../renderers.mjs';

const proxy = async ({ request, params }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const { id } = params;
    const targetUrl = `${externalApiBase}/products/${id}/variants`;
    const body = request.method !== "GET" ? await request.text() : void 0;
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying variants request`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
const GET = proxy;
const POST = proxy;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
