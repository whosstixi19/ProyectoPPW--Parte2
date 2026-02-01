package ec.edu.ups.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import jakarta.inject.Inject;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filtro de autenticación que valida el token JWT en cada request
 * Intercepta todas las peticiones a /api/* y verifica que tengan un token válido
 */
@WebFilter(urlPatterns = {"/api/*"})
public class JwtAuthenticationFilter implements Filter {
    
    @Inject
    private JwtUtil jwtUtil;
    
    @Inject
    private JwtConfig jwtConfig;
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Inicialización del filtro
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Permitir CORS
        httpResponse.setHeader("Access-Control-Allow-Origin", "*");
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");
        
        // Si es una petición OPTIONS (preflight), permitirla sin autenticación
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        // Excepciones: endpoints públicos que no requieren autenticación
        String path = httpRequest.getRequestURI();
        if (path.endsWith("/auth/login") || path.endsWith("/auth/register")) {
            chain.doFilter(request, response);
            return;
        }
        
        // Obtener el token del header Authorization
        String authHeader = httpRequest.getHeader(jwtConfig.getHeaderString());
        
        if (authHeader == null || !authHeader.startsWith(jwtConfig.getTokenPrefix())) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"No se proporcionó token de autenticación\"}");
            return;
        }
        
        // Extraer el token (remover el prefijo "Bearer ")
        String token = authHeader.substring(jwtConfig.getTokenPrefix().length());
        
        try {
            // Validar el token
            jwtUtil.validateToken(token);
            
            // Extraer información del token y agregarla al request
            String uid = jwtUtil.getUidFromToken(token);
            String email = jwtUtil.getEmailFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Agregar atributos al request para que los servicios puedan acceder a ellos
            httpRequest.setAttribute("uid", uid);
            httpRequest.setAttribute("email", email);
            httpRequest.setAttribute("role", role);
            
            // Continuar con la cadena de filtros
            chain.doFilter(request, response);
            
        } catch (JWTVerificationException e) {
            // Token inválido o expirado
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"Token inválido o expirado\"}");
        }
    }
    
    @Override
    public void destroy() {
        // Limpieza del filtro
    }
}
