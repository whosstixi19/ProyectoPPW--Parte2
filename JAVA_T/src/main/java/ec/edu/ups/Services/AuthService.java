package ec.edu.ups.Services;

import ec.edu.ups.model.LoginRequest;
import ec.edu.ups.model.LoginResponse;
import ec.edu.ups.security.JwtConfig;
import ec.edu.ups.security.JwtUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

/**
 * Servicio REST para autenticación y generación de tokens JWT
 */
@Path("auth")
public class AuthService {
    
    @Inject
    private JwtUtil jwtUtil;
    
    @Inject
    private JwtConfig jwtConfig;
    
    /**
     * Endpoint de login que genera un token JWT
     * En este ejemplo, validamos con Firebase token o credenciales básicas
     * 
     * @param loginRequest Credenciales de login
     * @return LoginResponse con el token JWT
     */
    @POST
    @Path("/login")
    @Consumes("application/json")
    @Produces("application/json")
    public Response login(LoginRequest loginRequest) {
        try {
            // En un escenario real, aquí validarías:
            // 1. Si viene firebaseToken, verificarlo contra Firebase Admin SDK
            // 2. Si vienen credenciales, verificarlas contra tu base de datos
            // 3. Obtener el rol del usuario desde tu BD
            
            // Para este ejemplo, asumimos que el frontend ya autenticó con Firebase
            // y nos envía la información del usuario
            
            if (loginRequest.getEmail() == null || loginRequest.getEmail().isEmpty()) {
                Error error = new Error(
                    400,
                    "Datos incompletos",
                    "El email es requerido");
                return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
            }
            
            // NOTA: En producción, aquí debes:
            // 1. Verificar el firebaseToken con Firebase Admin SDK
            // 2. Buscar el usuario en tu BD para obtener el rol correcto
            // 3. Validar que el usuario exista y esté activo
            
            // Por ahora, asignamos un rol por defecto
            String uid = loginRequest.getEmail().replace("@", "_").replace(".", "_");
            String role = determineUserRole(loginRequest.getEmail()); // Debes implementar esta lógica
            
            // Generar el token JWT
            String token = jwtUtil.generateToken(
                loginRequest.getEmail(),
                uid,
                role
            );
            
            // Crear la respuesta
            LoginResponse response = new LoginResponse(
                token,
                uid,
                loginRequest.getEmail(),
                loginRequest.getEmail().split("@")[0],
                role,
                jwtConfig.getExpirationTime()
            );
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            Error error = new Error(
                500,
                "Error interno",
                "Error al generar token: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Determina el rol del usuario basado en el email u otra lógica
     * TODO: Implementar lógica real consultando la base de datos
     * 
     * @param email Email del usuario
     * @return Rol del usuario
     */
    private String determineUserRole(String email) {
        // Esta es una implementación temporal
        // En producción, debes consultar tu base de datos
        
        if (email.contains("admin")) {
            return "admin";
        } else if (email.contains("programador")) {
            return "programador";
        } else {
            return "usuario";
        }
    }
    
    /**
     * Endpoint para verificar si un token es válido
     * 
     * @return Información del token si es válido
     */
    @POST
    @Path("/verify")
    @Produces("application/json")
    public Response verifyToken(@jakarta.ws.rs.core.Context jakarta.servlet.http.HttpServletRequest request) {
        try {
            // El filtro JWT ya validó el token, solo necesitamos retornar la info
            String uid = (String) request.getAttribute("uid");
            String email = (String) request.getAttribute("email");
            String role = (String) request.getAttribute("role");
            
            if (uid == null) {
                Error error = new Error(
                    401,
                    "No autorizado",
                    "Token inválido");
                return Response.status(Response.Status.UNAUTHORIZED).entity(error).build();
            }
            
            LoginResponse response = new LoginResponse(
                null, // No devolvemos el token de nuevo
                uid,
                email,
                email.split("@")[0],
                role,
                0
            );
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            Error error = new Error(
                500,
                "Error interno",
                e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
}
