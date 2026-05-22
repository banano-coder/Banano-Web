export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password || !username) {
      return new Response(JSON.stringify({ message: "El correo, la contraseña y el nombre de usuario son obligatorios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`Nuevo usuario registrado: ${username} (${email})`);
    return new Response(JSON.stringify({ message: "Registro exitoso" }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Ocurrió un error en el servidor" }), {
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
