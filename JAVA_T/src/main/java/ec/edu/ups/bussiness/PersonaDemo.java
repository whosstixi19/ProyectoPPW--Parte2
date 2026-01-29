package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.PersonaDAO;
import ec.edu.ups.model.Persona;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class PersonaDemo {
	@Inject
	private PersonaDAO daoPersona;

	@PostConstruct
	public void init() {
	    Persona p = new Persona();
	    p.setCedula("0102551876");
	    p.setNombre("Michelle");
	    p.setDireccion("Cuenca");
	    
	    Persona p2 = new Persona();
	    p2.setCedula("0102551877");
	    p2.setNombre("Andrea");
	    p2.setDireccion("Quito");

	    Persona p3 = new Persona();
	    p3.setCedula("0102551878");
	    p3.setNombre("Carlos");
	    p3.setDireccion("Guayaquil");

	    daoPersona.insert(p);
	    daoPersona.insert(p2);
	    daoPersona.insert(p3);

	    System.out.println(" Personas insertadas correctamente");
	    List<Persona>persona = daoPersona.getAll();
	    for(Persona x:persona) {
	        System.out.println("Persona"+ x);
	        System.out.println("Cedula: " + x.getCedula());
	        System.out.println("Nombre: " + x.getNombre());
	        System.out.println("Direccion: " + x.getDireccion());
	    }
	    
	        
	}
}
