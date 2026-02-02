package ec.edu.ups.Services;

import ec.edu.ups.security.FirebaseService;
import com.google.firebase.auth.FirebaseToken;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;

/**
 * Servicio REST para autenticación usando Firebase
 * NO genera tokens JWT propios, solo valida tokens de Firebase
 */
@Path("auth")
public class AuthService {
    
    @Inject
    private FirebaseService firebaseService;
    
    /**
     * Endpoint para verificar un token de Firebase
     * 
     * @param authHeader Header de Authorization con el token de Firebase
     * @return Información del usuario autenticado
     */
    @GET
    @Path("/verify")
    @Produces("application/json")
    public Response verifyToken(@HeaderParam("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new Error(401, "Token no proporcionado", authHeader))
                    .build();
            }
            
            String token = authHeader.substring(7);
            FirebaseToken decodedToken = firebaseService.verifyToken(token);
            
            // Retornar información del usuario
            return Response.ok()
                .entity(new UserInfo(
                    decodedToken.getUid(),
                    decodedToken.getEmail(),
                    decodedToken.getName()
                ))
                .build();
                
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new Error(401, "Token inválido", e.getMessage()))
                .build();
        }
    }
    
    /**
     * Clase interna para respuesta de información de usuario
     */
    public static class UserInfo {
        public String uid;
        public String email;
        public String name;
        
        public UserInfo(String uid, String email, String name) {
            this.uid = uid;
            this.email = email;
            this.name = name;
        }
    }
}
