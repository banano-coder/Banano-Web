import { defineMiddleware } from "astro:middleware";

// NOTE: We no longer import API_ENDPOINTS here. The middleware should only
// interact with its own server's API routes (the proxies).

const PUBLIC_ROUTES = ["/", "/login", "/register"];

// This function now calls our *external* validation endpoint.
const validateToken = async (token: string): Promise<boolean> => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    if (!externalApiBase) {
      console.error("PUBLIC_EXTERNAL_API_BASE is not defined.");
      return false;
    }

    try {
        const response = await fetch(`${externalApiBase}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Token validation error:", error);
        return false;
    }
};

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
  
  const isTokenValid = await validateToken(token);

  if (isTokenValid) {
    return next();
  } else {
    cookies.delete('token', { path: '/' });
    return redirect("/login");
  }
});
