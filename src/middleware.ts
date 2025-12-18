import { defineMiddleware } from "astro:middleware";

// NOTE: We no longer import API_ENDPOINTS here. The middleware should only
// interact with its own server's API routes (the proxies).

const PUBLIC_ROUTES = ["/", "/login", "/register"];

// This function now calls our *local* proxy endpoint, not the real API.
async function validateToken(token: string, host: string): Promise<boolean> {
  try {
    // Construct the full URL for the local API endpoint
    const validationUrl = `${host}/api/auth/me`;

    const response = await fetch(validationUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Token validation fetch error in middleware:', error);
    return false;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const currentPath = url.pathname;

  // Allow access to public routes and local API routes
  if (PUBLIC_ROUTES.includes(currentPath) || currentPath.startsWith('/api/')) {
    // A crucial check: If the request is FOR an API route, let it pass.
    // The API routes themselves will handle the logic.
    return next();
  }

  const token = cookies.get('token')?.value;

  if (!token) {
    return redirect("/login");
  }
  
  // We need to pass the request's host to the validation function
  // so it knows which server to call (e.g., localhost:4321)
  const host = url.origin;

  const isTokenValid = await validateToken(token, host);

  if (isTokenValid) {
    return next();
  } else {
    cookies.delete('token', { path: '/' });
    return redirect("/login");
  }
});
