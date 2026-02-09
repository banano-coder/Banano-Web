import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ message: 'El correo, la contraseña y el nombre de usuario son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In a real application, you would save the new user to a database
    console.log(`Nuevo usuario registrado: ${username} (${email})`);

    return new Response(JSON.stringify({ message: 'Registro exitoso' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Ocurrió un error en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
