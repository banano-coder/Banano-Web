export { renderers } from '../../../../renderers.mjs';

const handler = async ({ request, params }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (request.method !== "GET" && !token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const { id } = params;
    const targetUrl = `${externalApiBase}/products/${id}/images`;
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    let body;
    if (request.method === "POST") {
      const contentType = request.headers.get("content-type");
      if (contentType) {
        headers["Content-Type"] = contentType;
      }
      body = request.body;
    }
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // @ts-ignore - dupex: 'half' is a node-fetch specific option, might not be needed for native fetch but useful for debugging streams
      duplex: "half"
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying images request`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
const GET = handler;
const POST = handler;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
