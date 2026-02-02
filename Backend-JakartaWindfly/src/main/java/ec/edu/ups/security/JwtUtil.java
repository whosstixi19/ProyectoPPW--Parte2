package ec.edu.ups.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Date;

/**
 * Utilidad para generar y validar tokens JWT
 */
@ApplicationScoped
public class JwtUtil {
    
    @Inject
    private JwtConfig jwtConfig;
    
    /**
     * Genera un token JWT para un usuario
     * @param email Email del usuario
     * @param uid UID del usuario
     * @param role Rol del usuario
     * @return Token JWT generado
     */
    public String generateToken(String email, String uid, String role) {
        Algorithm algorithm = Algorithm.HMAC256(jwtConfig.getSecretKey());
        
        return JWT.create()
                .withIssuer(jwtConfig.getIssuer())
                .withSubject(uid)
                .withClaim("email", email)
                .withClaim("role", role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + jwtConfig.getExpirationTime()))
                .sign(algorithm);
    }
    
    /**
     * Valida un token JWT
     * @param token Token a validar
     * @return DecodedJWT si el token es válido
     * @throws JWTVerificationException si el token no es válido
     */
    public DecodedJWT validateToken(String token) throws JWTVerificationException {
        Algorithm algorithm = Algorithm.HMAC256(jwtConfig.getSecretKey());
        
        return JWT.require(algorithm)
                .withIssuer(jwtConfig.getIssuer())
                .build()
                .verify(token);
    }
    
    /**
     * Extrae el UID del usuario desde el token
     * @param token Token JWT
     * @return UID del usuario
     */
    public String getUidFromToken(String token) {
        DecodedJWT jwt = validateToken(token);
        return jwt.getSubject();
    }
    
    /**
     * Extrae el email del usuario desde el token
     * @param token Token JWT
     * @return Email del usuario
     */
    public String getEmailFromToken(String token) {
        DecodedJWT jwt = validateToken(token);
        return jwt.getClaim("email").asString();
    }
    
    /**
     * Extrae el rol del usuario desde el token
     * @param token Token JWT
     * @return Rol del usuario
     */
    public String getRoleFromToken(String token) {
        DecodedJWT jwt = validateToken(token);
        return jwt.getClaim("role").asString();
    }
    
    /**
     * Verifica si el token ha expirado
     * @param token Token JWT
     * @return true si el token ha expirado, false en caso contrario
     */
    public boolean isTokenExpired(String token) {
        try {
            DecodedJWT jwt = validateToken(token);
            return jwt.getExpiresAt().before(new Date());
        } catch (JWTVerificationException e) {
            return true;
        }
    }
}
