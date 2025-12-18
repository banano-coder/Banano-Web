import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ message: 'Email, password, and username are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In a real application, you would save the new user to a database
    console.log(`New user registered: ${username} (${email})`);

    return new Response(JSON.stringify({ message: 'Registration successful' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
