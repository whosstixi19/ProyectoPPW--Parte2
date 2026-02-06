package ec.edu.ups.security;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Servicio para inicialización y validación de Firebase
 * 
 * @author Jose Tixi, Angel Cardenas
 * @version 1.0
 */
@ApplicationScoped
public class FirebaseService {

    private static final String CREDENTIALS_PATH = "firebase-credentials.json";

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FileInputStream serviceAccount = new FileInputStream(CREDENTIALS_PATH);

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("🔥 Firebase Admin SDK inicializado correctamente");
            }
        } catch (IOException e) {
            System.err.println("❌ Error al inicializar Firebase: " + e.getMessage());
            throw new RuntimeException("No se pudo inicializar Firebase", e);
        }
    }

    /**
     * Verifica y valida un token de Firebase
     * 
     * @param idToken Token JWT de Firebase
     * @return FirebaseToken decodificado con información del usuario
     * @throws FirebaseAuthException Si el token es inválido o expiró
     */
    public FirebaseToken verifyToken(String idToken) throws FirebaseAuthException {
        if (idToken == null || idToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Token no puede ser nulo o vacío");
        }

        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }

    /**
     * Obtiene el UID del usuario desde el token
     * 
     * @param idToken Token JWT de Firebase
     * @return UID del usuario
     * @throws FirebaseAuthException Si el token es inválido
     */
    public String getUserId(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyToken(idToken);
        return decodedToken.getUid();
    }

    /**
     * Obtiene el email del usuario desde el token
     * 
     * @param idToken Token JWT de Firebase
     * @return Email del usuario
     * @throws FirebaseAuthException Si el token es inválido
     */
    public String getUserEmail(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyToken(idToken);
        return decodedToken.getEmail();
    }

    /**
     * Verifica si el usuario tiene un claim específico
     * 
     * @param idToken Token JWT de Firebase
     * @param claimName Nombre del claim a verificar
     * @return Valor del claim o null si no existe
     * @throws FirebaseAuthException Si el token es inválido
     */
    public Object getUserClaim(String idToken, String claimName) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyToken(idToken);
        return decodedToken.getClaims().get(claimName);
    }
}
