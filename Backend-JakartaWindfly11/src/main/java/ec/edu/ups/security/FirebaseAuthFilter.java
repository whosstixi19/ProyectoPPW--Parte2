package ec.edu.ups.security;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import jakarta.inject.Inject;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filtro para validar tokens de Firebase en todas las peticiones API
 * 
 * Rutas protegidas: /api/*
 * Rutas excluidas: /api/auth/*, /api/public/*
 * 
 * @author Jose Tixi, Angel Cardenas
 * @version 1.0
 */
@WebFilter(urlPatterns = {"/api/*"})
public class FirebaseAuthFilter implements Filter {

    @Inject
    private FirebaseService firebaseService;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("🔒 FirebaseAuthFilter inicializado");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Configurar CORS
        httpResponse.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");

        // Permitir preflight OPTIONS
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = httpRequest.getRequestURI();
        
        // Rutas que no requieren autenticación
        if (path.contains("/api/auth/") || path.contains("/api/public/")) {
            chain.doFilter(request, response);
            return;
        }

        // Obtener token del header Authorization
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("{\"error\": \"Token no proporcionado\"}");
            return;
        }

        String token = authHeader.substring(7); // Remover "Bearer "

        try {
            // Validar token con Firebase
            FirebaseToken decodedToken = firebaseService.verifyToken(token);

            // Agregar información del usuario al request
            httpRequest.setAttribute("uid", decodedToken.getUid());
            httpRequest.setAttribute("email", decodedToken.getEmail());
            httpRequest.setAttribute("firebase_token", decodedToken);

            // Continuar con la petición
            chain.doFilter(request, response);

        } catch (FirebaseAuthException e) {
            System.err.println("❌ Token Firebase inválido: " + e.getMessage());
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("{\"error\": \"Token inválido o expirado\"}");
        } catch (Exception e) {
            System.err.println("❌ Error al validar token: " + e.getMessage());
            httpResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            httpResponse.getWriter().write("{\"error\": \"Error interno del servidor\"}");
        }
    }

    @Override
    public void destroy() {
        System.out.println("🔓 FirebaseAuthFilter destruido");
    }
}
