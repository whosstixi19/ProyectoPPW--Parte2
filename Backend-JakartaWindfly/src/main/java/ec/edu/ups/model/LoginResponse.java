package ec.edu.ups.model;

/**
 * Clase para representar la respuesta del login
 */
public class LoginResponse {
    private String token;
    private String uid;
    private String email;
    private String displayName;
    private String role;
    private long expiresIn; // En milisegundos
    
    public LoginResponse() {
    }
    
    public LoginResponse(String token, String uid, String email, String displayName, String role, long expiresIn) {
        this.token = token;
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.expiresIn = expiresIn;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
