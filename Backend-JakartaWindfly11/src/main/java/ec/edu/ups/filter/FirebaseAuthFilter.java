package ec.edu.ups.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filtro para validar tokens de Firebase en todas las peticiones HTTP
 * Configurado en web.xml para controlar el orden de ejecución
 */
public class FirebaseAuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("🔐 FirebaseAuthFilter inicializado");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Las peticiones OPTIONS ya son manejadas por CorsFilter
        // Solo verificar autenticación en peticiones reales
        
        // Obtener header Authorization
        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("{\"error\": \"Token de autenticación requerido\"}");
            httpResponse.setContentType("application/json");
            return;
        }

        String token = authHeader.substring(7); // Remover "Bearer "

        try {
            // Verificar token con Firebase
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();

            // Agregar información del usuario al request
            httpRequest.setAttribute("firebaseUid", uid);
            httpRequest.setAttribute("firebaseEmail", email);

            // Continuar con la petición
            chain.doFilter(request, response);

        } catch (FirebaseAuthException e) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("{\"error\": \"Token inválido o expirado: " + e.getMessage() + "\"}");
            httpResponse.setContentType("application/json");
        } catch (Exception e) {
            httpResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            httpResponse.getWriter().write("{\"error\": \"Error verificando token: " + e.getMessage() + "\"}");
            httpResponse.setContentType("application/json");
        }
    }

    @Override
    public void destroy() {
        System.out.println("🔐 FirebaseAuthFilter destruido");
    }
}
