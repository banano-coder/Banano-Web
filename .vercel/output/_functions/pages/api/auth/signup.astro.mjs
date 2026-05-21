export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ message: "Unsupported Media Type. Expected application/json." }), {
      status: 415,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const body = await request.json();
    let { email, password, nombre } = body;
    if (!email || !password || !nombre) {
      return new Response(JSON.stringify({ message: "Nombre, email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    email = email.toLowerCase();
    const externalApiBase = "http://localhost:3000/api";
    if (!externalApiBase) ;
    const response = await fetch(`${externalApiBase}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, nombre })
    });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse JSON from external API:", text);
      return new Response(JSON.stringify({ message: "Invalid response from external API" }), { status: 502 });
    }
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in /api/auth/signup:", error);
    return new Response(JSON.stringify({ message: "An internal server error occurred while processing the request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
