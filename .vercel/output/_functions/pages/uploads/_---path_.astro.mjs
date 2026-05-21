export { renderers } from '../../renderers.mjs';

const GET = async ({ params, request }) => {
  const externalApiBase = "http://localhost:3000/api";
  const baseUrl = externalApiBase.replace(/\/api$/, "");
  const { path } = params;
  if (!path) {
    return new Response("Not Found", { status: 404 });
  }
  const targetUrl = `${baseUrl}/uploads/${path}`;
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new Response("File Not Found on Backend", { status: response.status });
    }
    const blob = await response.blob();
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error(`Error manual-proxying upload: ${path}`, error);
    return new Response("Internal Server Error Proxying File", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
