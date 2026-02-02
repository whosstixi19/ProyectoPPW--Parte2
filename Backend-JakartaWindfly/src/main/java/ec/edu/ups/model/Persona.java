package ec.edu.ups.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name= "persona")
public class Persona {
	@Id
	@Column(name = "per_cedula")
	private String cedula;

	@Column(name = "per_nombre")
	private String nombre;

	@Column(name = "per_direccion")
	private String direccion;

	 private String email;
	 private String password;
	 private boolean enabled;

	 public Persona() {
	   }

	 public Persona(String cedula, String nombre, String direccion, String email, String password, boolean enabled) {
	        this.cedula = cedula;
	        this.nombre = nombre;
	        this.direccion = direccion;
	        this.email = email;
	        this.password = password;
	        this.enabled = enabled;
	    }


	 public String getCedula() {
	        return cedula;
	    }

	    public void setCedula(String cedula) {
	        this.cedula = cedula;
	    }

	    public String getNombre() {
	        return nombre;
	    }

	    public void setNombre(String nombre) {
	        this.nombre = nombre;
	    }

	    public String getDireccion() {
	        return direccion;
	    }

	    public void setDireccion(String direccion) {
	        this.direccion = direccion;
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

	    public boolean isEnabled() {
	        return enabled;
	    }

	    public void setEnabled(boolean enabled) {
	        this.enabled = enabled;
	    }

	    // MÉTODOS
	    @Override
	    public String toString() {
	        return "Usuario{" +
	                "cedula='" + cedula + '\'' +
	                ", nombre='" + nombre + '\'' +
	                ", email='" + email + '\'' +
	                '}';
	    }
}
