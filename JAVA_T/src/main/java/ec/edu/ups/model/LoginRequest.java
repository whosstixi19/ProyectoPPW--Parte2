package ec.edu.ups.model;

/**
 * Clase para representar las credenciales de login
 */
public class LoginRequest {
    private String email;
    private String password;
    private String firebaseToken; // Token de Firebase del frontend
    
    public LoginRequest() {
    }
    
    public LoginRequest(String email, String password, String firebaseToken) {
        this.email = email;
        this.password = password;
        this.firebaseToken = firebaseToken;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getFirebaseToken() {
        return firebaseToken;
    }
    
    public void setFirebaseToken(String firebaseToken) {
        this.firebaseToken = firebaseToken;
    }
}
