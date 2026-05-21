export { renderers } from '../../../renderers.mjs';

const ALL = async ({ params, request }) => {
  const { path } = params;
  const url = new URL(request.url);
  const searchParams = url.search;
  const externalApiBase = "http://localhost:3000/api";
  try {
    const targetUrl = `${externalApiBase}/public/${path}${searchParams}`;
    const body = request.method !== "GET" ? await request.text() : void 0;
    const headers = {
      "Content-Type": "application/json"
    };
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying public request: ${path}`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
