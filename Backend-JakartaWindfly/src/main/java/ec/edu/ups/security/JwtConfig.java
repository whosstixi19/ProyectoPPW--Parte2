package ec.edu.ups.security;

import jakarta.enterprise.context.ApplicationScoped;

/**
 * Configuración para JWT (JSON Web Token)
 * Almacena constantes y configuración para la generación y validación de tokens
 */
@ApplicationScoped
public class JwtConfig {
    
    // IMPORTANTE: En producción, esta clave debe estar en variables de entorno o archivo de configuración seguro
    // Esta clave debe tener al menos 256 bits (32 caracteres) para HS256
    private static final String SECRET_KEY = "mi-super-secreto-para-jwt-2026-proyecto-ppw-ups-ecuador-seguridad";
    
    // Tiempo de expiración del token: 24 horas (en milisegundos)
    private static final long EXPIRATION_TIME = 86400000; // 24 * 60 * 60 * 1000
    
    // Prefijo del token en el header Authorization
    private static final String TOKEN_PREFIX = "Bearer ";
    
    // Nombre del header donde se envía el token
    private static final String HEADER_STRING = "Authorization";
    
    // Issuer del token (quien emite el token)
    private static final String ISSUER = "UPS-PPW-Sistema";
    
    public String getSecretKey() {
        return SECRET_KEY;
    }
    
    public long getExpirationTime() {
        return EXPIRATION_TIME;
    }
    
    public String getTokenPrefix() {
        return TOKEN_PREFIX;
    }
    
    public String getHeaderString() {
        return HEADER_STRING;
    }
    
    public String getIssuer() {
        return ISSUER;
    }
}
