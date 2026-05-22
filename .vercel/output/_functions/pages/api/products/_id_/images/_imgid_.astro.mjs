export { renderers } from '../../../../../renderers.mjs';

const handler = async ({ request, params }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const { id, imgId } = params;
    console.log(`[Proxy] Image Request: Method=${request.method}, Product=${id}, Image=${imgId}`);
    let targetUrl = "";
    if (request.method === "PATCH") {
      const url = new URL(request.url);
      if (url.searchParams.has("principal")) {
        targetUrl = `${externalApiBase}/products/${id}/images/${imgId}/principal`;
      } else {
        return new Response(JSON.stringify({ message: "Bad Request: Missing action" }), { status: 400 });
      }
    } else {
      targetUrl = `${externalApiBase}/products/${id}/images/${imgId}`;
    }
    console.log(`[Proxy] Forwarding to: ${targetUrl}`);
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying image details request`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
const PATCH = handler;
const DELETE = handler;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
