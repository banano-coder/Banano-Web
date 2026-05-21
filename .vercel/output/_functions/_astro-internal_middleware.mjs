import { d as defineMiddleware, s as sequence } from './chunks/index_CgVeXjal.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_Dy7zPn2-.mjs';
import 'cookie';

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const validateToken = async (token) => {
  const externalApiBase = "http://localhost:3000/api";
  try {
    const response = await fetch(`${externalApiBase}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const currentPath = url.pathname;
  const isPublicAsset = currentPath.startsWith("/uploads/") || currentPath.startsWith("/icons/") || currentPath.endsWith(".svg") || currentPath.endsWith(".png") || currentPath.endsWith(".jpg") || currentPath.endsWith(".webp");
  if (PUBLIC_ROUTES.includes(currentPath) || currentPath.startsWith("/api/") || isPublicAsset) {
    return next();
  }
  const token = cookies.get("token")?.value;
  if (!token) {
    return redirect("/login");
  }
  const isTokenValid = await validateToken(token);
  if (isTokenValid) {
    return next();
  } else {
    cookies.delete("token", { path: "/" });
    return redirect("/login");
  }
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
