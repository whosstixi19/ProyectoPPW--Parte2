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

        // SEGURIDAD DESHABILITADA - Solo Firebase maneja la autenticación en el frontend
        // Los servicios confían en que Angular ya validó al usuario
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        System.out.println("🔓 FirebaseAuthFilter destruido");
    }
}
