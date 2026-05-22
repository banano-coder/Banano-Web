export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const targetUrl = `${externalApiBase}/bulk/parse-file`;
    const contentType = request.headers.get("content-type");
    const headers = {
      "Authorization": `Bearer ${token}`
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: request.body,
      // @ts-ignore
      duplex: "half"
    });
    const data = await response.text();
    console.log("PARSE FILE RESPONSE DATA START ====================");
    console.log(data);
    console.log("PARSE FILE RESPONSE DATA END ====================");
    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying bulk parse-file`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
