package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.PersonaDAO;
import ec.edu.ups.model.Persona;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

@Stateless
public class GestionPersonas {
	@Inject
	private PersonaDAO daoPersona;

	public List<Persona> getPersona(){
	    return daoPersona.getAll();
	}

	public Persona getPersona(String id) throws Exception {
	    if(id.isEmpty() || id.length()!= 10)
	        throw new Exception("Parámetro incorrecto");
	    
	    Persona  p = daoPersona.read(id);
	    return p;
	}

	public void crearPersona(Persona persona) throws Exception {
	    if(persona.getCedula().length() != 10)
	        throw new Exception("Formato de cedula incorrecto");
	    
	    daoPersona.insert(persona);
	}

	public void actualizarPersona(Persona persona) throws Exception {
	    if(persona.getCedula().length() != 10)
	        throw new Exception("Formato de cedula incorrecto");

	    daoPersona.update(persona);
	}
}
