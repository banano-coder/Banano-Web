export { renderers } from '../../../renderers.mjs';

const ALL = async ({ params, request }) => {
  const { id } = params;
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const targetUrl = `${externalApiBase}/brands/${id}`;
    const body = request.method !== "GET" ? await request.text() : void 0;
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body
    });
    if (response.status === 204) return new Response(null, { status: 204 });
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: response.statusText };
    }
    return new Response(JSON.stringify(data), { status: response.status, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Error proxying brands ID request:`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
